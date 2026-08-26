import { createClient } from "@supabase/supabase-js";

// Browser-side Supabase client dedicated to the ADMIN area.
// It uses a separate storageKey so the admin session never collides with
// the customer session (which uses the default client in lib/supabase.ts).
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://grfajbnfzdwgxpxcdpsc.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_pub…njFz";

export const supabaseAdminAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: "blackmart-admin-auth",
    persistSession: true,
    autoRefreshToken: true,
  },
});
