-- Root fix: security-definer permission functions must bypass RLS on admins.
-- The functions are owned by postgres (superuser/table owner). We make them
-- explicitly bypass RLS by querying within a definer that owns the table, and
-- we ensure the owner is a role not forced through RLS.

-- Recreate the helpers owned by postgres, which bypasses RLS as table owner.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.id = auth.uid());
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a where a.id = auth.uid() and a.role = 'super'
  );
$$;

create or replace function public.can_manage_orders()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where a.id = auth.uid() and a.role in ('super', 'shipping')
  );
$$;

-- Ensure functions are owned by postgres (table owner) so definer bypasses RLS.
alter function public.is_admin() owner to postgres;
alter function public.is_super_admin() owner to postgres;
alter function public.can_manage_orders() owner to postgres;

-- Also allow the admins table owner to bypass: force RLS should NOT be on.
alter table public.admins no force row level security;
alter table public.products no force row level security;
alter table public.orders no force row level security;

-- Verify with the super-admin uid.
select set_config('request.jwt.claim.sub','3da97e4a-1bc4-4a4d-8017-b092fa24f745', true);
select auth.uid() as uid,
       public.is_admin() as is_admin,
       public.is_super_admin() as is_super;
