import { Injectable } from "@nestjs/common";
import { User, createClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseTokenService {
  supabase;
  constructor() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      throw new Error("Supabase Auth environment variables not set");
    }
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  async getUserFromJWT(token: string): Promise<User> {
    const response = await this.supabase.auth.getUser(token);
    if (!response.data.user) {
      throw new Error("User not found in Supabase for the given token");
    }
    return response.data.user;
  }
}
