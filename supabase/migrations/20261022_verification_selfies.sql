-- Live verification selfies: a PRIVATE bucket (unlike the public avatars bucket) and a pointer on the
-- private details row. Users can only write/read their own folder; the admin reads via the service role.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('verifications', 'verifications', false, 5242880, array['image/jpeg'])
on conflict (id) do nothing;

create policy "users upload own selfie" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'verifications' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users read own selfie" on storage.objects
  for select to authenticated
  using (bucket_id = 'verifications' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users replace own selfie" on storage.objects
  for update to authenticated
  using (bucket_id = 'verifications' and (storage.foldername(name))[1] = (select auth.uid())::text);

alter table public.profile_private add column selfie_path text;
