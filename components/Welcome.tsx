"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Link2, Loader2, Lock, Mail, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { saveDraft } from "@/lib/draft";
import { ThemeIconButton } from "@/components/ThemeToggle";
import { btn, input, label, meta, page } from "@/lib/ui";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isHttpsUrl = (v: string) => /^https:\/\/[^\s]+\.[^\s]+/.test(v.trim());

type Errors = Partial<Record<"email" | "name" | "phone" | "social_url" | "form", string>>;

// The front door: step 1 of sign-up (email + the basics). Continue saves step 1 on this device and
// emails a sign-in link; the link brings you back to step 2. Existing users can just sign in.
export function Welcome({ linkError }: { linkError?: boolean }) {
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [errors, setErrors] = useState<Errors>(linkError ? { form: "That link didn't work. Try again." } : {});
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState("");

  async function sendLink() {
    setSending(true);
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setSending(false);
    if (error) return setErrors({ form: error.message });
    setSentTo(email.trim());
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!isEmail(email)) next.email = "Enter your email address";
    if (mode === "signup") {
      if (!name.trim()) next.name = "Add your name";
      if (!isValidPhone(normalizePhone(phone))) next.phone = "Enter a valid mobile number, e.g. 98765 43210";
      if (!isHttpsUrl(socialUrl)) next.social_url = "Paste your full LinkedIn link, starting with https://";
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    if (mode === "signup") saveDraft({ email: email.trim(), name: name.trim(), phone, social_url: socialUrl.trim() });
    await sendLink();
  }

  return (
    <main className={`${page} flex min-h-dvh flex-col pb-10 pt-4`}>
      <div className="flex items-center justify-between">
        <span className="font-display text-title">WYD?</span>
        <ThemeIconButton />
      </div>

      {sentTo ? (
        <section className="animate-fade-in mt-10 flex flex-col gap-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-candle text-on-light">
            <MailCheck size={28} />
          </span>
          <h1 className="font-display text-title">Check your inbox</h1>
          <p className="text-body text-ink-2">
            We sent a link to <strong className="text-ink">{sentTo}</strong>.{" "}
            {mode === "signup"
              ? "Tap it to continue to step 2 — we've kept your details on this device."
              : "Tap it to sign in."}
          </p>
          <p className={meta}>Open it on this device for the smoothest ride. No passwords, ever.</p>
          <div className="mt-2 flex flex-col gap-2">
            <button className={btn.secondary} disabled={sending} onClick={sendLink}>
              {sending && <Loader2 size={16} className="animate-spin" />} Send the link again
            </button>
            <button className={btn.ghost} onClick={() => setSentTo("")}>
              Use a different email
            </button>
          </div>
        </section>
      ) : (
        <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-6">
          <div>
            <h1 className="font-display text-title">{mode === "signup" ? "Welcome to WYD?" : "Welcome back"}</h1>
            <p className="mt-2 text-body text-ink-2">
              {mode === "signup"
                ? "Real people only. Find company nearby for chai, walks, movies and more."
                : "Enter your email and we'll send you a sign-in link."}
            </p>
          </div>

          {mode === "signup" && (
            <div className="flex flex-col gap-3">
              <div className="flex gap-2" aria-hidden>
                <span className="h-1.5 flex-1 rounded-pill bg-ink" />
                <span className="h-1.5 flex-1 rounded-pill bg-sunk" />
                <span className="h-1.5 flex-1 rounded-pill bg-sunk" />
              </div>
              <p className={meta}>Step 1 of 3</p>
              <div>
                <h2 className="text-h2">The basics</h2>
                <p className="mt-1 text-body text-ink-2">So people know who they&apos;re meeting, and we can check you&apos;re real.</p>
              </div>
            </div>
          )}

          <Field id="email" text="Email" error={errors.email}>
            <div className="relative">
              <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-2" aria-hidden />
              <input id="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" className={`${input} pl-11`} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
            </div>
          </Field>

          {mode === "signup" && (
            <>
              <Field id="name" text="Full name" error={errors.name}>
                <input id="name" className={input} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} autoComplete="name" placeholder="Ria Sharma" />
              </Field>

              <Field id="phone" text="Phone number" hint="Only our team sees this, to verify you. It's never shown on your profile." error={errors.phone}>
                <div className="flex gap-2">
                  <span className="flex h-12 shrink-0 items-center rounded-sm border border-line bg-sunk px-3 text-body text-ink">+91</span>
                  <input id="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" className={input} value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} />
                </div>
                <p className={`${meta} flex items-center gap-1`}>
                  <Lock size={12} /> Private
                </p>
              </Field>

              <Field
                id="social_url"
                text="LinkedIn profile"
                hint="This is how we know you're authentic. No LinkedIn? Instagram, X, GitHub or Behance also work. We never read your account or ask for passwords."
                error={errors.social_url}
              >
                <div className="relative">
                  <Link2 size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-2" aria-hidden />
                  <input id="social_url" type="url" inputMode="url" placeholder="https://linkedin.com/in/yourname" className={`${input} pl-11`} value={socialUrl} onChange={(e) => setSocialUrl(e.target.value)} aria-invalid={!!errors.social_url} />
                </div>
              </Field>
            </>
          )}

          {errors.form && <p className="font-mono text-meta text-danger">{errors.form}</p>}

          <div className="flex flex-col gap-3">
            <button type="submit" disabled={sending} className={btn.primary}>
              {sending ? <Loader2 size={18} className="animate-spin" /> : null}
              {mode === "signup" ? (
                <>
                  Continue <ArrowRight size={18} />
                </>
              ) : (
                "Send me a sign-in link"
              )}
            </button>
            <p className="text-center text-body text-ink-2">
              {mode === "signup" ? "Already on WYD?" : "New here?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setErrors({});
                  setMode(mode === "signup" ? "signin" : "signup");
                }}
                className="min-h-11 text-label text-coral-text underline"
              >
                {mode === "signup" ? "Sign in" : "Create an account"}
              </button>
            </p>
            <p className={`${meta} text-center`}>
              By continuing you agree to our{" "}
              <Link href="/privacy" className="text-coral-text underline">
                privacy notice
              </Link>
              .
            </p>
          </div>
        </form>
      )}
    </main>
  );
}

function Field({ id, text, hint, error, children }: { id: string; text: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={label}>
        {text}
      </label>
      {hint && <p className={meta}>{hint}</p>}
      {children}
      {error && <p className="font-mono text-meta text-danger">{error}</p>}
    </div>
  );
}
