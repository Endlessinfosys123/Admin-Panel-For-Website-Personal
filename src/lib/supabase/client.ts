import { createBrowserClient } from "@supabase/ssr";
import { type Database } from "@/types/database";
import { type SupabaseClient } from "@supabase/supabase-js";

const createRecursiveMock = (): any => {
  const fn = () => createRecursiveMock();
  return new Proxy(fn, {
    get: (target: any, prop: string) => {
      if (prop === "then") return undefined;
      if (prop === "data") return { user: null };
      if (prop === "error") return null;
      if (prop === "count") return 0;
      return createRecursiveMock();
    },
    apply: () => createRecursiveMock(),
  });
};

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return createRecursiveMock() as SupabaseClient<Database>;
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  ) as SupabaseClient<Database>;
}
