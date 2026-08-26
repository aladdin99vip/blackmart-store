-- Inspect RLS state on products and the is_admin function
select relname, relrowsecurity as rls_enabled
from pg_class where relname = 'products';

select polname, polcmd, pg_get_expr(polqual, polrelid) as using_expr,
       pg_get_expr(polwithcheck, polrelid) as check_expr
from pg_policy
where polrelid = 'public.products'::regclass;

-- Does the admins row for the super-admin exist and have role super?
select id, name, role from public.admins;
