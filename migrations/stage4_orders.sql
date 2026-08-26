-- Stage 4: Orders
-- orders table: snapshot of customer + delivery info + items at time of purchase.

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  address text not null,
  items jsonb not null,
  total numeric not null,
  status text not null default 'new'
    check (status in ('new', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

-- Helper: can current user manage orders (super or shipping role)?
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

-- Customers can insert their own orders
drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (auth.uid() = customer_id);

-- Customers can read their own orders; order-managers can read all
drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin" on public.orders
  for select using (
    auth.uid() = customer_id or public.can_manage_orders()
  );

-- Order-managers (super/shipping) can update order status
drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin" on public.orders
  for update using (public.can_manage_orders());
