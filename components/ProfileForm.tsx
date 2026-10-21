"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Check, Loader2, Plus, Sparkles, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveProfile, suggestFromAbout, type ProfileErrors } from "@/app/actions/profile";
import { TAGS, type Tag } from "@/lib/tags";
import { CITIES } from "@/lib/cities";
import type { Tables } from "@/lib/database.types";
import { btn, chip, input, label, meta, tagLabel } from "@/lib/ui";

const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_WORDS = 250;

function maxDob() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export function ProfileForm({
  userId,
  initial,
  submitLabel,
  next,
}: {
  userId: string;
  initial: Tables<"profiles"> | null;
  submitLabel: string;
  next: string;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState(initial?.name ?? "");
  const [dob, setDob] = useState(initial?.dob ?? "");
  const [gender, setGender] = useState<"female" | "male" | "">(initial?.gender ?? "");
  const [photoUrl, setPhotoUrl] = useState(initial?.photo_url ?? "");
  const [socialUrl, setSocialUrl] = useState(initial?.social_url ?? "");
  const [city, setCity] = useState(initial?.city ?? "Bengaluru");
  const [area, setArea] = useState(initial?.area ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [interests, setInterests] = useState<Tag[]>((initial?.interests ?? []) as Tag[]);

  // AI suggestions stay separate until the user confirms them.
  const [suggested, setSuggested] = useState<Tag[]>([]);
  const [suggestedArea, setSuggestedArea] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState("");
  const [aiPath, setAiPath] = useState<"ai" | "fallback" | null>(null);

  const [uploading, setUploading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [showAll, setShowAll] = useState(false);

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) return setErrors({ photo_url: "Use a JPG, PNG or WebP photo" });
    if (file.size > 5 * 1024 * 1024) return setErrors({ photo_url: "Photo must be under 5 MB" });
    setUploading(true);
    setErrors({});
    const path = `${userId}/${Date.now()}.${file.type.split("/")[1]}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file);
    if (error) setErrors({ photo_url: error.message });
    else setPhotoUrl(supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl);
    setUploading(false);
  }

  async function suggest(text: string) {
    setSuggesting(true);
    setErrors({});
    const res = await suggestFromAbout(text);
    setSuggesting(false);
    if (!res.ok) return setErrors({ bio: res.error });
    setAiPath(res.path);
    setSuggested(res.interests.filter((t) => !interests.includes(t as Tag)) as Tag[]);
    setSuggestedArea(res.area && res.area !== area ? res.area : null);
    setMissing(res.missing_fields.filter((f) => !(f === "area" && area) && !(f === "interests" && interests.length)));
  }

  function toggle(tag: Tag) {
    setInterests((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function confirmSuggestion(tag: Tag) {
    setInterests((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    setSuggested((prev) => prev.filter((t) => t !== tag));
    setMissing((prev) => prev.filter((m) => m !== "interests"));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (words(bio) > MAX_WORDS) return setErrors({ bio: "Keep it to 250 words or less" });
    setSaving(true);
    setErrors({});
    const res = await saveProfile({
      name, dob, gender: gender as "female", photo_url: photoUrl, social_url: socialUrl, city: city as "Bengaluru", area, bio, interests,
    });
    if (!res.ok) {
      setSaving(false);
      setErrors(res.errors);
      document.getElementById(`field-${Object.keys(res.errors)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    router.push(next);
    router.refresh();
  }

  const visibleTags = showAll ? TAGS : TAGS.filter((t) => interests.includes(t)).concat(TAGS.filter((t) => !interests.includes(t)).slice(0, 12));

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-8" noValidate>
      <section id="field-photo_url" className="flex flex-col items-center gap-3">
        <label
          htmlFor="photo"
          className="relative flex size-32 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-sunk focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink"
        >
          {photoUrl ? (
            <Image src={photoUrl} alt="Your profile photo" fill sizes="128px" className="object-cover" />
          ) : uploading ? (
            <Loader2 className="animate-spin text-ink-3" />
          ) : (
            <Camera className="text-ink-3" size={32} />
          )}
          <input id="photo" type="file" accept={PHOTO_TYPES.join(",")} className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
        </label>
        <p className={meta}>{photoUrl ? "Tap to change" : "A clear, recent photo of just you"}</p>
        {errors.photo_url && <FieldError msg={errors.photo_url} />}
      </section>

      <Field id="name" text="Name" error={errors.name}>
        <input id="name" className={input} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} autoComplete="given-name" />
      </Field>

      <Field id="dob" text="Date of birth" hint="We only show your age, never your birthday. You must be 18+." error={errors.dob}>
        <input id="dob" type="date" max={maxDob()} className={input} value={dob} onChange={(e) => setDob(e.target.value)} aria-invalid={!!errors.dob} />
      </Field>

      <fieldset id="field-gender" className="flex flex-col gap-2">
        <legend className={`${label} mb-1`}>Gender</legend>
        <p className={`${meta} mb-1`}>Used only for Women only and Men only plans. We never guess it.</p>
        <div className="flex gap-2">
          {(["female", "male"] as const).map((g) => (
            <button key={g} type="button" onClick={() => setGender(g)} className={`${chip(gender === g)} h-11 flex-1 justify-center`} aria-pressed={gender === g}>
              {g === "female" ? "Woman" : "Man"}
            </button>
          ))}
        </div>
        {errors.gender && <FieldError msg={errors.gender} />}
      </fieldset>

      <Field id="social_url" text="Social profile link" hint="Instagram, LinkedIn, X, Facebook, GitHub or Behance. Our team opens it to verify you. We never read your account or ask for passwords." error={errors.social_url}>
        <input id="social_url" type="url" inputMode="url" placeholder="https://instagram.com/yourname" className={input} value={socialUrl} onChange={(e) => setSocialUrl(e.target.value)} aria-invalid={!!errors.social_url} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field id="city" text="Your city" error={errors.city}>
          <select id="city" className={input} value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field id="area" text="Area (optional)" error={errors.area}>
          <input id="area" placeholder="Indiranagar" className={input} value={area} onChange={(e) => setArea(e.target.value)} />
        </Field>
      </div>

      <Field id="bio" text="Tell us about yourself in 250 words or less." error={errors.bio}>
        <textarea
          id="bio"
          rows={5}
          placeholder="I moved to Bengaluru last year for work. I love evening walks, live gigs and trying new coffee spots."
          className={`${input} h-auto py-3`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          aria-invalid={!!errors.bio}
        />
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => suggest(bio)} disabled={suggesting || !bio.trim()} className={btn.ghost}>
            {suggesting ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Suggest interests from this
          </button>
          <span className={`${meta} ${words(bio) > MAX_WORDS ? "text-danger" : ""}`}>
            {words(bio)}/{MAX_WORDS} words
          </span>
        </div>
        <p className={meta}>Optional. AI reads only this text to suggest interests. Nothing is added until you tap it.</p>
      </Field>

      {(suggested.length > 0 || suggestedArea) && (
        <section className="animate-fade-in flex flex-col gap-3 rounded-card border border-candle bg-surface p-4">
          <p className="flex items-center gap-2 text-label">
            <Sparkles size={16} className="text-coral-text" /> Suggested from your About
            <span className={meta}>({aiPath === "ai" ? "AI" : "keyword match"})</span>
          </p>
          <p className={meta}>Tap to add the ones that are really you.</p>
          <div className="flex flex-wrap gap-2">
            {suggested.map((t) => (
              <button key={t} type="button" onClick={() => confirmSuggestion(t)} className="inline-flex h-8 items-center gap-1 rounded-pill bg-candle px-3 text-label text-ink">
                <Plus size={14} /> {tagLabel(t)}
              </button>
            ))}
            {suggestedArea && (
              <button type="button" onClick={() => { setArea(suggestedArea); setSuggestedArea(null); }} className="inline-flex h-8 items-center gap-1 rounded-pill bg-candle px-3 text-label text-ink">
                <Plus size={14} /> Area: {suggestedArea}
              </button>
            )}
          </div>
          <button type="button" onClick={() => { setSuggested([]); setSuggestedArea(null); }} className={`${btn.ghost} self-start px-0`}>
            <X size={14} /> Dismiss suggestions
          </button>
        </section>
      )}

      {missing.includes("interests") && (
        <section className="animate-fade-in flex flex-col gap-2 rounded-card bg-sunk p-4">
          <label htmlFor="followup" className={label}>
            Quick question: what do you enjoy doing on a free evening?
          </label>
          <input id="followup" className={input} placeholder="Board games, a run, catching a movie…" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
          <div className="flex gap-2">
            <button type="button" className={btn.small} disabled={!followUp.trim() || suggesting} onClick={() => suggest(followUp)}>
              Suggest
            </button>
            <button type="button" className={btn.ghost} onClick={() => setMissing((m) => m.filter((x) => x !== "interests"))}>
              Skip
            </button>
          </div>
        </section>
      )}

      <fieldset id="field-interests" className="flex flex-col gap-2">
        <legend className={`${label} mb-1`}>Your interests</legend>
        <p className={`${meta} mb-1`}>We use these to show you plans you&apos;ll like first. You&apos;ll still see everything in your city.</p>
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <button key={tag} type="button" onClick={() => toggle(tag)} className={chip(interests.includes(tag))} aria-pressed={interests.includes(tag)}>
              {interests.includes(tag) && <Check size={14} />}
              {tagLabel(tag)}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setShowAll((s) => !s)} className={`${btn.ghost} self-start px-0`}>
          {showAll ? "Show fewer" : `Show all ${TAGS.length}`}
        </button>
        {errors.interests && <FieldError msg={errors.interests} />}
      </fieldset>

      {errors.form && <FieldError msg={errors.form} />}
      <div className="flex flex-col gap-2">
        <button type="submit" disabled={saving || uploading} className={btn.primary}>
          {saving && <Loader2 className="animate-spin" size={18} />}
          {submitLabel}
        </button>
        <p className={`${meta} text-center`}>
          By continuing you agree to our <Link href="/privacy" className="text-coral-text underline">privacy notice</Link>.
        </p>
      </div>
    </form>
  );
}

function Field({ id, text, hint, error, children }: { id: string; text: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div id={`field-${id}`} className="flex flex-col gap-2">
      <label htmlFor={id} className={label}>
        {text}
      </label>
      {hint && <p className={meta}>{hint}</p>}
      {children}
      {error && <FieldError msg={error} />}
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return <p className="font-mono text-meta text-danger">{msg}</p>;
}
