-- Demo mode: approve new profiles instantly when app_settings.auto_approve is true.
-- Additive: profiles_guard is unchanged and still runs first (triggers fire in name order),
-- so users can never change their own status afterwards. Admins can still reject or suspend.
-- Turn manual review back on:  update public.app_settings set value = 'false' where key = 'auto_approve';

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;
create policy "anyone signed in can read settings" on public.app_settings
  for select to authenticated using (true);
insert into public.app_settings (key, value) values ('auto_approve', 'true');

create or replace function private.auto_approve_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce((select value = 'true'::jsonb from public.app_settings where key = 'auto_approve'), false) then
    new.status := 'approved';
  end if;
  return new;
end;
$$;

create trigger profiles_zz_auto_approve
  before insert on public.profiles
  for each row execute function private.auto_approve_profile();
