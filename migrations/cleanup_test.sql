-- Remove all e2e test data and restore product stock.
delete from public.orders where customer_name = 'Test Customer';
delete from public.customers where phone = '+60123456789';
delete from auth.identities where user_id in (
  select id from auth.users where email = 'testcustomer@example.com'
);
delete from auth.users where email = 'testcustomer@example.com';
-- Restore Product 1 stock to 100
update public.products set stock = 100 where id = 2;
select
  (select count(*) from public.orders) as orders_remaining,
  (select stock from public.products where id = 2) as product1_stock;
