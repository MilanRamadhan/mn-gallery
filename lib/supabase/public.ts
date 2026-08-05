import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_DB_SCHEMA } from "./config";
import { getSupabaseEnv } from "./env";

export function createPublicClient() {
  const env = getSupabaseEnv();
  if (!env) return null;

  return createSupabaseClient(env.url, env.key, {
    db: { schema: SUPABASE_DB_SCHEMA },
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
