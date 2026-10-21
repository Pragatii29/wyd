"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignInForm({ initialError }: { initialError?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState(initialError ? "That link didn't work. Try again." : "");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setError("");
    const { error } = await createClient().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setState("idle");
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return (
      <p className="rounded-card bg-surface p-4 text-body text-ink shadow-card">
        Check your inbox. We sent a sign in link to <strong>{email}</strong>.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label htmlFor="email" className="text-label text-bone">
        Your email
      </label>
      <input
        id="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        aria-invalid={!!error}
        className={`h-12 rounded-sm border bg-surface px-4 text-body text-ink placeholder:text-ink-3 focus:border-2 focus:border-ink focus:outline-none ${
          error ? "border-danger" : "border-line"
        }`}
      />
      {error && <p className="text-meta font-mono text-bone">{error}</p>}
      <button
        type="submit"
        disabled={state === "loading"}
        className="flex h-13 items-center justify-center gap-2 rounded-pill bg-bone text-label text-ink transition duration-fast ease-out hover:opacity-90 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone disabled:bg-sunk disabled:text-ink-3"
      >
        {state === "loading" ? <Loader2 className="animate-spin" size={18} /> : <Mail size={18} />}
        Send me a sign in link
      </button>
    </form>
  );
}
