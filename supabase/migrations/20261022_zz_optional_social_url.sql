-- The social link is optional: people can skip it, or use LinkedIn, Instagram, X, Threads, etc.
alter table public.profiles alter column social_url drop not null;
update public.profiles set social_url = null where social_url = '';
