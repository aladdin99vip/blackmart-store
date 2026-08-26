-- Inspect the function bodies and confirm the admin row exists.
select proname, prosecdef, pg_get_functiondef(oid) as def
from pg_proc where proname in ('is_admin','is_super_admin') and pronamespace = 'public'::regnamespace;

-- Confirm the super-admin row actually exists (service role bypasses RLS)
select id, name, role from public.admins;

-- Test auth.uid() resolution with proper claim setting
select set_config('request.jwt.claim.sub','3da97e4a-1bc4-4a4d-8017-b092fa24f745', true);
select auth.uid() as uid_via_claim_sub;
