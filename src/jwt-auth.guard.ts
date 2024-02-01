import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from "@nestjs/common";
import { SupabaseTokenService } from "./supabase-token.service";

@Injectable()
export class JWTAuthGuard implements CanActivate {
  private readonly logger = new Logger(JWTAuthGuard.name);
  constructor(private readonly supabaseTokenService: SupabaseTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return true;
  }
}
