# DESIGN.md — WYD? ("What You Doin'?")

Merged from three references, adapted for a mobile-first social app:

| Reference | What WYD takes from it |
| --- | --- |
| **Timeleft** (timeleft.com) | Warm cream canvas, ink text, soft large shadow, big rounded cards, pill buttons |
| **oddtables** (bengaluru.oddtables.com) | Coral + candle accents, night/bone dark surfaces, mono metadata, springy motion |
| **Partiful** (partiful.com) | Neutral grey ladder for secondary text, compact 8px rhythm, Manrope, image-led cards |

Do not copy any reference's logo, wordmark, illustrations or copy. WYD's identity is
**warm cream + ink + coral**.

## 1. Visual theme and atmosphere

- Feels like an invite from a friend, not a dating app: warm, calm, safe, a little playful.
- Light (cream canvas) by default, with an optional dark theme (night canvas) the user picks:
  Light · Dark · System (Profile → Account, or the sun/moon icon). See "Dark theme" in section 2.
- People first: profile photos are large and real. Plans are short and readable.
- One clear action per screen. Lots of breathing room, never dense.
- Safety is visible: verified badge and audience label on every WYD.

## 2. Colours

Use these tokens only. Never hardcode hex values in components.

| Token | Hex | Role |
| --- | --- | --- |
| `--canvas` | `#F7F3ED` | App background (cream) |
| `--surface` | `#FFFFFF` | Cards, sheets, inputs |
| `--surface-sunk` | `#EFE8DE` | Chip backgrounds, input fill, dividers on cream |
| `--ink` | `#111111` | Primary text, primary button fill |
| `--ink-2` | `#595959` | Secondary text (meets AA on cream and white) |
| `--ink-3` | `#8E8E93` | Placeholder, disabled, icons only (never body text) |
| `--line` | `#E5E1DA` | Borders, hairlines |
| `--coral` | `#FF6B47` | Brand accent: "Drop a WYD" button, active tab, unread dot |
| `--coral-text` | `#C2410C` | Coral used as text or links on light backgrounds |
| `--candle` | `#F7C873` | Highlight: "Matches your interests" badge, new-notification glow |
| `--night` | `#0A0908` | Dark surfaces: landing hero, toast background |
| `--bone` | `#F5F1EA` | Text on night / ink |
| `--success` | `#1F6F4A` | Accepted, verified |
| `--danger` | `#B3261E` | Errors, destructive actions, report |

### Dark theme (user option)

Same token names, different values. Saved per device; "System" follows the OS setting.

| Token | Dark value |
| --- | --- |
| `--canvas` | `#0A0908` |
| `--surface` | `#171513` |
| `--surface-sunk` | `#25221F` |
| `--ink` / `--ink-2` / `--ink-3` | `#F5F1EA` / `#B9B2A8` / `#7E776E` |
| `--line` | `#2F2B27` |
| `--coral-text` | `#FF8F70` |
| `--night` | `#1E1B18` (raised so hero/toast cards still stand out) |
| `--success` / `--danger` | `#5BC48D` / `#FF7A70` |

Two helper tokens keep contrast right in both themes:
- `--on-ink`: text on an `--ink` fill (primary buttons, selected chips, my chat bubbles). Bone in light, `#111111` in dark.
- `--on-light`: text on always-light fills (coral, candle, bone). Always `#111111`.

### Contrast rules (checked)

- Ink on cream 17:1, ink-2 on cream 6.3:1, bone on night 17.7:1 — all pass.
- **Text on coral must be ink (`#111111`, 6.7:1). Never white on coral (2.8:1, fails).**
- Never use `--coral` for text on light backgrounds (2.6:1). Use `--coral-text`.
- Ink on candle 12:1 — badges on candle always use ink text.
- `--ink-3` is for placeholders, disabled states and icons only.

### Audience colours

Do not colour-code gender (no pink/blue). Audience chips are neutral with an icon:
`All` · `Women only` · `Men only`, on `--surface-sunk` with `--ink` text.

## 3. Typography

Free Google fonts, loaded with `next/font/google`:

| Role | Font | Use |
| --- | --- | --- |
| Display | **Fraunces** (400, 600) | Screen titles, landing headline, empty states. Sparingly. |
| UI / body | **Manrope** (400, 500, 600, 700) | Everything else |
| Mono | **DM Mono** (400, 500) | Metadata: time, area, distance, "2 min ago", tag labels |

| Token | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| `text-display` | 36 / 40 | Fraunces 600 | Landing headline only |
| `text-title` | 28 / 34 | Fraunces 600 | Screen titles |
| `text-h2` | 22 / 28 | Manrope 700 | Section headings, profile name |
| `text-wyd` | 18 / 26 | Manrope 600 | The plan text on a WYD card |
| `text-body` | 16 / 24 | Manrope 400 | Body, chat messages, inputs |
| `text-label` | 14 / 20 | Manrope 600 | Buttons, chips, field labels |
| `text-meta` | 12 / 16 | DM Mono 400 | Time, area, counts |

- Sentence case everywhere. No ALL CAPS except the "WYD?" wordmark.
- Inputs are at least 16px so iOS doesn't zoom.

## 4. Spacing, radius, elevation, motion

**Spacing (4px base):** `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56 · 64`
- Screen side padding: 16. Card padding: 16. Gap between cards: 12. Section gap: 32.

**Radius:**
| Token | Value | Use |
| --- | --- | --- |
| `radius-sm` | 8px | Inputs, small thumbnails |
| `radius-card` | 24px | WYD cards, profile cards, request cards |
| `radius-sheet` | 32px | Bottom sheets, modals (top corners only) |
| `radius-pill` | 999px | Buttons, chips, toasts, tab bar |
| `radius-avatar` | 50% | Avatars |

**Elevation:**
| Token | Value | Use |
| --- | --- | --- |
| `shadow-card` | `0 8px 24px rgba(0,0,0,0.06)` | Cards on cream |
| `shadow-float` | `0 20px 45px rgba(0,0,0,0.08)` | Bottom sheet, floating "Drop a WYD" button, toast |

**Motion:**
| Token | Value | Use |
| --- | --- | --- |
| `ease-spring` | `cubic-bezier(0.32, 0.72, 0, 1)` | Sheets, toasts sliding in |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Colour and opacity changes |
| `dur-fast` | 120ms | Button press (scale 0.97) |
| `dur-base` | 240ms | Hover, chip select, toast in |
| `dur-slow` | 480ms | Sheet open |

Respect `prefers-reduced-motion`: replace movement with a fade.

## 5. Components

### Buttons
| Variant | Style | Use |
| --- | --- | --- |
| Primary | `--ink` fill, `--bone` text, pill, height 52, full width on mobile | Continue, Send request, Accept |
| Accent (one per app) | `--coral` fill, `--ink` text, pill, `shadow-float` | "Drop a WYD" floating button only |
| Secondary | `--surface` fill, 1px `--line` border, `--ink` text, pill | Decline, Cancel, View profile |
| Ghost | No fill, `--coral-text` text | Inline links ("Edit interests") |
| Danger | `--surface` fill, `--danger` text and border | Report, Delete |

All buttons: hover darkens 6%, press scales to 0.97 (`dur-fast`), focus-visible shows a
2px `--ink` outline with 2px offset, disabled uses `--surface-sunk` fill and `--ink-3` text,
loading shows a spinner and keeps the width.

### WYD card (feed)
- `--surface`, `radius-card`, `shadow-card`, padding 16.
- Row 1: avatar 40 + name and age ("Ria, 22F") in `text-label` + verified tick in `--success`
  + `text-meta` time on the right ("6 min ago").
- Row 2: plan text in `text-wyd`, max 4 lines then truncate.
- Row 3: audience chip + up to 3 interest chips + area in `text-meta` ("Indiranagar").
- If it matches the viewer's interests: a small `--candle` badge "Matches your interests".
- Footer: "Ask to join" primary button, or "Requested" disabled state, or for the author
  "3 requests" secondary button.

### Chips
- Interest chip: `--surface-sunk` fill, `--ink` text, `text-label`, pill, height 32.
  Selected: `--ink` fill, `--bone` text.
- Audience chip: same shape, with a small icon (people / female / male symbol) before the label.

### Audience picker (on "Drop a WYD")
- Three large segmented options in a pill container: `All` · `Women only` · `Men only`.
- Selected segment: `--ink` fill, `--bone` text. Helper text under it in `text-meta`:
  "Only verified women will see this."

### Profile card (Hinge-style, used in request review)
- Full-width photo, 4:5 ratio, `radius-card`, name and age overlaid bottom-left on a
  subtle dark gradient in `--bone`.
- Below: verified tick, area, social link icon, interest chips, short bio (`text-body`, `--ink-2`).
- Actions pinned at the bottom: Secondary "Decline" + Primary "Accept".

### Request list item
- Avatar 48, name and age, 2 shared interests, `text-meta` time; tap opens the profile card.

### Live notification toast
- `--night` background, `--bone` text, `radius-pill`, `shadow-float`, slides down from the
  top with `ease-spring`, auto-hides after 5s.
- Content: avatar 32 + "Ria, 22F" (`text-label`) + plan text (1 line, truncated) + candle dot.
- Tap opens the WYD.

### Chat
- Others' messages: `--surface`, `--ink` text. My messages: `--ink`, `--bone` text.
  Bubble radius 20, padding 10 × 14, max width 78%.
- Group chats show sender name in `text-meta` above the bubble.
- Composer: `--surface` input pill + round `--ink` send button, sticky above the keyboard.

### Inputs
- `--surface` fill, 1px `--line` border, `radius-sm`, height 48, `text-body`.
- Focus: 2px `--ink` border. Error: `--danger` border + message below in `text-meta`.
- Bio textarea: min 4 lines, live character count in `text-meta`.

### Navigation
- Bottom tab bar (pill, `--surface`, `shadow-float`, floating 12 above the bottom):
  Feed · Chats · Notifications (bell with `--coral` unread dot) · Profile.
- Floating "Drop a WYD" accent button above the tab bar, bottom right.

### Status screens
- Pending verification: Fraunces title "We're checking your profile", short reassurance,
  illustration-free, cream background.
- Empty feed: "No plans nearby yet. Be the first — drop a WYD."
- Blocked post: inline `--danger` message with Claude's reason, the text stays editable.

## 6. Layout and responsiveness

- Mobile first: design at 375 × 812. Max content width 480, centred on desktop with the
  cream canvas around it.
- Touch targets at least 44 × 44.
- Respect safe areas (`env(safe-area-inset-bottom)`) for the tab bar and composer.
- Images: `object-fit: cover`, always with alt text ("Photo of Ria").

## 7. Writing tone

Warm, short, like a friend texting. Second person. No pressure, no dating language.

| Instead of | Write |
| --- | --- |
| "Submit post" | "Drop a WYD" |
| "Send join request" | "Ask to join" |
| "Match found" | "Ria wants to go for a walk too" |
| "Your post violates guidelines" | "Let's keep it friendly — {reason}" |

## 8. Do's and don'ts

**Do**
- Use tokens for every colour, size, radius and shadow.
- Keep one primary action per screen; the coral accent appears once per screen at most.
- Show the audience chip and verified tick on every WYD and profile.
- Define hover, focus-visible, active, disabled and loading states for interactive elements.

**Don't**
- Don't put white text on coral, or coral text on cream.
- Don't colour-code gender.
- Don't use more than 3 font families or add fonts outside this file.
- Don't hardcode light-only colours: use the tokens so both themes work.
- Don't use emoji as icons; use one icon set (lucide-react).

## 9. Implementation (Tailwind)

```css
/* app/globals.css */
:root {
  --canvas:#F7F3ED; --surface:#FFFFFF; --surface-sunk:#EFE8DE;
  --ink:#111111; --ink-2:#595959; --ink-3:#8E8E93; --line:#E5E1DA;
  --coral:#FF6B47; --coral-text:#C2410C; --candle:#F7C873;
  --night:#0A0908; --bone:#F5F1EA; --success:#1F6F4A; --danger:#B3261E;
}
body { background: var(--canvas); color: var(--ink); }
```

```ts
// tailwind.config.ts (theme.extend)
colors: {
  canvas: 'var(--canvas)', surface: 'var(--surface)', sunk: 'var(--surface-sunk)',
  ink: { DEFAULT: 'var(--ink)', 2: 'var(--ink-2)', 3: 'var(--ink-3)' },
  line: 'var(--line)', coral: { DEFAULT: 'var(--coral)', text: 'var(--coral-text)' },
  candle: 'var(--candle)', night: 'var(--night)', bone: 'var(--bone)',
  success: 'var(--success)', danger: 'var(--danger)',
},
fontFamily: {
  display: ['var(--font-fraunces)', 'serif'],
  sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-dm-mono)', 'monospace'],
},
borderRadius: { sm: '8px', card: '24px', sheet: '32px', pill: '999px' },
boxShadow: {
  card: '0 8px 24px rgba(0,0,0,0.06)',
  float: '0 20px 45px rgba(0,0,0,0.08)',
},
transitionTimingFunction: {
  spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
},
```

## 10. Refinement pass (best of the three references)

What each reference contributes, now applied across the app:

| Reference | Taken | Where |
| --- | --- | --- |
| Timeleft | Cream + sand surfaces, big confident headlines, 32px sheets, one soft shadow only for floating UI, slow marquee | Welcome hero + plan ticker, form sheets, FAB/toasts/Pass-Accept only cast shadows |
| oddtables | Editorial serif (Fraunces) headlines, DM Mono metadata, coral/candle used sparingly, springy press + sheet motion | `text-hero`, mono eyebrows ("01 / 03", "wants to join your plan"), `ease-press`, plan ticker colours |
| Partiful | Flat surfaces with hairlines, grey ladder for secondary text, pill buttons, 8px rhythm, Manrope body | Feed rows (no cards), outline "Ask to join", flat profile sections |

New tokens: `text-hero` (44/46 Fraunces), `text-eyebrow` (12/16 DM Mono, tracked, sentence case),
`rounded-field` (16px), `ease-press` (`cubic-bezier(0.16, 1, 0.3, 1)`). `shadow-card` is now a 1px hairline lift.

Rules from the pass:
- Lists are flat rows separated by `--line`, never stacked shadow cards.
- Fields are sand-filled (`--surface-sunk`) with no border until hover/focus.
- One mono context line per post: area · audience · up to two #tags. Women/Men only stays visible in `--ink`.
- Secondary actions are outline pills; only the main step CTA is a filled ink pill.
- Sentence case everywhere, including mono labels (no all-caps).

## 11. oddtables direction (current)

The app now follows oddtables' colour theory and type. This section overrides earlier colour, font and shape rules where they differ.

**Colour theory:** night-first. The canvas is night, text is bone, and coral + candle are rare accents
(the floating "+", Accept, the location pin, "for you" tags, the plan ticker). Everything else is a ladder of warm greys.

| Token | Night (default) | Light / bone (option) |
| --- | --- | --- |
| `--canvas` | `#0A0908` | `#F5F1EA` |
| `--surface` | `#13110F` | `#FBF9F5` |
| `--surface-sunk` | `#1C1916` | `#ECE6DC` |
| `--ink` / `--ink-2` / `--ink-3` | `#F5F1EA` / `#A8A198` / `#6E6860` | `#0A0908` / `#5E5850` / `#8E8880` |
| `--line` | `#2A2622` | `#E2DCD1` |
| `--coral` / `--coral-text` | `#FF6B47` / `#FF8A6B` | `#FF6B47` / `#B83A14` |
| `--candle` | `#F7C873` | `#F7C873` |
| `--on-ink` | `#0A0908` | `#F5F1EA` |

Theme switch: Night (default) · Light · System. Saved per device.

**Type:** Instrument Serif (free stand-in for oddtables' Swear Display) for all headlines at a single
regular weight, never faux-bold; Geist for UI and body; DM Mono for metadata and eyebrows.
`text-hero` 60/56, `text-display` 44/44, `text-title` 32/36.

**Shapes:** 2px corners on cards, fields, sheets and photos; full pills for buttons and chips; avatars round.
**Elevation:** none. Floating UI gets a 1px `--line` ring instead of a shadow.
**Motion:** press `cubic-bezier(0.16, 1, 0.3, 1)` 120ms; sheets/reveals `cubic-bezier(0.32, 0.72, 0, 1)` 240–480ms.

## 12. Airbnb direction (superseded by §13)

Supersedes §10–11 where they differ. Colour and type now follow Airbnb.

**Colour:** white canvas, `#222222` text, a grey ladder, Rausch pink for the main action.

| Token | Light (default) | Dark (option) |
| --- | --- | --- |
| `--canvas` / `--surface` | `#FFFFFF` / `#FFFFFF` | `#121212` / `#1C1C1C` |
| `--surface-sunk` | `#F7F7F7` | `#262626` |
| `--ink` / `--ink-2` / `--ink-3` | `#222222` / `#6A6A6A` / `#929292` | `#F7F7F7` / `#B0B0B0` / `#7A7A7A` |
| `--line` | `#DDDDDD` | `#333333` |
| `--coral` (Rausch, buttons) | `#E31C5F` | `#E31C5F` |
| `--coral-text` (pink text/links) | `#E31C5F` | `#FF5A7E` |
| `--candle` (soft pink highlight) | `#FFE8EE` | `#F9CFDA` |
| `--on-coral` | `#FFFFFF` | `#FFFFFF` |

Airbnb's brand pink `#FF385C` is too light for white text (about 3.5:1), so filled buttons use the deeper
Rausch `#E31C5F` (about 4.6:1). Text on pink is always white; text on the soft pink highlight is always `#222`.

**Type:** one family, DM Sans (free stand-in for Airbnb Cereal). Headlines bold and tight:
`text-hero` 40/44 800, `text-display` 32/36 800, `text-title` 26/30 700. No serif, no mono.

**Shapes:** 8px buttons and fields, 12px cards and photos, 24px sheets, pill chips and avatars.
**Fields:** white with a `--ink-3` 1px border, `#222` border + ring on focus.
**Elevation:** Airbnb's soft float `0 6px 16px rgba(0,0,0,0.12)` for floating UI only; lists stay flat with hairlines.
**Theme switch:** Light (default) · Dark · System.

## 13. Midnight direction (current)

Inspired by the WYD logo (white bubbly letters on deep navy, a sparkle cut into the D) and an LED-style
halftone glow. This section wins over §10–12 where they differ.

- **Default theme is Midnight (dark).** Light and System stay available in Profile → Appearance.
- **Colour tokens** (`app/globals.css`):
  - Midnight: canvas `#0B0A24`, surface `#13123A`, sunk `#1C1B4B`, ink `#F4F3FF`, ink-2 `#A9A8D6`,
    line `#29286A`.
  - Light: canvas `#F6F5FC`, surface `#FFFFFF`, ink `#0D0B2E` (the logo navy), line `#DDDCEE`.
  - The action colour is electric "spark" blue: `#5B6BFF` (Midnight), `#3F4FF2` (Light). It still uses the
    `--coral` token name, so components didn't change. `--glow` is its soft shadow (`shadow-glow`).
  - `--brand` `#0D0B2E` / `--on-brand` white stay the same in both themes, for brand moments (welcome
    hero, empty states).
- **Logo:** `components/Logo.tsx`, an SVG drawn with thick round strokes so the W and Y melt together,
  with a four-point sparkle punched through the D. It uses `currentColor`. `spark` fills the sparkle
  with the action blue, and `twinkle` animates it. The app icon (`app/icon.svg`, `public/icon.svg`) is
  the same mark on navy.
- **Halftone:** `<Halftone />` puts the glow behind the content: blurred light at the edges seen
  through a 5px dot grid, drifting slowly. Use it only on navy brand surfaces, with the light kept at
  the edges so white text stays readable. It's turned off under reduced motion.
- **Type:** Bricolage Grotesque (`font-display`) for headlines, DM Sans for everything else.
- **Shape:**
  - Softer, to match the bubbly logo: 14px buttons and fields, 20px cards, 28px sheets, pill chips.
  - The primary button, selected chips, my chat bubbles, the active tab and the + button glow blue.
  - Headers and the bottom bar are frosted glass (`backdrop-blur-xl`).
