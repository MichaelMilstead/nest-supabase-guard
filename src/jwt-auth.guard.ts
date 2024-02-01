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
export class JWTAuthGuard implements CanActivate {
  supabaseClient;
  private readonly logger = new Logger(JWTAuthGuard.name);

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
    request.user = user;
    return true;
  }

  private async authenticateRequest(request: any): Promise<User> {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.error(`No token provided`);
      throw new UnauthorizedException(`No token provided`);
    }

    const user = await this.getUserFromJWT(token);
    if (!user) {
      this.logger.error(`Invalid token: ${token}`);
      throw new UnauthorizedException(`Invalid token`);
    }

    return user;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" && token != "undefined" ? token : undefined;
  }

  async getUserFromJWT(token: string): Promise<User> {
    const response = await this.supabaseClient.auth.getUser(token);
    if (!response.data.user) {
      throw new Error("User not found in Supabase for the given token");
    }
    return response.data.user;
  }
}
