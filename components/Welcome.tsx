"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { saveDraft } from "@/lib/draft";
import { isValidSocialUrl, SOCIAL_ERROR, toSocialUrl, type PlatformId } from "@/lib/social";
import { SocialLinkField } from "@/components/SocialLinkField";
import { ThemeIconButton } from "@/components/ThemeToggle";
import { btn, input, label, meta } from "@/lib/ui";
import { PlanTicker } from "@/components/PlanTicker";
import { Logo, Nebula } from "@/components/Logo";
import { StepHeader } from "@/components/StepHeader";

type Errors = Partial<Record<"name" | "phone" | "social_url" | "form", string>>;

// The front door: step 1 of sign-up. No email or password: Continue creates a test account on this
// device (Supabase anonymous sign-in) and goes straight to step 2.
export function Welcome() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [platform, setPlatform] = useState<PlatformId>("linkedin");
  const [social, setSocial] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!name.trim()) next.name = "Add your name";
    if (!isValidPhone(normalizePhone(phone))) next.phone = "Enter a valid mobile number, e.g. 98765 43210";
    const socialUrl = toSocialUrl(platform, social);
    if (socialUrl && !isValidSocialUrl(socialUrl)) next.social_url = SOCIAL_ERROR;
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    saveDraft({ email: "", name: name.trim(), phone, social_url: socialUrl });
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
      {/* Hero: the brand moment. Always warm black, with the nebula glow and glitter behind the logo. */}
      <section className="relative overflow-hidden bg-brand pb-12 text-on-brand">
        <Nebula />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand" aria-hidden />
        <div className="relative flex items-center justify-end px-3 pt-3">
          <ThemeIconButton className="text-on-brand" />
        </div>
        <div className="relative flex flex-col items-center px-5 pb-2 pt-6 text-center">
          <Logo className="h-24 w-auto drop-shadow-[0_8px_40px_rgba(255,120,180,0.45)]" spark twinkle />
          <p className="mt-6 text-eyebrow uppercase tracking-[0.12em] text-on-brand/70">Bengaluru · Mumbai · Delhi · and more</p>
          <h1 className="mt-3 font-display text-hero">
            Got a plan?
            <br />
            Find <span className="text-shine">your people.</span>
          </h1>
          <p className="mt-3 max-w-xs text-body text-on-brand/75">Post what you&apos;re up to. Verified people nearby who are into the same things ask to join.</p>
        </div>
        <div className="relative mt-8">
          <PlanTicker />
        </div>
      </section>

      <form onSubmit={onSubmit} noValidate className="relative -mt-6 flex flex-1 flex-col gap-6 rounded-t-sheet bg-surface px-5 pb-10 pt-7 shadow-float">
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

        <SocialLinkField platform={platform} value={social} onPlatform={setPlatform} onValue={setSocial} error={errors.social_url} />

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
