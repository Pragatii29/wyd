"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.refresh();
      }}
      className="h-13 w-full rounded-pill border border-line bg-surface text-label text-ink transition duration-fast ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      Sign out
    </button>
  );
}
