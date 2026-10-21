"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Link2, Loader2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { saveDraft } from "@/lib/draft";
import { ThemeIconButton } from "@/components/ThemeToggle";
import { btn, input, label, meta, page } from "@/lib/ui";

const isHttpsUrl = (v: string) => /^https:\/\/[^\s]+\.[^\s]+/.test(v.trim());

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
    if (!isHttpsUrl(socialUrl)) next.social_url = "Paste your full LinkedIn link, starting with https://";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    saveDraft({ email: "", name: name.trim(), phone, social_url: socialUrl.trim() });
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
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
    <main className={`${page} flex min-h-dvh flex-col pb-10 pt-4`}>
      <div className="flex items-center justify-between">
        <span className="font-display text-title">WYD?</span>
        <ThemeIconButton />
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-6">
        <div>
          <h1 className="font-display text-title">Welcome to WYD?</h1>
          <p className="mt-2 text-body text-ink-2">Real people only. Find company nearby for chai, walks, movies and more.</p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2" aria-hidden>
            <span className="h-1.5 flex-1 rounded-pill bg-ink" />
            <span className="h-1.5 flex-1 rounded-pill bg-sunk" />
            <span className="h-1.5 flex-1 rounded-pill bg-sunk" />
          </div>
          <p className={meta}>Step 1 of 3</p>
          <div>
            <h2 className="text-h2">The basics</h2>
            <p className="mt-1 text-body text-ink-2">So people know who they&apos;re meeting.</p>
          </div>
        </div>

        <Field id="name" text="Full name" error={errors.name}>
          <input id="name" className={input} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} autoComplete="name" placeholder="Ria Sharma" />
        </Field>

        <Field id="phone" text="Phone number" hint="Never shown on your profile." error={errors.phone}>
          <div className="flex gap-2">
            <span className="flex h-12 shrink-0 items-center rounded-sm border border-line bg-sunk px-3 text-body text-ink">+91</span>
            <input id="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="98765 43210" className={input} value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={!!errors.phone} />
          </div>
          <p className={`${meta} flex items-center gap-1`}>
            <Lock size={12} /> Private
          </p>
        </Field>

        <Field id="social_url" text="LinkedIn profile" hint="No LinkedIn? Instagram, X, GitHub or Behance also work." error={errors.social_url}>
          <div className="relative">
            <Link2 size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-2" aria-hidden />
            <input id="social_url" type="url" inputMode="url" placeholder="https://linkedin.com/in/yourname" className={`${input} pl-11`} value={socialUrl} onChange={(e) => setSocialUrl(e.target.value)} aria-invalid={!!errors.social_url} />
          </div>
        </Field>

        {errors.form && <p className="rounded-sm border border-danger bg-surface px-3 py-2 text-label text-danger">{errors.form}</p>}

        <div className="flex flex-col gap-3">
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
