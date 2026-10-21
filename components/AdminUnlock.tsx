"use client";

import { useActionState } from "react";
import Link from "next/link";
import { KeyRound, Loader2 } from "lucide-react";
import { unlockAdmin } from "@/app/actions/admin";
import { btn, input, meta, page } from "@/lib/ui";

// Shown on /admin until this device is unlocked with the admin passcode.
export function AdminUnlock() {
  const [error, action, pending] = useActionState(unlockAdmin, null);
  return (
    <main className={`${page} flex flex-col gap-4 pt-16`}>
      <KeyRound size={32} className="text-coral" aria-hidden />
      <h1 className="font-display text-title">Admin</h1>
      <p className="text-body text-ink-2">Enter the admin passcode to review sign-ups, WYDs and reports on this device.</p>
      <form action={action} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-label">Passcode</span>
          <input name="passcode" type="password" required autoComplete="current-password" className={input} />
        </label>
        {error && <p className="font-mono text-meta text-danger">{error}</p>}
        <button className={btn.primary} disabled={pending}>
          {pending && <Loader2 size={16} className="animate-spin" />} Unlock admin
        </button>
      </form>
      <p className={meta}>Stays unlocked for 12 hours, or until you tap Lock.</p>
      <Link href="/" className={btn.ghost}>
        Back to WYD?
      </Link>
    </main>
  );
}
