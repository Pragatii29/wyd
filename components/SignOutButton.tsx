"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Signs out and returns to the sign-in page.
export function SignOutButton({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await createClient().auth.signOut();
        router.push("/");
        router.refresh();
      }}
      className={
        compact
          ? "inline-flex min-h-11 items-center gap-1 px-2 text-label text-ink-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"
          : "inline-flex h-13 w-full items-center justify-center gap-2 rounded-pill border border-danger bg-surface text-label text-danger transition duration-fast ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      }
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />} Sign out
    </button>
  );
}
