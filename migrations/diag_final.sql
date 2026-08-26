-- Test everything in ONE statement so set_config persists to the function call.
with cfg as (
  select set_config('request.jwt.claim.sub','3da97e4a-1bc4-4a4d-8017-b092fa24f745', true)
)
select
  (select set_config('request.jwt.claim.sub','3da97e4a-1bc4-4a4d-8017-b092fa24f745', true)),
  auth.uid() as uid,
  (select exists(select 1 from public.admins a where a.id = auth.uid())) as inline_exists,
  (select count(*) from public.admins) as total_rows;
