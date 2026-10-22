"use client";

import { Link2 } from "lucide-react";
import { PLATFORMS, type PlatformId } from "@/lib/social";
import { input, label, meta } from "@/lib/ui";

// Optional social profile: pick LinkedIn / Instagram / X / Threads / Other, then a handle or link.
export function SocialLinkField({
  platform,
  value,
  onPlatform,
  onValue,
  error,
}: {
  platform: PlatformId;
  value: string;
  onPlatform: (p: PlatformId) => void;
  onValue: (v: string) => void;
  error?: string;
}) {
  const current = PLATFORMS.find((p) => p.id === platform) ?? PLATFORMS[0];
  return (
    <div id="field-social_url" className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor="social_url" className={label}>
          Social profile
        </label>
        <span className="rounded-pill bg-sunk px-2 py-0.5 font-mono text-meta text-ink-2">Optional</span>
      </div>
      <div role="radiogroup" aria-label="Platform" className="flex flex-wrap gap-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="radio"
            aria-checked={platform === p.id}
            onClick={() => onPlatform(p.id)}
            className={`h-9 rounded-pill border px-3.5 text-label transition duration-fast ease-out ${
              platform === p.id ? "border-ink bg-ink text-on-ink" : "border-line bg-canvas text-ink hover:bg-sunk"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <Link2 size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
        <input
          id="social_url"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder={current.placeholder}
          className={`${input} pl-11`}
          value={value}
          onChange={(e) => onValue(e.target.value)}
          aria-invalid={!!error}
        />
      </div>
      {error ? (
        <p className="font-mono text-meta text-danger">{error}</p>
      ) : (
        <p className={meta}>Helps people see you&apos;re real. Skip it if you&apos;d rather not. We never read your account.</p>
      )}
    </div>
  );
}
