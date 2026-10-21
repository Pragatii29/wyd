"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin } from "lucide-react";
import { AUDIENCES, type Audience } from "@/lib/audience";
import { btn, input, label, meta } from "@/lib/ui";

const MAX = 280;

export function NewWydForm({ area }: { area: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [inReview, setInReview] = useState(false);

  const helper = AUDIENCES.find((a) => a.value === audience)!.helper;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return setError("Write your plan first.");
    setSaving(true);
    setError("");
    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, audience }),
    });
    const data = await res.json().catch(() => ({ error: "Something went wrong. Try again." }));
    setSaving(false);

    if (!res.ok) {
      return setError(data.verdict === "unsafe" ? `Let's keep it friendly — ${data.error}` : data.error);
    }
    if (data.status === "review") return setInReview(true);
    router.push("/feed");
    router.refresh();
  }

  if (inReview) {
    return (
      <div className="mt-8 flex flex-col gap-4">
        <p className="rounded-card bg-surface p-4 text-body text-ink shadow-card">
          Thanks! We&apos;re taking a quick look at your WYD before it goes live.
        </p>
        <button className={btn.secondary} onClick={() => router.push("/feed")}>
          Back to feed
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-8" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="body" className={label}>
          What are you doing?
        </label>
        <textarea
          id="body"
          rows={4}
          maxLength={MAX}
          placeholder="Evening walk at Cubbon Park, 6pm?"
          className={`${input} h-auto py-3 text-wyd`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          aria-invalid={!!error}
          aria-describedby="body-meta"
        />
        <div id="body-meta" className="flex items-center justify-between">
          <span className={`${meta} inline-flex items-center gap-1`}>
            <MapPin size={12} /> {area}
          </span>
          <span className={meta}>
            {body.length}/{MAX}
          </span>
        </div>
        {error && <p className="font-mono text-meta text-danger">{error}</p>}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={`${label} mb-2`}>Who can see it?</legend>
        <div className="flex rounded-pill bg-sunk p-1">
          {AUDIENCES.map(({ value, label: text, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setAudience(value)}
              aria-pressed={audience === value}
              className={`flex h-11 flex-1 items-center justify-center gap-1 rounded-pill text-label transition duration-base ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                audience === value ? "bg-ink text-bone" : "text-ink"
              }`}
            >
              <Icon size={16} /> {text}
            </button>
          ))}
        </div>
        <p className={meta}>{helper}</p>
      </fieldset>

      <button type="submit" disabled={saving} className={btn.primary}>
        {saving && <Loader2 className="animate-spin" size={18} />}
        Drop a WYD
      </button>
    </form>
  );
}
