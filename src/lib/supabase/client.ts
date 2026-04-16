import { createBrowserClient } from "@supabase/ssr";
import { type Database } from "@/types/database";
import { type SupabaseClient } from "@supabase/supabase-js";

const createRecursiveMock = (): any => {
  const fn = () => createRecursiveMock();
  fn.data = { user: null };
  fn.error = null;
  fn.count = 0;
  return new Proxy(fn, {
    get: (target: any, prop: string) => {
      if (prop === "then") return undefined;
      return target[prop] ?? createRecursiveMock();
    },
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
