-- 1) Posting without the service role key.
-- The server screens a WYD (AI or rule-based moderation) and then calls create_wyd with a server-only
-- secret. The secret lives in private.app_secrets (not exposed through the API) and in the server env
-- (WYD_SERVER_SECRET), so a browser can't call this function directly to skip moderation.
-- Set the value once, outside version control:
--   insert into private.app_secrets (key, value) values ('server', '<WYD_SERVER_SECRET>')
--   on conflict (key) do update set value = excluded.value;

create table if not exists private.app_secrets (
  key text primary key,
  value text not null
);
revoke all on private.app_secrets from public, anon, authenticated;

create or replace function public.create_wyd(
  p_secret text,
  p_body text,
  p_audience audience_t,
  p_city text,
  p_area text,
  p_tags text[],
  p_live boolean,
  p_reason text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Please sign in first.';
  end if;
  if not exists (select 1 from private.app_secrets where key = 'server' and value = p_secret) then
    raise exception 'Not allowed.';
  end if;
  if not exists (select 1 from public.profiles where id = v_uid and status = 'approved') then
    raise exception 'You can post once your profile is verified.';
  end if;
  insert into public.threads (author_id, body, audience, tags, city, area, status, moderation_reason)
  values (v_uid, p_body, p_audience, coalesce(p_tags, '{}'), p_city, p_area,
          case when p_live then 'live'::thread_status_t else 'review'::thread_status_t end, p_reason)
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.create_wyd(text, text, audience_t, text, text, text[], boolean, text) from public, anon;
grant execute on function public.create_wyd(text, text, audience_t, text, text, text[], boolean, text) to authenticated;

-- 2) Demo requests: when a real user's WYD goes live, 4–5 demo people (same city first, audience rule
-- respected) ask to join, so the requests → accept → 1:1 / group chat flow can be shown end to end.
-- Turn off:  update public.app_settings set value = 'false' where key = 'demo_requests';

insert into public.app_settings (key, value) values ('demo_requests', 'true')
on conflict (key) do nothing;

create or replace function private.demo_requests_for_thread()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status <> 'live' or (tg_op = 'UPDATE' and old.status = 'live') then
    return new;
  end if;
  if not coalesce((select value = 'true'::jsonb from public.app_settings where key = 'demo_requests'), false) then
    return new;
  end if;
  -- Only for real members' WYDs; demo users are marked by their .wyd.demo social link.
  if exists (select 1 from public.profiles where id = new.author_id and social_url like '%.wyd.demo') then
    return new;
  end if;

  insert into public.requests (thread_id, requester_id, status, created_at)
  select new.id, d.id, 'pending', now() - make_interval(mins => (d.rn * 3)::int)
  from (
    select p.id, row_number() over (order by (p.city = new.city) desc, random()) as rn
    from public.profiles p
    where p.social_url like '%.wyd.demo'
      and p.status = 'approved'
      and p.id <> new.author_id
      and (new.audience = 'all'
           or (new.audience = 'women' and p.gender = 'female')
           or (new.audience = 'men' and p.gender = 'male'))
  ) d
  where d.rn <= 5
  on conflict (thread_id, requester_id) do nothing;
  return new;
end;
$$;

drop trigger if exists threads_demo_requests on public.threads;
create trigger threads_demo_requests
  after insert or update of status on public.threads
  for each row execute function private.demo_requests_for_thread();
