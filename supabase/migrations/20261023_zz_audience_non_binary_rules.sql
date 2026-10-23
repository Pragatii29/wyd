-- Apply the "Non-binary only" audience everywhere the audience rule lives: who can read a WYD (RLS),
-- who gets matched/notified, and which demo members send demo requests.
drop policy if exists "read visible threads" on public.threads;
create policy "read visible threads" on public.threads for select to authenticated using (
  author_id = (select auth.uid())
  or (
    status = 'live' and private.is_approved() and (
      audience = 'all'
      or (audience = 'women' and private.my_gender() = 'female')
      or (audience = 'men' and private.my_gender() = 'male')
      or (audience = 'non_binary' and private.my_gender() = 'non_binary')
    )
  )
);

create or replace function public.match_users(p_thread uuid)
returns table (user_id uuid) language sql stable security definer set search_path to 'public' as $$
  select p.id
  from public.threads t
  join public.profiles p on p.status = 'approved'
    and p.id <> t.author_id
    and p.city = t.city
    and p.interests && t.tags
    and (t.audience = 'all'
         or (t.audience = 'women' and p.gender = 'female')
         or (t.audience = 'men' and p.gender = 'male')
         or (t.audience = 'non_binary' and p.gender = 'non_binary'))
  where t.id = p_thread and t.status = 'live'
    and (select count(*) from public.notifications n
         where n.user_id = p.id and n.sent_at > now() - interval '1 day') < 5
  order by (p.area = t.area) desc
  limit 200;
$$;

create or replace function private.demo_requests_for_thread()
returns trigger language plpgsql security definer set search_path to 'public' as $$
begin
  if new.status <> 'live' or (tg_op = 'UPDATE' and old.status = 'live') then
    return new;
  end if;
  if not coalesce((select value = 'true'::jsonb from public.app_settings where key = 'demo_requests'), false) then
    return new;
  end if;
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
           or (new.audience = 'men' and p.gender = 'male')
           or (new.audience = 'non_binary' and p.gender = 'non_binary'))
  ) d
  where d.rn <= 5
  on conflict (thread_id, requester_id) do nothing;
  return new;
end;
$$;
