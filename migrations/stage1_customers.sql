-- Stage 1: Customer auth + private profiles
-- customers profile table linked 1:1 to auth.users

create table if not exists public.customers (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

alter table public.customers enable row level security;

-- Each customer can read/insert/update only their own profile row
drop policy if exists "customers_select_own" on public.customers;
create policy "customers_select_own" on public.customers
  for select using (auth.uid() = id);

drop policy if exists "customers_insert_own" on public.customers;
create policy "customers_insert_own" on public.customers
  for insert with check (auth.uid() = id);

drop policy if exists "customers_update_own" on public.customers;
create policy "customers_update_own" on public.customers
  for update using (auth.uid() = id);
