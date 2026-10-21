# CLAUDE.md — WYD? ("What You Doin'?") MVP

## What we are building

WYD? helps young people who moved to India's metro cities find company for everyday plans.
A user posts a plan (a "WYD"), verified people nearby with matching interests get a live
notification, they send requests, the poster accepts one or a few, and they chat to fix the plan.

**Problem statement:** Students and early career professionals aged 18 to 29 who moved to India's
metro cities want to do everyday things like grabbing chai, trying a café or exploring a new place,
but their friends are busy, far away or not interested at that moment, and there is no simple way
to find nearby people who want the same thing, so they go alone, skip the plan, or turn to dating
apps and communities that take weeks.

**Pilot city:** Bengaluru.

**Magic moment:** a user posts "Evening walk at Cubbon Park, 6pm?" and within minutes someone
nearby who loves walks gets a live notification ("Ria, 22F: Evening walk at Cubbon Park, 6pm?")
and sends a request.

## Current state (read first)

The Supabase database is **already set up** (project `pvgcvtrynwmcjzbytanv`, Mumbai region).
Do NOT recreate the schema. It already has:

- All tables, enums, indexes and RLS policies from the Database section below, tested.
- `public.match_users(uuid)` — callable only with the service role key (server).
- Helpers in the `private` schema used by RLS: `private.is_approved()`, `private.my_gender()`,
  `private.is_chat_member(uuid)`, `private.is_thread_author(uuid)`.
- Trigger `profiles_guard`: blocks under-18 sign ups, forces new profiles to `pending`,
  and blocks users from changing their own `status` or `photo_check` (only the service role can).
- Realtime enabled on `notifications`, `messages`, `requests`.
- Public storage bucket `avatars` (5 MB, jpeg/png/webp). Upload to `<user_id>/<filename>`;
  users can only write inside their own folder.

`.env.local` values already known:
```
NEXT_PUBLIC_SUPABASE_URL=https://pvgcvtrynwmcjzbytanv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_a3cdBdYuLJG9rEH79gjs9Q_u2gB7pXM
```
Still needed (the user pastes these into `.env.local` themselves):
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase dashboard → Project Settings → API Keys → secret / service_role.
- `GEMINI_API_KEY` — free from aistudio.google.com. Until it is set, the rule-based fallback runs.
For any later schema change, write a new migration; never drop existing tables.

## Design

All UI follows **`DESIGN.md`** in the project root (colours, fonts, components, tone).
Read it before building any screen. Use only its tokens; never hardcode colours or sizes.

## Hard constraints

- **This is a working prototype for a demo, not a production app.** Optimise for the demo
  journey working end to end, not for scale or polish.
- **Only 4 services:** GitHub, Vercel, Supabase, Gemini API (free tier). Do not add any other service.
- **No Anthropic API.** Runtime AI uses Google Gemini (free key from aistudio.google.com) with a
  rule-based fallback. Claude is used only as Claude Code, to build the app.
- **Deadline:** Thursday 22 Oct 2026, 12:30 PM IST. Total build time: 8 hours or less.
- **Exactly 3 features.** Do not add anything outside the IN list below. If a task seems to need
  an OUT feature, stop and ask.
- Prefer the simplest working version. No premature abstraction, no extra libraries unless needed.
- Users must be 18 or older (block sign up under 18).
- Never expose the Supabase service role key or the Gemini key to the browser.

## Scope

### IN (build these 3 features only)

1. **Verified profile**
   - Email magic link sign in (Supabase Auth, built in — no Google OAuth).
   - Required fields: name, date of birth (18+), gender (female / male), profile photo,
     Instagram or LinkedIn URL, city, area.
   - "Tell us about yourself" paragraph. AI extracts interest tags and lists missing fields.
     The UI then asks the user to fill anything missing.
   - AI photo pre-check: exactly one real human face (not a cartoon, celebrity, group, blank).
   - New accounts start as `pending`. The admin approves or rejects on `/admin`.
     Only `approved` users can post, request, chat or receive notifications.

2. **Drop a WYD with audience control + matched live notification**
   - Post text (max 280 chars) and audience: `all`, `women`, or `men`.
   - On submit, one AI call returns a safety verdict and activity tags (JSON).
     - `safe` → saved as `live`.
     - `unsafe` → not saved, show the reason to the user.
     - `review` → saved as `review`, hidden until the admin approves.
   - When a WYD goes `live`, the same API route calls `match_users(thread_id)` and inserts one row
     per matched user into `notifications`.
   - Each logged-in user subscribes to their own `notifications` rows via Supabase Realtime.
     A new row shows an in-app toast ("Ria, 22F: Evening walk at Cubbon Park, 6pm?") and, if the
     user allowed it, a browser notification via the Notification API (works while the app is
     open in a tab). Clicking it opens `/wyd/{id}`. A bell icon lists recent notifications.
   - Feed: live WYDs from the last 24 hours in the user's city that the user is allowed to see
     (audience rule) — matching interests shown first.

3. **Requests and chat**
   - On a WYD: "Ask to join" → creates a request.
   - Poster sees requests with each requester's profile (photo, name, age, gender, interests, social link).
   - Poster accepts or declines. Poster can start a 1:1 chat with one accepted person or a
     group chat with several accepted people.
   - Chat is realtime (Supabase Realtime), text only.
   - Report button on profiles, WYDs and messages.

### OUT (do not build)

Google sign in, push notifications when the app is closed (OneSignal / service-worker push),
n8n background workflows, email alerts, Aadhaar / DigiYatra style ID checks, automated face
matching, sponsored ad cards, map view and radius slider, payments / WYD+ / boosts, native iOS or Android apps, ratings after meetups, live AI chat
moderation, media in chat.

### LATER (v2, do not build now)

Real push notifications (OneSignal), n8n workflows for matching and admin alerts,
AI ID + selfie liveness, intent-based ads and partner café check-ins, WYD+ (₹149/mo), ₹29 boosts,
₹99 trip pass and multi-day trips, map of nearby plans, SOS button, post-meetup ratings.

## Tech stack

| Tool | Role |
| --- | --- |
| Next.js (App Router, TypeScript, Tailwind) | Mobile-first web app |
| Vercel | Hosting + API routes that call the AI and run matching |
| GitHub | Repo; every push to `main` auto-deploys to Vercel |
| Supabase | Email magic link auth, Postgres, Realtime (chat + live notifications), Storage for photos |
| Gemini API (`@google/genai`, free tier) | Profile extraction, photo pre-check, WYD safety + tagging |
| Rule-based fallback (`lib/fallback.ts`) | Same three jobs without AI when Gemini fails, times out or has no key |

Use the current free-tier Gemini Flash model. Read the model ID from `GEMINI_MODEL`,
don't hardcode it.

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server only
GEMINI_API_KEY=                   # server only; free from aistudio.google.com
GEMINI_MODEL=                     # current free-tier Flash model ID
ADMIN_EMAILS=                     # comma separated; these users can open /admin
```

## Interest tags (fixed list)

Profiles and WYDs use the same tags so matching is a simple overlap. The AI and the fallback must only return tags
from this list.

```
chai, coffee_cafes, food_exploring, street_food, walking, running, cycling, trekking,
tennis, badminton, football, cricket, gym, yoga, movies, concerts, standup_comedy,
house_parties, nightlife, board_games, gaming, shopping, art_museums, books,
photography, day_trips, travel_trips, exploring_city, music_jamming, dance,
study_cowork, volunteering
```

Keep this list in one file (`lib/tags.ts`) and import it everywhere, including into prompts.

## Database (Supabase)

```sql
create type gender_t as enum ('female', 'male');
create type audience_t as enum ('all', 'women', 'men');
create type profile_status_t as enum ('pending', 'approved', 'rejected', 'suspended');
create type thread_status_t as enum ('live', 'review', 'blocked');
create type request_status_t as enum ('pending', 'accepted', 'declined');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null,
  dob date not null,
  gender gender_t not null,
  photo_url text not null,
  social_url text not null,
  bio text,
  interests text[] not null default '{}',
  city text not null default 'Bengaluru',
  area text not null,
  lat double precision,
  lng double precision,
  status profile_status_t not null default 'pending',
  photo_check jsonb,
  created_at timestamptz default now()
);

create table threads (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles(id),
  body text not null check (char_length(body) <= 280),
  audience audience_t not null default 'all',
  tags text[] not null default '{}',
  city text not null,
  area text not null,
  lat double precision,
  lng double precision,
  status thread_status_t not null,
  moderation_reason text,
  created_at timestamptz default now()
);

create table requests (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references threads(id) on delete cascade,
  requester_id uuid not null references profiles(id),
  status request_status_t not null default 'pending',
  created_at timestamptz default now(),
  unique (thread_id, requester_id)
);

create table chats (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid references threads(id),
  is_group boolean not null default false,
  created_by uuid not null references profiles(id),
  created_at timestamptz default now()
);

create table chat_members (
  chat_id uuid references chats(id) on delete cascade,
  user_id uuid references profiles(id),
  primary key (chat_id, user_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references chats(id) on delete cascade,
  sender_id uuid not null references profiles(id),
  body text not null check (char_length(body) <= 1000),
  created_at timestamptz default now()
);

create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id),
  target_type text not null check (target_type in ('profile', 'thread', 'message')),
  target_id uuid not null,
  reason text,
  created_at timestamptz default now()
);

create table notifications (
  thread_id uuid references threads(id) on delete cascade,
  user_id uuid references profiles(id),
  title text not null,           -- e.g. 'Ria, 22F'
  body text not null,            -- the WYD text, trimmed to 120 chars
  read boolean not null default false,
  sent_at timestamptz default now(),
  primary key (thread_id, user_id)
);
-- add notifications and messages to the supabase_realtime publication
alter publication supabase_realtime add table notifications, messages;
```

### Row level security (enable on every table)

- `profiles`: users read approved profiles; users update only their own row, and never `status`.
- `threads`: approved users read `live` threads they are allowed to see (audience rule);
  authors read their own threads in any status. Inserts go through the API route only
  (service role), because the AI must screen them first.
- `requests`: requester and thread author can read; requester inserts; only the thread author
  updates `status`.
- `chats`, `chat_members`, `messages`: only members can read and insert.
- `reports`: users insert; only admins read.
- `notifications`: users read and update (mark read) only their own rows; inserts by the server only.
- Admin actions use the service role on the server after checking `ADMIN_EMAILS`.

### Audience rule (use everywhere: feed, matching, requests)

A viewer can see a WYD only if:
`audience = 'all'` OR (`audience = 'women'` AND viewer.gender = 'female') OR
(`audience = 'men'` AND viewer.gender = 'male'). The author always sees their own WYD.

### Matching function (called by `POST /api/threads` after a live insert)

```sql
create or replace function match_users(p_thread uuid)
returns table (user_id uuid) language sql stable as $$
  select p.id
  from threads t
  join profiles p on p.status = 'approved'
    and p.id <> t.author_id
    and p.city = t.city
    and p.interests && t.tags
    and (t.audience = 'all'
         or (t.audience = 'women' and p.gender = 'female')
         or (t.audience = 'men' and p.gender = 'male'))
  where t.id = p_thread and t.status = 'live'
    and (select count(*) from notifications n
         where n.user_id = p.id and n.sent_at > now() - interval '1 day') < 5
  order by (p.area = t.area) desc
  limit 200;
$$;
```

If both have coordinates, prefer users within 5 km (haversine) before the city-wide fallback.
Keep it simple; city + same-area-first is acceptable for the pilot.

## AI calls (server only, `lib/ai.ts`)

Provider: Google Gemini via `@google/genai`. Send the prompt below as the system instruction,
set `responseMimeType: 'application/json'` with a `responseSchema`, and validate the result with zod.
Timeout each call at 5 seconds.

If the AI call errors, times out, returns invalid JSON, or `GEMINI_API_KEY` is missing,
use the rule-based fallback (`lib/fallback.ts`, below). Never block a user because the AI is down.
Log which path was used (`ai` or `fallback`) so it can be shown on `/admin`.

### 1. Profile extraction — `POST /api/profile/extract`

System prompt:
```
You build a short social profile for WYD?, an app where young people in Indian cities find
company for everyday plans. From the user's paragraph, return JSON only:
{"interests": string[], "area": string | null, "missing_fields": string[]}
- interests: only tags from this list: {TAGS}. Map meaning, not exact words
  ("gigs" -> concerts, "coffee spots" -> coffee_cafes). Max 10.
- area: the Bengaluru area if mentioned, else null.
- missing_fields: any of ["interests", "area"] that you could not find.
Do not invent anything the user did not say.
```

### 2. Photo pre-check — `POST /api/profile/photo-check`

Send the uploaded image. Return JSON only:
`{"one_real_face": boolean, "reason": string}`.
This is a helper for the admin, not identity verification. Never auto-approve from it.

### 3. WYD safety + tags — `POST /api/threads`

System prompt:
```
You screen posts for WYD?, an app where verified adults (18+) in Indian cities post everyday
plans (chai, cafés, walks, movies, sports, trips) and nearby people ask to join.
Return JSON only:
{"verdict": "safe" | "unsafe" | "review", "reason": string, "tags": string[]}
- unsafe: sexual content or solicitation, vulgar or abusive language, hate, drugs, violence,
  scams or money requests, a private home address, or a venue that is unsafe or adult
  (e.g. brothel, strip club), or anything involving minors.
- review: ambiguous intent (e.g. "just us two at my place", "come alone"), or you are unsure.
- safe: a normal social plan. House parties, pubs and bars are fine if nothing else is wrong.
- reason: one short sentence the user can read.
- tags: 1 to 3 tags from this list only: {TAGS}. Map meaning
  ("stroll at Cubbon after work" -> walking, exploring_city).
```

Server flow for `POST /api/threads`: check the user is `approved` → validate input →
call the AI (or fallback) → `unsafe` returns 422 with the reason and saves nothing → otherwise insert with
the status and tags → if `live`, call `match_users(thread_id)` and insert one `notifications`
row per matched user (title = "{name}, {age}{F/M}", body = WYD text trimmed to 120 chars).
When the admin approves a WYD from `review`, run the same matching step.

### Rule-based fallback (`lib/fallback.ts`)

Used automatically whenever the AI path fails. Must work with zero keys.

- **Tags:** a keyword and synonym map for every tag in `lib/tags.ts`, matched on lowercase words
  and short phrases. Examples: "stroll", "walk", "cubbon", "lalbagh" -> walking;
  "gig", "concert", "live music" -> concerts; "chai", "tapri" -> chai; "coffee", "cafe",
  "brunch" -> coffee_cafes; "movie", "film", "pvr", "inox" -> movies; "trek", "hike",
  "nandi hills" -> trekking. Return at most 3 tags for a WYD and 10 for a profile.
- **Safety:** lowercase the text and check, in this order:
  1. `unsafe` if it contains words from a blocklist: sexual terms and solicitation, slurs and
     abuse, drugs, money or payment requests ("pay", "upi", "send money"), adult venues
     ("brothel", "strip club"), or a street address pattern (house number + road / cross / main).
  2. `review` for ambiguous phrases: "come alone", "my place", "my room", "just us two",
     "no questions", "late night only", "hotel room".
  3. Otherwise `safe`. Reason strings are short and friendly, e.g. "Please don't share a home address."
- **Profile:** run the same tag map over the bio; `missing_fields` = whatever wasn't found.
  The user can always add or remove interest chips by hand.
- **Photo pre-check:** skip in fallback mode and mark `photo_check = {"skipped": true}`;
  the admin still reviews the photo manually.
- Write a small test file with 10 example WYDs (safe, unsafe, review) and check the
  fallback labels them correctly.

## Live notifications (no push service)

- A client component mounted in the app layout subscribes to
  `notifications` INSERTs filtered by `user_id = auth.uid()` via Supabase Realtime.
- On a new row: show a toast, play nothing, add to the bell list, and call
  `new Notification(title, { body })` if `Notification.permission === 'granted'`.
- Ask for browser notification permission once, after onboarding, with a clear button
  (never on page load).
- For the demo, use two browsers or devices logged in as two users, with the app open.

## Pages

- `/` — landing + email magic link sign in
- `/onboarding` — profile form, photo upload, bio → extracted tags (editable chips), notification opt-in
- `/pending` — "We're verifying your profile"
- `/feed` — WYDs nearby, "Drop a WYD" button
- `/wyd/new` — text + audience picker (All / Women only / Men only)
- `/wyd/[id]` — WYD detail; "Ask to join" for others; request list with accept/decline for the author
- `/chats` and `/chats/[id]` — chat list and realtime chat; author can create 1:1 or group from accepted requests
- `/profile/[id]` — public profile + report button
- `/admin` — pending profiles (photo, social link, gender, AI photo check) with approve/reject;
  WYDs in review; reports

Mobile-first. Big tap targets. Show audience as a clear label on every WYD.

## Build order (target hours)

1. **0:00–1:00** Repo, Next.js + Tailwind, Supabase project + schema + RLS, magic link auth, deploy to Vercel.
2. **1:00–2:30** Onboarding, photo upload, AI profile extraction + photo pre-check + rule-based fallback, `/pending`, `/admin` approve.
3. **2:30–3:30** `/wyd/new`, `POST /api/threads` with AI safety + tags (and fallback), audience picker.
4. **3:30–4:30** Feed with audience rule, `match_users` + `notifications` insert, live toast + bell.
5. **4:30–5:30** Requests: ask to join, request list, accept/decline.
6. **5:30–6:30** Chats: 1:1 and group from accepted requests, Supabase Realtime.
7. **6:30–7:15** Reports, admin review list, browser Notification API.
8. **7:15–8:00** Seed demo data (6 to 8 approved users with varied interests and genders), end-to-end test, fix bugs.

If behind schedule, cut in this order: photo pre-check → browser Notification API (keep the toast) → group chat (keep 1:1).

## Definition of done (test before the deadline)

- [ ] Under-18 date of birth is blocked.
- [ ] A pending user cannot post, request or chat.
- [ ] A "Women only" WYD is never shown or notified to a male user (and vice versa).
- [ ] An unsafe WYD is rejected with a readable reason; an ambiguous one goes to review.
- [ ] Posting a WYD shows a live notification to a matching approved user (app open in another browser) within seconds, and not to non-matching users.
- [ ] Requests can be accepted and declined; only the author can do this.
- [ ] 1:1 and group chats update in real time; non-members cannot read them.
- [ ] Reports appear on `/admin`.
- [ ] No secret keys in client bundles.

## Conventions

- TypeScript strict. Zod for all API input and AI output.
- Server-side AI and service-role calls only (API routes or server actions).
- Small, readable components. No state libraries beyond React + Supabase client.
- Plain, friendly UI copy. The product is called "WYD?" and a post is called "a WYD".
- Commit often with clear messages; push to `main` to deploy.
