-- Create the super-admin auth user + admins row directly in the DB.
-- Uses pgcrypto crypt() for the password hash, matching Supabase GoTrue.

create extension if not exists pgcrypto;

do $$
declare
  v_uid uuid;
  v_email text := 'aladdin99vip@gmail.com';
  v_password text := 'alvinster12345';
  v_name text := 'Alvin';
begin
  -- If the user already exists, reuse it; else create.
  select id into v_uid from auth.users where email = v_email;

  if v_uid is null then
    v_uid := gen_random_uuid();
    insert into auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_uid, 'authenticated', 'authenticated', v_email,
      crypt(v_password, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
      now(), now()
    );

    -- Identity row (required by GoTrue for email logins)
    insert into auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_uid,
      jsonb_build_object('sub', v_uid::text, 'email', v_email),
      'email', v_email, now(), now(), now()
    );
  else
    -- Ensure password + confirmation are set as expected
    update auth.users
      set encrypted_password = crypt(v_password, gen_salt('bf')),
          email_confirmed_at = coalesce(email_confirmed_at, now()),
          updated_at = now()
      where id = v_uid;
  end if;

  -- Upsert the admin profile row as super
  insert into public.admins (id, name, role)
  values (v_uid, v_name, 'super')
  on conflict (id) do update set role = 'super', name = excluded.name;
end $$;

select id, email, email_confirmed_at is not null as confirmed
from auth.users where email = 'aladdin99vip@gmail.com';
