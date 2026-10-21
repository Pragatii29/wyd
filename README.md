# WYD? — find company for everyday plans

Mobile-first web app (Next.js 16, App Router, Tailwind v4, Supabase, Gemini free tier with a rule-based fallback, Web Push).
Product scope: `CLAUDE.md`. Design system: `DESIGN.md`.

## Run locally

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

Checks: `npx tsc --noEmit`, `npm run lint`, `npm run test:fallback`, `npm run build`.

## Environment variables (`.env.local`)

| Variable | Needed for | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Everything | Already set (project `pvgcvtrynwmcjzbytanv`) |
| `SUPABASE_SERVICE_ROLE_KEY` (server only) | Approving users, posting WYDs, notifications, rate limits, block checks both ways | Supabase → Project Settings → API Keys → secret |
| `GEMINI_API_KEY` (server only), `GEMINI_MODEL` | AI interest suggestions, photo pre-check, WYD moderation | aistudio.google.com (free). Empty = rule-based fallback |
| `ADMIN_EMAILS` | Who can open `/admin` | Comma-separated emails |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (server only), `VAPID_SUBJECT` | Web Push | `npx web-push generate-vapid-keys`; subject `mailto:you@…` |

Never put the service role, Gemini or VAPID private keys in client code; only `NEXT_PUBLIC_*` reach the browser.

Supabase → Authentication → URL Configuration: add `http://localhost:3000/auth/callback` (and your Vercel URL later) to Redirect URLs.

## Database

The base schema (tables, RLS, `match_users`, `profiles_guard` trigger, realtime, `avatars` bucket) already exists — see `CLAUDE.md`.
One additive migration was applied: `supabase/migrations/20261021_blocks_push_rejection.sql`
(`blocks`, `push_subscriptions`, `profiles.rejection_reason`). Nothing was dropped or changed.

## Approving users (manual verification)

1. Put your email in `ADMIN_EMAILS` and set `SUPABASE_SERVICE_ROLE_KEY`.
2. Sign in, open `/admin` (also linked from your profile).
3. Each pending profile shows photo, name, age/gender, social link (opens in a new tab), About, interests and the AI photo pre-check.
   Approve, or reject with a reason the user sees. Rejected users can edit and resubmit; they go back to pending.
4. `/admin` also lists WYDs held for review (Publish runs matching + notifications, or Block) and reports (resolve, block WYD, suspend user).

The admin must have a profile only to use the app itself; `/admin` works as soon as you're signed in.

## How discovery works (enforced on the server)

1. Viewer is approved (layout guard + RLS).
2. WYD is `live` (passed moderation) and from the last 24 hours.
3. WYD city = viewer's **active city** (switch it from the feed header or profile; takes effect immediately).
4. Audience rule (RLS): Everyone / Women only / Men only, using the gender the user picked at sign-up. Never inferred.
5. Not blocked in either direction.
6. Shared interests only rank (and badge "Matches your interests"); they never hide a WYD.

Notifications use the same rules, at most 5 per person per day, one per WYD (primary key), and go out via Supabase Realtime (in-app toast + bell) and Web Push (closed tab).

## Demo script

Use two browsers (e.g. Chrome + Chrome incognito, or Chrome + Firefox) with two different emails.

1. Sign in with A → onboarding → write an About → “Suggest interests” → tap suggestions → submit → `/pending`.
2. Same for B (different gender to demo audience).
3. As admin, approve both on `/admin`.
4. B: Notifications → “Get alerts for plans near you”, allow.
5. A: Drop a WYD “Evening walk at Cubbon Park, 6pm?” (Everyone). B sees a toast within seconds (and a system notification if the tab is in the background/closed). Tap → opens the WYD.
6. B: Ask to join. A: Requests tab → accept → tick B → Start a 1:1 chat → confirm → chat in real time.
7. Try “Looking for a hookup tonight” → blocked with a reason. “Come alone to my place” → held for review.
8. Post a Women only WYD as A: a male B never sees or gets notified about it.
9. Switch B's city to Mumbai → A's Bengaluru WYDs disappear from B's feed.

## What's real vs simulated

- Real: Supabase auth (email magic link), Postgres + RLS, Realtime, Storage, server-side moderation, matching, notifications, Web Push (VAPID), rate limits, blocks/reports.
- AI: real Gemini calls when `GEMINI_API_KEY` is set; otherwise the rule-based fallback in `lib/fallback.ts` (logged as `fallback`).
- Not built: social-profile scraping (we never read social accounts; admins open the link), government ID checks, payments, reviews, live location.
