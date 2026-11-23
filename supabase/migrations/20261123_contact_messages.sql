-- Contact form ("Questions? Contact us"): each submission is one row.
-- RLS: anyone (signed in or not) can insert a well-formed message; nobody can read, change or delete
-- through the API. The admin reads them on /admin with the service role on the server.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) between 3 and 200 and email like '%_@_%._%'),
  message text not null check (char_length(message) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

create policy "anyone can send a contact message" on public.contact_messages
  for insert to anon, authenticated with check (true);

grant insert on public.contact_messages to anon, authenticated;
