-- Test is_admin() with the claim style that actually resolves auth.uid().
select set_config('request.jwt.claim.sub','3da97e4a-1bc4-4a4d-8017-b092fa24f745', true);
select
  auth.uid() as uid,
  public.is_admin() as is_admin,
  public.is_super_admin() as is_super,
  (select count(*) from public.admins) as admin_rows_visible_to_definer;
