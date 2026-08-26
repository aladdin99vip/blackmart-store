-- Check the admins policies now, and test is_admin() as the actual role.
select polname, polcmd, pg_get_expr(polqual, polrelid) as using_expr
from pg_policy where polrelid = 'public.admins'::regclass;

-- Simulate: set the role/uid the way PostgREST does, then call is_admin().
-- We impersonate the super-admin's uid.
set local role authenticated;
select set_config('request.jwt.claims',
  json_build_object('sub','3da97e4a-1bc4-4a4d-8017-b092fa24f745','role','authenticated')::text,
  true);
select public.is_admin() as is_admin_result,
       public.is_super_admin() as is_super_result,
       auth.uid() as resolved_uid;
reset role;
