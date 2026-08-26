-- Remove the hand-crafted (broken) auth user so it can be recreated via Admin API.
delete from public.admins where id in (
  select id from auth.users where email = 'aladdin99vip@gmail.com'
);
delete from auth.identities where user_id in (
  select id from auth.users where email = 'aladdin99vip@gmail.com'
);
delete from auth.users where email = 'aladdin99vip@gmail.com';
select count(*) as remaining from auth.users where email = 'aladdin99vip@gmail.com';
