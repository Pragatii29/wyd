-- Additive: private contact details. Only the user (and the service role / admin) can read them.
-- Kept out of `profiles` because every approved user can read that table.

create table public.profile_private (
  id uuid primary key references public.profiles(id) on delete cascade,
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  updated_at timestamptz not null default now()
);
alter table public.profile_private enable row level security;
create policy "read own private details" on public.profile_private
  for select using (id = (select auth.uid()));
create policy "add own private details" on public.profile_private
  for insert with check (id = (select auth.uid()));
create policy "update own private details" on public.profile_private
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));
