import { createBrowserClient } from "@supabase/ssr";
import { type Database } from "@/types/database";
import { type SupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a proxy that returns mock results for any property access
    return new Proxy({} as any, {
      get: () => () => ({
        data: null,
        error: null,
        count: 0,
        select: () => ({ data: null, error: null, count: 0 }),
        from: () => ({ select: () => ({ data: null, error: null, count: 0 }) }),
      }),
    }) as SupabaseClient<Database>;
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  ) as SupabaseClient<Database>;
}
