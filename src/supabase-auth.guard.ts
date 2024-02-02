import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  Optional,
  UnauthorizedException,
} from "@nestjs/common";
import { SupabaseClient, User, createClient } from "@supabase/supabase-js";
import { Request } from "express";

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  supabaseClient;
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor(@Optional() @Inject("SUPABASE_CLIENT") client?: SupabaseClient) {
    this.supabaseClient = client || this.initializeSupabaseClient();
  }

  private initializeSupabaseClient(): SupabaseClient {
    this.logger.debug("Supabase auth guard initializing new Supabase client.");
    if (!process.env.SUPABASE_URL) {
      throw new Error(
        "Supabase Auth environment variable: SUPABASE_URL is not set."
      );
    }
    if (!process.env.SUPABASE_ANON_KEY) {
      throw new Error(
        "Supabase Auth environment variable: SUPABASE_ANON_KEY is not set."
      );
    }

    return createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = await this.authenticateRequest(request);
    request.authUser = user;
    return true;
  }

  async authenticateRequest(request: any): Promise<User> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException(`No token provided`);
    }

    const user = await this.getUserFromJWT(token);
    if (!user) {
      throw new UnauthorizedException(`Invalid token`);
    }

    return user;
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" && token != "undefined" ? token : undefined;
  }

  async getUserFromJWT(token: string): Promise<User | undefined> {
    const response = await this.supabaseClient.auth.getUser(token);
    if (!response.data.user) {
      return undefined;
    }
    return response.data.user;
  }
}
