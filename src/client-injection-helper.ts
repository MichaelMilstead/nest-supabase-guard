import { SupabaseClient } from "@supabase/supabase-js";

export const customSupabaseClientProvider = (
  supabaseClient: SupabaseClient
) => {
  return {
    provide: "SUPABASE_CLIENT",
    useFactory: () => supabaseClient,
  };
};
