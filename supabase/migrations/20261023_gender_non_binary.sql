-- Non-binary members: they see and get notified about "Everyone" plans; the women/men audience
-- rules (RLS, match_users, notify) compare against 'female'/'male' explicitly, so they're unchanged.
alter type public.gender_t add value if not exists 'non_binary';
