import { createClient } from "@supabase/supabase-js";

// Public anon credentials. The anon key is designed to be exposed in the
// client bundle, so these are safe as build-time fallbacks. This guarantees
// the app connects even if Vercel env vars fail to inline during build.
const FALLBACK_SUPABASE_URL = "https://grfajbnfzdwgxpxcdpsc.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "sb_publishable_z-4IJevaYZ_STKZvgTRkYQ_PFimnjFz";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
