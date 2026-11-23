"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { submitContact, type ContactResult } from "@/app/actions/contact";
import { btn, input, label, meta } from "@/lib/ui";

type Errors = Extract<ContactResult, { ok: false }>["errors"];

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<null | { emailed: boolean }>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const res = await submitContact({ name, email, message, website });
      if (res.ok) setSent({ emailed: res.emailed });
      else setErrors(res.errors);
    } catch {
      setErrors({ form: "We couldn't send your message. Check your connection and try again." });
    }
    setBusy(false);
  }

  if (sent) {
    return (
      <div role="status" className="stitch stitch-loose animate-fade-in mt-8 flex flex-col items-center gap-3 rounded-card border border-line bg-surface p-6 text-center shadow-card">
        <span className="flex size-12 items-center justify-center rounded-full bg-ink text-on-ink">
          <Check size={22} />
        </span>
        <h2 className="font-display text-h2">Thanks, {name.trim().split(" ")[0]}!</h2>
        <p className="text-body text-ink-2">
          {sent.emailed ? `We got your question. A confirmation is on its way to ${email.trim()}.` : "We got your question and will reply by email soon."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="stitch stitch-loose mt-8 flex flex-col gap-5 rounded-card border border-line bg-surface p-5 shadow-card">
      <Field id="c-name" text="Your name" error={errors.name}>
        <input id="c-name" autoComplete="name" className={input} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
      </Field>
      <Field id="c-email" text="Email" error={errors.email}>
        <input id="c-email" type="email" inputMode="email" autoComplete="email" className={input} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
      </Field>
      <Field id="c-message" text="Your question" error={errors.message}>
        <textarea id="c-message" rows={5} className={`${input} h-auto py-4`} value={message} onChange={(e) => setMessage(e.target.value)} aria-invalid={!!errors.message} />
      </Field>
      {/* Honeypot for bots: hidden from people and screen readers. */}
      <input tabIndex={-1} autoComplete="off" aria-hidden className="sr-only" name="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
      {errors.form && <p role="alert" className="font-mono text-meta text-danger">{errors.form}</p>}
      <button type="submit" disabled={busy} className={btn.primary}>
        {busy && <Loader2 size={18} className="animate-spin" />} Send message
      </button>
      <p className={`${meta} text-center`}>We only use your email to reply to this message.</p>
    </form>
  );
}

function Field({ id, text, error, children }: { id: string; text: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={label}>
        {text}
      </label>
      {children}
      {error && <p className="font-mono text-meta text-danger">{error}</p>}
    </div>
  );
}
