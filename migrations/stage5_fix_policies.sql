-- Remove leftover wide-open "public" write policies on products (security hole).
drop policy if exists "Allow public read" on public.products;
drop policy if exists "Allow public insert" on public.products;
drop policy if exists "Allow public update" on public.products;
drop policy if exists "Allow public delete" on public.products;

-- Keep: products_select_all (public read) + products_write_admin (admin write).
-- Clean up diagnostic row.
delete from public.products where name = 'DIAG_TEST';

select polname, polcmd, pg_get_expr(polqual, polrelid) as using_expr,
       pg_get_expr(polwithcheck, polrelid) as check_expr
from pg_policy where polrelid = 'public.products'::regclass;
