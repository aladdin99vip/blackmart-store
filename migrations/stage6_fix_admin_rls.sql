-- Fix circular RLS on admins: is_admin() reads admins, but admins_select
-- required is_admin() -> deadlock. Allow users to read their OWN admin row.

drop policy if exists "admins_select" on public.admins;

-- A user can always read their own admin row (breaks the recursion).
create policy "admins_select_own" on public.admins
  for select using (auth.uid() = id);

-- Super admins can additionally read the full roster.
create policy "admins_select_super" on public.admins
  for select using (public.is_super_admin());

-- Verify: is_super_admin() also reads admins; make sure it can see own row now.
-- (is_super_admin is security definer, but the recursion was in the select policy.)
select 'policies fixed' as status;
