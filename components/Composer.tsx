"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { createWyd } from "@/app/actions/wyd";
import { AUDIENCES, type Audience } from "@/lib/audience";
import { CITIES, type City } from "@/lib/cities";
import { btn, input, label, meta } from "@/lib/ui";

const MAX = 280;
const IDEAS = ["Chai and a chat after work?", "Anyone up for a movie tonight?", "Looking for people to play cricket this evening."];

export function Composer({ city: activeCity, area: defaultArea }: { city: string; area: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [city, setCity] = useState(activeCity);
  const [area, setArea] = useState(defaultArea);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [inReview, setInReview] = useState(false);

  const selected = AUDIENCES.find((a) => a.value === audience)!;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return setError("Write your plan first.");
    setSaving(true);
    setError("");
    const res = await createWyd({ body, audience, city: city as City, area });
    setSaving(false);
    if (!res.ok) return setError(res.unsafe ? `Let's keep it friendly — ${res.error} Edit it and try again.` : res.error);
    if (res.status === "review") return setInReview(true);
    router.push(`/wyd/${res.id}`);
    router.refresh();
  }

  if (inReview) {
    return (
      <div className="mt-8 flex flex-col gap-4">
        <p className="rounded-card bg-surface p-4 text-body text-ink shadow-card">
          Thanks! Your WYD needs a quick look from our team before it goes live. Nobody is notified until then.
        </p>
        <button className={btn.secondary} onClick={() => router.push("/feed")}>
          Back to feed
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-8" noValidate>
      <div className="flex flex-col gap-2">
        <label htmlFor="body" className={label}>
          What are you doing?
        </label>
        <textarea
          id="body"
          rows={4}
          maxLength={MAX}
          autoFocus
          placeholder="Evening walk at Cubbon Park, 6pm?"
          className={`${input} h-auto py-3 text-wyd`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          aria-invalid={!!error}
        />
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {!body &&
              IDEAS.map((idea) => (
                <button key={idea} type="button" onClick={() => setBody(idea)} className="rounded-pill bg-sunk px-3 py-1 text-label text-ink">
                  {idea}
                </button>
              ))}
          </div>
          <span className={`${meta} shrink-0`}>
            {body.length}/{MAX}
          </span>
        </div>
        {error && <p className="rounded-sm border border-danger bg-surface px-3 py-2 text-label text-danger">{error}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="city" className={label}>
            City
          </label>
          <select id="city" className={input} value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="area" className={label}>
            Area
          </label>
          <input id="area" className={input} value={area} placeholder="Indiranagar" onChange={(e) => setArea(e.target.value)} />
        </div>
      </div>
      {city !== activeCity && <p className={meta}>Only people whose active city is {city} will see this.</p>}

      <fieldset className="flex flex-col gap-2">
        <legend className={`${label} mb-2`}>Who can see it?</legend>
        <div className="flex rounded-pill bg-sunk p-1" role="radiogroup">
          {AUDIENCES.map(({ value, label: text, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={audience === value}
              onClick={() => setAudience(value)}
              className={`flex h-11 flex-1 items-center justify-center gap-1 rounded-pill text-label transition duration-base ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                audience === value ? "bg-ink text-bone" : "text-ink"
              }`}
            >
              <Icon size={16} aria-hidden /> {text}
            </button>
          ))}
        </div>
        <p className={meta}>{selected.helper}</p>
      </fieldset>

      <div className="flex flex-col gap-2">
        <button type="submit" disabled={saving} className={btn.primary}>
          {saving && <Loader2 className="animate-spin" size={18} />}
          Drop a WYD · {selected.label}
        </button>
        <p className={`${meta} flex items-start gap-1`}>
          <ShieldCheck size={14} className="mt-0.5 shrink-0" /> Every WYD is screened automatically before it goes live. That helps, but it
          isn&apos;t a safety guarantee: meet in public places.
        </p>
      </div>
    </form>
  );
}
