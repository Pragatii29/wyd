"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => router.refresh())}
      aria-label="Refresh"
      className="inline-flex size-11 items-center justify-center rounded-full text-ink transition duration-fast ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-ink"
    >
      <RefreshCw size={20} className={pending ? "animate-spin" : ""} />
    </button>
  );
}
