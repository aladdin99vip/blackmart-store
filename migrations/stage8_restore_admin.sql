-- Confirm state and restore the super-admin row for the CURRENT auth user.
-- The admins table is empty; the auth user exists with id 3da97e4a...
select 'auth user' as what, id::text, email from auth.users where email = 'aladdin99vip@gmail.com'
union all
select 'admins count', count(*)::text, '' from public.admins;

-- Insert the super-admin row bound to the real, working auth user id.
insert into public.admins (id, name, role)
select id, 'Alvin', 'super' from auth.users where email = 'aladdin99vip@gmail.com'
on conflict (id) do update set role = 'super', name = excluded.name;

-- Verify
select id, name, role from public.admins;
