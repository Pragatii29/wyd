-- Additive only: blocks, web push subscriptions, and an admin rejection reason.

create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.blocks (blocked_id);
alter table public.blocks enable row level security;
create policy "read own blocks" on public.blocks
  for select using (blocker_id = (select auth.uid()));
create policy "block others" on public.blocks
  for insert with check (blocker_id = (select auth.uid()));
create policy "unblock" on public.blocks
  for delete using (blocker_id = (select auth.uid()));

create table public.push_subscriptions (
  endpoint text primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;
create policy "read own push subscriptions" on public.push_subscriptions
  for select using (user_id = (select auth.uid()));
create policy "add own push subscription" on public.push_subscriptions
  for insert with check (user_id = (select auth.uid()));
create policy "remove own push subscription" on public.push_subscriptions
  for delete using (user_id = (select auth.uid()));

alter table public.profiles add column rejection_reason text;
