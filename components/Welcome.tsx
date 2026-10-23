"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveDraft } from "@/lib/draft";
import { ThemeIconButton } from "@/components/ThemeToggle";
import { Haze, Logo } from "@/components/Logo";
import { SIGNUP_STEPS, SlideShell } from "@/components/SlideShell";
import { btn, input, meta } from "@/lib/ui";

type Phase = "splash" | "intro" | "name";

// The front door: a short logo splash, an intro screen, then the first sign-up question (your name).
// No email or password: Next creates a test account on this device (Supabase anonymous sign-in)
// and the rest of the questions continue on /onboarding, one per screen.
export function Welcome() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("splash");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // The splash plays once, then hands over to the intro.
  useEffect(() => {
    if (phase !== "splash") return;
    const t = setTimeout(() => setPhase("intro"), 1900);
    return () => clearTimeout(t);
  }, [phase]);

  async function start() {
    if (!name.trim()) return setError("Add your name to continue");
    setBusy(true);
    setError("");
    saveDraft({ email: "", name: name.trim(), phone: "", social_url: "" });
    const supabase = createClient();
    // Ask the server whether the saved sign-in still belongs to a real account. A stale one (e.g. the
    // account was deleted) would otherwise send the next page straight back here in a loop.
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      await supabase.auth.signOut({ scope: "local" }).catch(() => {});
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        setBusy(false);
        return setError(
          error.message.includes("disabled")
            ? "Sign-up is switched off right now: turn on anonymous sign-ins in Supabase (Authentication → Sign In / Providers)."
            : error.message,
        );
      }
    }
    router.push("/onboarding");
    router.refresh();
  }

  if (phase === "name") {
    return (
      <SlideShell
        step={1}
        total={SIGNUP_STEPS}
        onBack={() => setPhase("intro")}
        question="What should we call you?"
        hint="Your first name is what people see."
        onNext={start}
        busy={busy}
        error={error}
      >
        <label htmlFor="name" className="sr-only">
          Full name
        </label>
        <input
          id="name"
          autoFocus
          autoComplete="name"
          placeholder="Your full name"
          className={`${input} text-center text-wyd`}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
        />
      </SlideShell>
    );
  }

  // Splash and intro share the hazy espresso stage; the logo twirls in, then the line and button rise.
  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col overflow-hidden bg-brand text-on-brand">
      <Haze sphere={false} />
      <div className="relative flex justify-end px-3 pt-3">{phase === "intro" && <ThemeIconButton className="text-on-brand" />}</div>
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        <Logo className="animate-twirl-in h-28 w-auto drop-shadow-[0_10px_40px_rgba(0,0,0,0.25)]" spark twinkle />
        {phase === "intro" && (
          <>
            <p className="animate-rise-in mt-8 font-display text-title">
              Got a plan?
              <br />
              <span className="text-shine font-serif text-hero-accent italic">Find your people.</span>
            </p>
            <p className="animate-rise-in mt-3 max-w-xs text-body text-on-brand/70 [animation-delay:120ms]">
              Verified people nearby who are into the same things.
            </p>
          </>
        )}
      </div>
      {phase === "intro" && (
        <div className="animate-rise-in relative flex flex-col gap-3 px-6 pb-[calc(28px+env(safe-area-inset-bottom))] [animation-delay:240ms]">
          <button type="button" onClick={() => setPhase("name")} className={btn.brand}>
            Get started <ArrowRight size={18} />
          </button>
          <p className={`${meta} text-center text-on-brand/60`}>
            By continuing you agree to our{" "}
            <Link href="/privacy" className="underline">
              privacy notice
            </Link>
            .
          </p>
        </div>
      )}
    </main>
  );
}
