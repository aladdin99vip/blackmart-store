-- Stage 3: Stock / inventory tracking
-- Add a stock column to products (default 0, non-negative).

alter table public.products
  add column if not exists stock integer not null default 0;

-- Give the existing 10 seeded products a starting stock so they're visible/sellable.
update public.products set stock = 100 where stock = 0;

-- Atomic stock decrement helper used at checkout.
-- Only decrements if enough stock; returns the new stock or -1 if insufficient.
create or replace function public.decrement_stock(p_id bigint, p_qty integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new integer;
begin
  update public.products
    set stock = stock - p_qty
    where id = p_id and stock >= p_qty
    returning stock into v_new;
  if v_new is null then
    return -1;
  end if;
  return v_new;
end $$;

grant execute on function public.decrement_stock(bigint, integer) to anon, authenticated;
