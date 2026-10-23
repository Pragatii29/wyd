-- Demo mode: the feed only shows WYDs from the last 24 hours, so sample WYDs from demo members
-- (social_url ending .wyd.demo) are nudged back to "a few hours ago" before they expire.
-- Real members' WYDs are never touched. Remove with: select cron.unschedule('keep-demo-wyds-fresh');
create extension if not exists pg_cron;

create or replace function private.refresh_demo_wyds()
returns void language sql security definer set search_path to 'public' as $$
  update public.threads t
  set created_at = now() - make_interval(mins => (20 + floor(random() * 340))::int)
  from public.profiles p
  where p.id = t.author_id
    and p.social_url like '%.wyd.demo'
    and t.status = 'live'
    and t.created_at < now() - interval '20 hours';
$$;

select cron.schedule('keep-demo-wyds-fresh', '*/30 * * * *', 'select private.refresh_demo_wyds()');
select private.refresh_demo_wyds();
