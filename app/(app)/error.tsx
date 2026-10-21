"use client";

import { btn, page } from "@/lib/ui";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className={`${page} flex flex-col gap-4 pt-16`}>
      <h1 className="font-display text-title">Something went wrong</h1>
      <p className="text-body text-ink-2">We couldn&apos;t load this. Check your connection and try again.</p>
      <p className="font-mono text-meta text-ink-2">{error.message}</p>
      <button onClick={reset} className={btn.primary}>
        Try again
      </button>
    </main>
  );
}
