-- Demo data for WYD?: 8 approved users (no password, @example.com, can't sign in) and one live WYD each.
-- Safe to re-run: fixed ids from md5(email), profiles upserted, each demo user's WYDs replaced.
-- Photos are in public/demo/ (real-looking .jpg for six profiles, initials .png for Zoya and Dev). No notifications are sent.

with demo(email, name, gender, age, city, area, bio, interests, photo, body, audience, tags, mins) as (values
  ('ria.demo@example.com', 'Ria Sharma', 'female', 22, 'Bengaluru', 'Indiranagar',
   'Moved to Bangalore three months ago for my first job. I love slow mornings in new cafés, evening walks and live gigs on weekends. Always up for discovering a new corner of the city.',
   '{coffee_cafes,walking,concerts,photography,exploring_city}', '/demo/ria.jpg',
   'New to Bangalore, 22F. Anyone up for exploring cafes in Indiranagar today?', 'all', '{coffee_cafes,exploring_city}', 12),
  ('arjun.demo@example.com', 'Arjun Rao', 'male', 25, 'Bengaluru', 'Koramangala',
   'Software engineer, weekend cricketer and street food hunter. I play box cricket most evenings and I''m always looking for a few more players.',
   '{cricket,football,gym,street_food}', '/demo/arjun.jpg',
   'Looking for people to play cricket this evening in Koramangala. Have a bat and ball!', 'all', '{cricket}', 35),
  ('meera.demo@example.com', 'Meera Iyer', 'female', 27, 'Bengaluru', 'Jayanagar',
   'Bookworm and filter coffee loyalist. I run a tiny book swap with friends and do yoga before work. Museums and quiet chai spots are my happy place.',
   '{books,chai,art_museums,yoga}', '/demo/meera.jpg',
   'Chai and a book swap in Jayanagar at 5pm? Bring one you loved.', 'women', '{chai,books}', 58),
  ('kabir.demo@example.com', 'Kabir Singh', 'male', 24, 'Bengaluru', 'HSR Layout',
   'Product designer by day, board game collector by night. I have way too many games and not enough people to play them with. Also into stand-up and movies.',
   '{board_games,gaming,movies,standup_comedy}', '/demo/kabir.jpg',
   'Board games night at a café in HSR, need 2 or 3 more for Catan.', 'all', '{board_games}', 90),
  ('ananya.demo@example.com', 'Ananya Das', 'female', 23, 'Bengaluru', 'Whitefield',
   'Weekend trekker and sunrise chaser. I run on weekdays and head out of the city whenever I can. Usually carrying a camera.',
   '{trekking,day_trips,running,photography}', '/demo/ananya.jpg',
   'Sunrise trek to Nandi Hills on Saturday, have 2 seats in the car.', 'women', '{trekking,day_trips}', 140),
  ('rohan.demo@example.com', 'Rohan Mehta', 'male', 28, 'Mumbai', 'Bandra',
   'Film nerd who''ll watch anything on a big screen. Love trying new restaurants in Bandra and catching live music when I can.',
   '{movies,food_exploring,concerts,nightlife}', '/demo/rohan.jpg',
   'Anyone up for watching a movie tonight in Bandra?', 'all', '{movies}', 25),
  ('zoya.demo@example.com', 'Zoya Khan', 'female', 26, 'Mumbai', 'Andheri',
   'Dancer, café hopper and occasional guitarist. I just moved to Andheri and want to find people to dance and jam with.',
   '{dance,music_jamming,coffee_cafes,shopping}', '/demo/zoya.png',
   'Salsa class in Andheri tonight, looking for a dance buddy!', 'all', '{dance}', 70),
  ('dev.demo@example.com', 'Dev Malhotra', 'male', 29, 'Delhi', 'Hauz Khas',
   'I cycle early, eat late and explore old Delhi lanes in between. Chai is non-negotiable.',
   '{cycling,food_exploring,exploring_city,chai}', '/demo/dev.png',
   'Cycling around Lodhi Garden tomorrow morning, who''s in?', 'all', '{cycling}', 45)
),
users as (
  insert into auth.users (
    id, instance_id, aud, role, email, email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous,
    confirmation_token, recovery_token, email_change_token_new, email_change,
    email_change_token_current, phone_change, phone_change_token, reauthentication_token
  )
  select md5(email)::uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', email, now(), now(), now(),
         '{"provider":"email","providers":["email"]}', '{"demo":true}', false, false,
         '', '', '', '', '', '', '', ''
  from demo
  on conflict (id) do nothing
  returning id
),
profiles_up as (
  insert into public.profiles (id, name, dob, gender, photo_url, social_url, bio, interests, city, area, status, rejection_reason, photo_check)
  select md5(email)::uuid, name, make_date(extract(year from now())::int - age, 1, 15), gender::gender_t, photo,
         'https://instagram.com/' || lower(split_part(name, ' ', 1)) || '.wyd.demo', bio, interests::text[], city, area,
         'approved', null, '{"skipped": true, "path": "demo seed"}'::jsonb
  from demo
  where exists (select 1 from users) or exists (select 1 from auth.users u where u.id = md5(demo.email)::uuid)
  on conflict (id) do update set
    name = excluded.name, dob = excluded.dob, gender = excluded.gender, photo_url = excluded.photo_url,
    social_url = excluded.social_url, bio = excluded.bio, interests = excluded.interests, city = excluded.city,
    area = excluded.area, status = 'approved', rejection_reason = null, photo_check = excluded.photo_check
  returning id
),
cleared as (
  delete from public.threads where author_id in (select md5(email)::uuid from demo) returning id
)
insert into public.threads (author_id, body, audience, tags, city, area, status, moderation_reason, created_at)
select md5(email)::uuid, body, audience::audience_t, tags::text[], city, area, 'live', 'Demo seed', now() - make_interval(mins => mins)
from demo
where (select count(*) from profiles_up) >= 0 and (select count(*) from cleared) >= 0;
