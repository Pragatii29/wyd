"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Link2, Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { saveDraft } from "@/lib/draft";
import { ThemeIconButton } from "@/components/ThemeToggle";
import { btn, eyebrow, input, label, meta } from "@/lib/ui";
import { PlanTicker } from "@/components/PlanTicker";
import { StepHeader } from "@/components/StepHeader";

const isHttpsUrl = (v: string) => /^https:\/\/[^\s]+\.[^\s]+/.test(v.trim());
const withHttps = (v: string) => (v.trim() && !/^https?:\/\//.test(v.trim()) ? `https://${v.trim()}` : v.trim());

type Errors = Partial<Record<"name" | "phone" | "social_url" | "form", string>>;

// The front door: step 1 of sign-up. No email or password: Continue creates a test account on this
// device (Supabase anonymous sign-in) and goes straight to step 2.
export function Welcome() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Add your name";
    if (!isValidPhone(normalizePhone(phone))) next.phone = "Enter a valid mobile number, e.g. 98765 43210";
    if (!isHttpsUrl(withHttps(socialUrl))) next.social_url = "Paste your full LinkedIn link, starting with https://";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    saveDraft({ email: "", name: name.trim(), phone, social_url: withHttps(socialUrl) });
    const supabase = createClient();
    // Ask the server whether the saved sign-in still belongs to a real account. A stale one (e.g. the
    // account was deleted) would otherwise send the next page straight back here in a loop.
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      await supabase.auth.signOut({ scope: "local" }).catch(() => {});
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        setBusy(false);
        return setErrors({
          form: error.message.includes("disabled")
            ? "Sign-up is switched off right now: turn on anonymous sign-ins in Supabase (Authentication → Sign In / Providers)."
            : error.message,
        });
      }
    }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col">
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="font-display text-title">WYD?</span>
        <ThemeIconButton />
      </div>

      <section className="px-5 pt-8">
        <p className={eyebrow}>Bengaluru · Mumbai · Delhi · and more</p>
        <h1 className="mt-3 font-display text-hero text-ink">
          Got a plan?
          <br />
          Find your people.
        </h1>
        <p className="mt-3 text-body text-ink-2">Post what you&apos;re up to. Verified people nearby who are into the same things ask to join.</p>
      </section>

      <div className="mt-6">
        <PlanTicker />
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-1 flex-col gap-6 rounded-t-sheet border-t border-line bg-surface px-5 pb-10 pt-7">
        <StepHeader step={1} title="The basics" blurb="So people know who they're meeting." />

        <Field id="name" text="Full name" error={errors.name}>
          <input id="name" className={input} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} autoComplete="name" placeholder="Ria Sharma" />
        </Field>

        <Field
          id="phone"
          text="Phone number"
          badge={
            <span className="inline-flex items-center gap-1 rounded-pill bg-sunk px-2 py-0.5 font-mono text-meta text-ink-2">
              <Lock size={11} /> Private
            </span>
          }
          error={errors.phone}
        >
          <div className="flex gap-2">
            <span className="flex h-13 shrink-0 items-center rounded-field bg-sunk px-4 text-body text-ink-2">+91</span>
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" className={input} value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} />
          </div>
        </Field>

        <Field id="social_url" text="LinkedIn profile" hint="Or Instagram, X, GitHub, Behance." error={errors.social_url}>
          <div className="relative">
            <Link2 size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
            <input id="social_url" type="url" inputMode="url" placeholder="linkedin.com/in/yourname" className={`${input} pl-11`} value={socialUrl} onChange={(e) => setSocialUrl(e.target.value)} onBlur={() => setSocialUrl((v) => (v && !/^https?:\/\//.test(v) ? `https://${v.trim()}` : v))} aria-invalid={!!errors.social_url} />
          </div>
        </Field>

        {errors.form && <p className="rounded-field border border-danger px-4 py-3 text-label text-danger">{errors.form}</p>}

        <div className="mt-auto flex flex-col gap-3 pt-2">
          <button type="submit" disabled={busy} className={btn.primary}>
            {busy ? <Loader2 size={18} className="animate-spin" /> : null}
            Continue <ArrowRight size={18} />
          </button>
          <p className={`${meta} text-center`}>
            By continuing you agree to our{" "}
            <Link href="/privacy" className="text-coral-text underline">
              privacy notice
            </Link>
            .
          </p>
        </div>
      </form>
    </main>
  );
}

function Field({
  id,
  text,
  hint,
  badge,
  error,
  children,
}: {
  id: string;
  text: string;
  hint?: string;
  badge?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className={label}>
          {text}
        </label>
        {badge}
      </div>
      {children}
      {error ? <p className="font-mono text-meta text-danger">{error}</p> : hint && <p className={meta}>{hint}</p>}
    </div>
  );
}
