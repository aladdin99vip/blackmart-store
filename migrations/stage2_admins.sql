-- Stage 2: Admin auth + roles
-- admins table keyed to auth.users, with role: super | inventory | shipping

create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'inventory'
    check (role in ('super', 'inventory', 'shipping')),
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Helper: is the current user an admin (any role)?
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.id = auth.uid());
$$;

-- Helper: is the current user a super admin?
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

-- Any admin can read the admin roster (needed to check their own role)
drop policy if exists "admins_select" on public.admins;
create policy "admins_select" on public.admins
  for select using (public.is_admin());

-- Only super admins can create/update/delete admin accounts
drop policy if exists "admins_insert_super" on public.admins;
create policy "admins_insert_super" on public.admins
  for insert with check (public.is_super_admin());

drop policy if exists "admins_update_super" on public.admins;
create policy "admins_update_super" on public.admins
  for update using (public.is_super_admin());

drop policy if exists "admins_delete_super" on public.admins;
create policy "admins_delete_super" on public.admins
  for delete using (public.is_super_admin());

-- Lock down products: public can read, only admins can write.
alter table public.products enable row level security;

drop policy if exists "products_select_all" on public.products;
create policy "products_select_all" on public.products
  for select using (true);

drop policy if exists "products_write_admin" on public.products;
create policy "products_write_admin" on public.products
  for all using (public.is_admin()) with check (public.is_admin());
