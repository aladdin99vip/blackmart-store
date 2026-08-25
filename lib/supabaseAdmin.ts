import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service role key.
// NEVER import this into client components. Used only in API routes.
// Lazily created so a missing key doesn't crash the build.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://grfajbnfzdwgxpxcdpsc.supabase.co";

let _client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_client) return _client;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  _client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return _client;
}
