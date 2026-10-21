"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Camera, Check, Link2, Loader2, Lock, Plus, Sparkles, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveProfile, suggestFromAbout, type ProfileErrors } from "@/app/actions/profile";
import { fallbackProfile } from "@/lib/fallback";
import { TAGS, type Tag } from "@/lib/tags";
import { CITIES } from "@/lib/cities";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { ageOn } from "@/lib/time";
import type { Tables } from "@/lib/database.types";
import { btn, chip, input, label, meta, tagLabel } from "@/lib/ui";

const MAX_WORDS = 250;
const STEPS = [
  { title: "The basics", blurb: "So people know who they're meeting, and we can check you're real." },
  { title: "About you", blurb: "A few lines and a clear photo go a long way." },
  { title: "Create your profile", blurb: "Pick what you're into so we can show you the right plans." },
];
// Which step each field lives on, so server errors can send the user back to the right place.
const FIELD_STEP: Record<string, number> = {
  name: 0, phone: 0, social_url: 0, photo_url: 1, bio: 1, dob: 2, gender: 2, city: 2, area: 2, interests: 2, form: 2,
};

function maxDob() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const isJpg = (f: File) => f.type === "image/jpeg" || /\.jpe?g$/i.test(f.name);
const isHttpsUrl = (v: string) => /^https:\/\/[^\s]+\.[^\s]+/.test(v.trim());

export function ProfileForm({
  userId,
  initial,
  initialPhone = "",
  submitLabel,
  next,
  wizard = false,
  preview = false,
}: {
  userId: string;
  initial: Tables<"profiles"> | null;
  initialPhone?: string;
  submitLabel: string;
  next: string;
  wizard?: boolean;
  // Local click-through without an account: nothing is uploaded or saved.
  preview?: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initialPhone.replace(/^\+91/, ""));
  const [socialUrl, setSocialUrl] = useState(initial?.social_url ?? "");
  const [photoUrl, setPhotoUrl] = useState(initial?.photo_url ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [dob, setDob] = useState(initial?.dob ?? "");
  const [gender, setGender] = useState<"female" | "male" | "">(initial?.gender ?? "");
  const [city, setCity] = useState(initial?.city ?? "Bengaluru");
  const [area, setArea] = useState(initial?.area ?? "");
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
  const [previewDone, setPreviewDone] = useState(false);

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    if (!isJpg(file)) return setErrors({ photo_url: "Please upload a JPG photo (.jpg or .jpeg)" });
    if (file.size > 5 * 1024 * 1024) return setErrors({ photo_url: "Photo must be under 5 MB" });
    if (preview) {
      setErrors({});
      return setPhotoUrl(URL.createObjectURL(file));
    }
    setUploading(true);
    setErrors({});
    const path = `${userId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { contentType: "image/jpeg" });
    if (error) setErrors({ photo_url: error.message });
    else setPhotoUrl(supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl);
    setUploading(false);
  }

  async function suggest(text: string) {
    setSuggesting(true);
    setErrors({});
    const res = preview ? { ok: true as const, ...fallbackProfile(text), path: "fallback" as const } : await suggestFromAbout(text);
    setSuggesting(false);
    if (!res.ok) return setErrors({ interests: res.error });
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

  // Quick checks before moving on; the server validates everything again on submit.
  function checkStep(s: number): ProfileErrors {
    const e: ProfileErrors = {};
    if (s === 0) {
      if (!name.trim()) e.name = "Add your name";
      if (!isValidPhone(normalizePhone(phone))) e.phone = "Enter a valid mobile number, e.g. 98765 43210";
      if (!isHttpsUrl(socialUrl)) e.social_url = "Paste your full LinkedIn link, starting with https://";
    }
    if (s === 1) {
      if (!photoUrl) e.photo_url = "Add a clear JPG photo of just you";
      if (!bio.trim()) e.bio = "Tell us a little about yourself";
      else if (words(bio) > MAX_WORDS) e.bio = "Keep it to 250 words or less";
    }
    if (s === 2) {
      if (!dob) e.dob = "Add your date of birth";
      else if (dob > maxDob()) e.dob = "You must be 18 or older to use WYD?";
      if (!gender) e.gender = "Pick one";
    }
    return e;
  }

  function goNext() {
    const e = checkStep(step);
    setErrors(e);
    if (Object.keys(e).length === 0) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (wizard && step < STEPS.length - 1) return goNext();
    const local = wizard ? checkStep(step) : { ...checkStep(0), ...checkStep(1), ...checkStep(2) };
    if (Object.keys(local).length) return setErrors(local);

    if (preview) return setPreviewDone(true);
    setSaving(true);
    setErrors({});
    const res = await saveProfile({
      name, phone, dob, gender: gender as "female", photo_url: photoUrl, social_url: socialUrl.trim(),
      city: city as "Bengaluru", area, bio, interests,
    });
    if (!res.ok) {
      setSaving(false);
      setErrors(res.errors);
      const first = Object.keys(res.errors)[0];
      if (wizard) setStep(FIELD_STEP[first] ?? 2);
      return;
    }
    router.push(next);
    router.refresh();
  }

  const show = (s: number) => !wizard || step === s;
  const visibleTags = showAll ? TAGS : TAGS.filter((t) => interests.includes(t)).concat(TAGS.filter((t) => !interests.includes(t)).slice(0, 12));
  const age = dob ? ageOn(dob) : null;

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-8" noValidate>
      {wizard && (
        <div className="flex flex-col gap-3">
          <div className="flex gap-2" aria-hidden>
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 flex-1 rounded-pill transition duration-base ease-out ${i <= step ? "bg-ink" : "bg-sunk"}`} />
            ))}
          </div>
          <p className={meta}>
            Step {step + 1} of {STEPS.length}
          </p>
          <div>
            <h2 className="text-h2">{STEPS[step].title}</h2>
            <p className="mt-1 text-body text-ink-2">{STEPS[step].blurb}</p>
          </div>
        </div>
      )}

      {/* Step 1 — the basics */}
      {show(0) && (
        <section className="animate-fade-in flex flex-col gap-6">
          <Field id="name" text="Full name" error={errors.name}>
            <input id="name" className={input} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} autoComplete="name" placeholder="Ria Sharma" />
          </Field>

          <Field id="phone" text="Phone number" hint="Only our team sees this, to verify you. It's never shown on your profile." error={errors.phone}>
            <div className="flex gap-2">
              <span className="flex h-12 shrink-0 items-center rounded-sm border border-line bg-sunk px-3 text-body text-ink">+91</span>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="98765 43210"
                className={input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={!!errors.phone}
              />
            </div>
            <p className={`${meta} flex items-center gap-1`}>
              <Lock size={12} /> Private
            </p>
          </Field>

          <Field
            id="social_url"
            text="LinkedIn profile"
            hint="This is how we know you're authentic. No LinkedIn? Instagram, X, GitHub or Behance also work. We never read your account or ask for passwords."
            error={errors.social_url}
          >
            <div className="relative">
              <Link2 size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-2" aria-hidden />
              <input
                id="social_url"
                type="url"
                inputMode="url"
                placeholder="https://linkedin.com/in/yourname"
                className={`${input} pl-11`}
                value={socialUrl}
                onChange={(e) => setSocialUrl(e.target.value)}
                aria-invalid={!!errors.social_url}
              />
            </div>
          </Field>
        </section>
      )}

      {/* Step 2 — about you and a photo */}
      {show(1) && (
        <section className="animate-fade-in flex flex-col gap-6">
          <div id="field-photo_url" className="flex flex-col items-center gap-3">
            <label
              htmlFor="photo"
              className="relative flex aspect-[4/5] w-44 cursor-pointer items-center justify-center overflow-hidden rounded-card bg-sunk focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink"
            >
              {photoUrl ? (
                <Image src={photoUrl} alt="Your profile photo" fill sizes="176px" className="object-cover" unoptimized={photoUrl.startsWith("blob:")} />
              ) : uploading ? (
                <Loader2 className="animate-spin text-ink-3" />
              ) : (
                <span className="flex flex-col items-center gap-2 text-ink-2">
                  <Camera size={32} />
                  <span className="text-label">Add photo</span>
                </span>
              )}
              <input id="photo" type="file" accept="image/jpeg,.jpg,.jpeg" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>
            <p className={meta}>{photoUrl ? "Tap to change" : "JPG only · a clear, recent photo of just you · under 5 MB"}</p>
            {errors.photo_url && <FieldError msg={errors.photo_url} />}
          </div>

          <Field id="bio" text="Tell us about yourself in 250 words or less." error={errors.bio}>
            <textarea
              id="bio"
              rows={7}
              placeholder="I moved to Bengaluru last year for work. I'm a product designer who loves evening walks, live gigs and trying new coffee spots. Always happy to meet people in tech and design."
              className={`${input} h-auto py-3`}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              aria-invalid={!!errors.bio}
            />
            <span className={`${meta} self-end ${words(bio) > MAX_WORDS ? "text-danger" : ""}`}>
              {words(bio)}/{MAX_WORDS} words
            </span>
          </Field>
        </section>
      )}

      {/* Step 3 — create the profile */}
      {show(2) && (
        <section className="animate-fade-in flex flex-col gap-6">
          {wizard && photoUrl && (
            <div className="flex items-center gap-3 rounded-card bg-surface p-3 shadow-card">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-sunk">
                <Image src={photoUrl} alt="" fill sizes="56px" className="object-cover" unoptimized={photoUrl.startsWith("blob:")} />
              </span>
              <span className="min-w-0">
                <span className="block text-label">
                  {name.split(" ")[0]}
                  {age !== null && age >= 18 ? `, ${age}` : ""}
                </span>
                <span className={`${meta} block truncate`}>{bio}</span>
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field id="dob" text="Date of birth" error={errors.dob}>
              <input id="dob" type="date" max={maxDob()} className={input} value={dob} onChange={(e) => setDob(e.target.value)} aria-invalid={!!errors.dob} />
            </Field>
            <Field id="city" text="City" error={errors.city}>
              <select id="city" className={input} value={city} onChange={(e) => setCity(e.target.value)}>
                {CITIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
          <p className={`${meta} -mt-4`}>We only show your age, never your birthday. You must be 18+.</p>

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

          <Field id="area" text="Area (optional)" error={errors.area}>
            <input id="area" placeholder="Indiranagar" className={input} value={area} onChange={(e) => setArea(e.target.value)} />
          </Field>

          <fieldset id="field-interests" className="flex flex-col gap-2">
            <legend className={`${label} mb-1`}>What are you into?</legend>
            <p className={`${meta} mb-1`}>We use these to show you plans you&apos;ll like first. You&apos;ll still see everything in your city.</p>

            {bio.trim() && suggested.length === 0 && !suggestedArea && (
              <button type="button" onClick={() => suggest(bio)} disabled={suggesting} className={`${btn.small} mb-2 self-start`}>
                {suggesting ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} className="text-coral-text" />}
                Suggest from my About
              </button>
            )}

            {(suggested.length > 0 || suggestedArea) && (
              <div className="animate-fade-in mb-2 flex flex-col gap-3 rounded-card border border-candle bg-surface p-4">
                <p className="flex items-center gap-2 text-label">
                  <Sparkles size={16} className="text-coral-text" /> Suggested from your About
                  <span className={meta}>({aiPath === "ai" ? "AI" : "keyword match"})</span>
                </p>
                <p className={meta}>Tap the ones that are really you. Nothing is added until you do.</p>
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
                  <X size={14} /> Dismiss
                </button>
              </div>
            )}

            {missing.includes("interests") && (
              <div className="animate-fade-in mb-2 flex flex-col gap-2 rounded-card bg-sunk p-4">
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
              </div>
            )}

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
        </section>
      )}

      {errors.form && <FieldError msg={errors.form} />}
      {previewDone && (
        <p className="animate-fade-in rounded-card border border-success bg-surface p-4 text-body text-ink" role="status">
          All 3 steps are filled in. This is a preview, so nothing was saved. Sign in on the home page to create your real profile.
        </p>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {wizard && step > 0 && (
            <button type="button" onClick={() => { setErrors({}); setStep((s) => s - 1); }} className="inline-flex size-13 shrink-0 items-center justify-center rounded-pill border border-line bg-surface text-ink transition duration-fast ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" aria-label="Back">
              <ArrowLeft size={18} />
            </button>
          )}
          <button type="submit" disabled={saving || uploading} className={btn.primary}>
            {saving && <Loader2 className="animate-spin" size={18} />}
            {wizard && step < STEPS.length - 1 ? (
              <>
                Continue <ArrowRight size={18} />
              </>
            ) : (
              submitLabel
            )}
          </button>
        </div>
        {(!wizard || step === STEPS.length - 1) && (
          <p className={`${meta} text-center`}>
            By continuing you agree to our <Link href="/privacy" className="text-coral-text underline">privacy notice</Link>.
          </p>
        )}
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
