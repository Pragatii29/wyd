"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, MapPin } from "lucide-react";
import { setActiveCity } from "@/app/actions/profile";
import { CITIES } from "@/lib/cities";

// Shows the active city and lets the user switch it. The feed and notifications follow it.
export function CitySwitcher({ city, area, inline }: { city: string; area?: string; inline?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  if (inline) {
    return (
      <label className="relative inline-flex min-h-11 max-w-full items-center gap-1.5 text-label text-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
        {pending ? <Loader2 size={16} className="shrink-0 animate-spin" /> : <MapPin size={16} className="shrink-0 text-coral-text" aria-hidden />}
        {area && <span className="truncate text-ink-2">{area},</span>}
        <span className="sr-only">Active city</span>
        <select
          value={city}
          disabled={pending}
          onChange={(e) =>
            start(async () => {
              setError("");
              const res = await setActiveCity(e.target.value);
              if (!res.ok) setError(res.error);
              router.refresh();
            })
          }
          className="shrink-0 appearance-none bg-transparent pr-5 text-label text-ink underline decoration-line underline-offset-4 focus:outline-none"
        >
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none -ml-5 shrink-0" aria-hidden />
        {error && <span className="ml-2 font-mono text-meta text-danger">{error}</span>}
      </label>
    );
  }

  return (
    <div className="flex flex-col">
      <label className="relative inline-flex h-11 items-center gap-1 rounded-pill bg-sunk pl-3 pr-8 text-label text-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
        {pending ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} aria-hidden />}
        <span className="sr-only">Active city</span>
        <select
          value={city}
          disabled={pending}
          onChange={(e) =>
            start(async () => {
              setError("");
              const res = await setActiveCity(e.target.value);
              if (!res.ok) setError(res.error);
              router.refresh();
            })
          }
          className="appearance-none bg-transparent pr-1 text-label focus:outline-none"
        >
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3" aria-hidden />
      </label>
      {error && <p className="mt-1 font-mono text-meta text-danger">{error}</p>}
    </div>
  );
}
