# Contact form — "Questions? Contact us"

A public contact form for WYD?. Every submission is saved in Supabase. The site owner gets an email
alert, and the person who wrote in gets an automatic reply.

> Note: CLAUDE.md limits the app to four services and lists email alerts as out of scope for the
> MVP. This form is a separate assignment, so it adds Gmail (with an app password) for these two
> emails only. Nothing else in the app sends email.

## What's built

| Piece | Where |
| --- | --- |
| Contact page (open to everyone, signed in or not) | `/contact`, linked from the welcome screen ("Questions? Contact us") |
| Form (name, email, question + hidden spam trap) | `components/ContactForm.tsx` |
| Server action: validate → save row → send both emails | `app/actions/contact.ts` |
| Gmail sender (server only) | `lib/email.ts` (uses `nodemailer`) |
| Database table + RLS | `supabase/migrations/20261123_contact_messages.sql` |
| Reading messages | `/admin` → "Contact messages" |

### Database: `public.contact_messages`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid | primary key |
| `name` | text | 1–80 characters |
| `email` | text | 3–200 characters, must look like an email |
| `message` | text | 1–2000 characters |
| `created_at` | timestamptz | set automatically |

**Row-Level Security is on.**
- `anon` and `authenticated` users can **insert** only. There's no select, update or delete policy, so
  nobody can read or change messages through the public API.
- The admin page reads them on the server with the service role key, after the admin passcode check.

### Emails (per submission)

1. **Notification to the owner.** Subject "New WYD? question from {name}". It goes to
   `CONTACT_OWNER_EMAIL`, or to `GMAIL_USER` if that isn't set, and contains the name, email and
   question. Its Reply-To is the person's address, so hitting Reply answers them directly.
2. **Auto-reply to the person.** Subject "We got your message — WYD?". It thanks them and quotes
   their question back.

The row is saved first. If Gmail isn't configured, or sending fails, the message is still stored,
and the person still sees a success screen without the "confirmation is on its way" line, so no
question is lost.

## Setup (one time)

1. **Turn on 2-Step Verification** for the Gmail account that will send the emails:
   Google Account → Security → 2-Step Verification.
2. **Create an app password:** Google Account → Security → App passwords. Name it "WYD contact form".
   Google shows a 16-character password. Copy it; you won't see it again.
3. **Add the settings.** Paste these into `.env.local` **and** into Vercel → Project → Settings →
   Environment Variables (Production), yourself; don't share the password in chat:
   ```
   GMAIL_USER=yourgmail@gmail.com
   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
   CONTACT_OWNER_EMAIL=where-alerts-should-go@example.com   # optional
   ```
4. Restart `npm run dev` locally, and redeploy on Vercel so it picks up the new variables.

## Demo checklist (definition of done)

- [ ] A friend or classmate opens `https://wyd-beta.vercel.app/contact` and submits a test question
      with their real email.
- [ ] **New database row:** Supabase → Table Editor → `contact_messages` shows their row (also visible
      on `/admin` → "Contact messages").
- [ ] **Notification email:** the owner inbox has "New WYD? question from {name}".
- [ ] **Auto-reply:** the friend's inbox has "We got your message — WYD?". Check Spam the first time.
- [ ] **RLS check:** in Supabase → Authentication → Policies, `contact_messages` has RLS enabled with
      a single insert-only policy.

## Troubleshooting

- **No emails, but the row is saved:** `GMAIL_USER` or `GMAIL_APP_PASSWORD` is missing, or the
  server wasn't restarted or redeployed after adding them. The server log shows "contact email failed"
  if Gmail rejected the login.
- **"Invalid login" from Gmail:** use the 16-character app password, not your normal Gmail
  password. 2-Step Verification must be on.
- **Auto-reply in Spam:** normal for a fresh Gmail sender. Mark it "Not spam" once.
