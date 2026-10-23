-- More sample WYDs for the demo, from men, women and a non-binary member, across all four audiences.
-- Adds Kiran Rao (non-binary, initials photo in public/demo/kiran.png). Safe to re-run: Kiran is
-- upserted and these exact WYDs are replaced. No notifications are sent.

with u as (
  insert into auth.users (
    id, instance_id, aud, role, email, email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token
  ) values (
    md5('kiran.demo@example.com')::uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'kiran.demo@example.com', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"demo":true}', false, false,
    '', '', '', '', '', '', '', ''
  ) on conflict (id) do nothing returning id
)
insert into public.profiles (id, name, dob, gender, photo_url, social_url, bio, interests, city, area, status, rejection_reason, photo_check)
select md5('kiran.demo@example.com')::uuid, 'Kiran Rao', make_date(extract(year from now())::int - 24, 3, 9), 'non_binary',
       '/demo/kiran.png', 'https://instagram.com/kiran.wyd.demo',
       'Illustrator and plant parent. I sketch in parks, read a lot of queer fiction and volunteer at an animal shelter on weekends. Always up for a slow café afternoon.',
       '{books,art_museums,coffee_cafes,volunteering,walking}', 'Bengaluru', 'Indiranagar', 'approved', null,
       '{"skipped": true, "path": "demo seed"}'::jsonb
on conflict (id) do update set name = excluded.name, gender = excluded.gender, photo_url = excluded.photo_url,
  bio = excluded.bio, interests = excluded.interests, city = excluded.city, area = excluded.area, status = 'approved';

with w(email, body, audience, tags, city, area, mins) as (values
  ('ria.demo@example.com', 'Sunday flea market on Church Street, anyone want to browse together? Coffee after.', 'all', '{shopping,exploring_city}', 'Bengaluru', 'Church Street', 50),
  ('ria.demo@example.com', 'Girls'' night out: live music at a rooftop in Koramangala, 9pm.', 'women', '{concerts,nightlife}', 'Bengaluru', 'Koramangala', 160),
  ('arjun.demo@example.com', 'Gym buddy for 7am sessions in Koramangala this week?', 'men', '{gym}', 'Bengaluru', 'Koramangala', 80),
  ('arjun.demo@example.com', '5-a-side football at the HSR turf tonight, need 3 more players.', 'men', '{football}', 'Bengaluru', 'HSR Layout', 15),
  ('meera.demo@example.com', 'Bharatanatyam show at Ranga Shankara tonight, I have one extra ticket.', 'women', '{dance,art_museums}', 'Bengaluru', 'JP Nagar', 110),
  ('meera.demo@example.com', 'Filter coffee and a slow walk in Basavanagudi tomorrow morning?', 'all', '{coffee_cafes,walking}', 'Bengaluru', 'Basavanagudi', 320),
  ('kabir.demo@example.com', 'Stand-up open mic in Indiranagar at 8pm, who''s coming?', 'all', '{standup_comedy,nightlife}', 'Bengaluru', 'Indiranagar', 30),
  ('kabir.demo@example.com', 'FIFA and Mario Kart night at a gaming café in HSR, Friday.', 'all', '{gaming}', 'Bengaluru', 'HSR Layout', 400),
  ('ananya.demo@example.com', 'Easy-pace 5k around Ulsoor Lake tomorrow at 6am.', 'all', '{running}', 'Bengaluru', 'Ulsoor', 200),
  ('ananya.demo@example.com', 'Photo walk through Malleshwaram market this Saturday morning.', 'all', '{photography,exploring_city}', 'Bengaluru', 'Malleshwaram', 520),
  ('kiran.demo@example.com', 'Queer-friendly book club at a café in Indiranagar, Saturday 4pm.', 'non_binary', '{books,coffee_cafes}', 'Bengaluru', 'Indiranagar', 40),
  ('kiran.demo@example.com', 'Anyone up for a sketching walk in Cubbon Park this evening?', 'all', '{walking,art_museums}', 'Bengaluru', 'Cubbon Park', 260),
  ('kiran.demo@example.com', 'Volunteering at an animal shelter in Whitefield on Sunday, carpool from Indiranagar?', 'all', '{volunteering,day_trips}', 'Bengaluru', 'Whitefield', 600),
  ('rohan.demo@example.com', 'Street food crawl on Mohammed Ali Road tonight, who''s hungry?', 'all', '{street_food,food_exploring}', 'Mumbai', 'Mohammed Ali Road', 60),
  ('rohan.demo@example.com', 'Badminton doubles in Bandra at 7am, need one more.', 'men', '{badminton}', 'Mumbai', 'Bandra', 230),
  ('zoya.demo@example.com', 'Women-only sunset walk on Marine Drive, 6pm.', 'women', '{walking}', 'Mumbai', 'Marine Drive', 140),
  ('dev.demo@example.com', 'Chai and an old Delhi photo walk in Chandni Chowk, Sunday 7am.', 'all', '{chai,photography}', 'Delhi', 'Chandni Chowk', 90),
  ('dev.demo@example.com', 'Cricket in the Lodhi Garden lawns this evening, need fielders.', 'men', '{cricket}', 'Delhi', 'Lodhi Road', 300)
),
gone as (
  delete from public.threads t using w
  where t.author_id = md5(w.email)::uuid and t.body = w.body
)
insert into public.threads (author_id, body, audience, tags, city, area, status, created_at)
select md5(email)::uuid, body, audience::audience_t, tags::text[], city, area, 'live', now() - make_interval(mins => mins)
from w;
