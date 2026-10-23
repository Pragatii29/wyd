"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SewingButton, buttonLook } from "@/components/SewingButton";
import { btn } from "@/lib/ui";

// Sign-up questions, in order: name · photos · gender · birthday · phone · city · social · about · interests.
export const SIGNUP_STEPS = 9;

// One sign-up question per screen: back · logo · "3/9" on top, the question in large type,
// the answer area in a glass panel, and one pinned button. Enter submits.
export function SlideShell({
  step,
  total,
  onBack,
  greeting,
  question,
  hint,
  children,
  cta = "Next",
  onNext,
  busy,
  disabled,
  secondary,
  error,
}: {
  step: number;
  total: number;
  onBack?: () => void;
  // Optional line above the question, e.g. "Hey [photo] Ria".
  greeting?: React.ReactNode;
  question: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  cta?: string;
  onNext: () => void;
  busy?: boolean;
  disabled?: boolean;
  // e.g. a "Skip" button under the main one.
  secondary?: React.ReactNode;
  error?: string;
}) {
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!busy && !disabled) onNext();
      }}
      className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col px-5 pb-[calc(20px+env(safe-area-inset-bottom))]"
    >
      <header className="grid h-16 grid-cols-[44px_1fr_44px] items-center">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Back" className="inline-flex size-11 items-center justify-center rounded-full text-ink transition duration-fast ease-out active:scale-[0.97]">
            <ArrowLeft size={22} />
          </button>
        ) : (
          <span />
        )}
        <Logo className="mx-auto h-6 w-auto text-ink" spark />
        <span className="text-right font-mono text-meta text-ink-2" aria-label={`Step ${step} of ${total}`}>
          {step}/{total}
        </span>
      </header>
      {/* Progress as a row of buttons: the ones you've done are sewn on. */}
      <div className="flex items-center justify-between px-1" aria-hidden>
        {Array.from({ length: total }, (_, i) =>
          i < step ? (
            <SewingButton key={i} {...buttonLook(i)} shape="round" holes={4} sewn size={22} />
          ) : (
            <span key={i} className="flex size-[22px] items-center justify-center">
              <span className="size-3.5 rounded-full border border-dashed border-ink-3" />
            </span>
          ),
        )}
      </div>

      {/* key: each new question slides in */}
      <div key={step} className="animate-slide-in flex flex-1 flex-col">
        <div className="flex flex-col items-center pb-8 pt-12 text-center">
          {greeting && <div className="mb-6 font-display text-title text-ink">{greeting}</div>}
          <h1 className="font-display text-title text-ink">{question}</h1>
          {hint && <p className="mt-2 max-w-xs text-body text-ink-2">{hint}</p>}
        </div>
        <div className="stitch stitch-loose flex flex-col gap-3 rounded-card border border-line bg-surface p-5 shadow-card">{children}</div>
        {error && (
          <p role="alert" className="mt-3 text-center font-mono text-meta text-danger">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-6">
        <button type="submit" disabled={busy || disabled} className={btn.primary}>
          {busy && <Loader2 size={18} className="animate-spin" />} {cta}
        </button>
        {secondary}
      </div>
    </form>
  );
}
