"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { TAGS, type Tag } from "@/lib/tags";
import { btn, chip, input, label, meta, tagLabel } from "@/lib/ui";

const BIO_MAX = 1000;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

function maxDob() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

const formSchema = z.object({
  name: z.string().trim().min(1, "Add your name"),
  dob: z.string().min(1, "Add your date of birth").refine((v) => v <= maxDob(), "You must be 18 or older to use WYD?"),
  gender: z.enum(["female", "male"], { message: "Pick one" }),
  photo_url: z.string().min(1, "Add a clear photo of your face"),
  social_url: z
    .string()
    .trim()
    .regex(/^https?:\/\/(www\.)?(instagram\.com|linkedin\.com)\/.+/i, "Paste a full Instagram or LinkedIn link"),
  area: z.string().trim().min(1, "Which area do you live in?"),
  bio: z.string().trim().max(BIO_MAX),
  interests: z.array(z.string()).min(1, "Pick at least one interest"),
});

type Errors = Partial<Record<keyof z.infer<typeof formSchema> | "form", string>>;

export function OnboardingForm({ userId }: { userId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [area, setArea] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) return setErrors({ photo_url: "Use a JPG, PNG or WebP photo" });
    if (file.size > 5 * 1024 * 1024) return setErrors({ photo_url: "Photo must be under 5 MB" });
    setUploading(true);
    setErrors({});
    const ext = file.type.split("/")[1];
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      setErrors({ photo_url: error.message });
    } else {
      setPhotoUrl(supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl);
    }
    setUploading(false);
  }

  async function onExtract() {
    if (!bio.trim()) return setErrors({ bio: "Write a few lines first" });
    setExtracting(true);
    setErrors({});
    const res = await fetch("/api/profile/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio }),
    });
    const data = await res.json();
    setExtracting(false);
    if (!res.ok) return setErrors({ bio: data.error });
    setInterests((prev) => Array.from(new Set([...prev, ...data.interests])));
    if (data.area && !area) setArea(data.area);
    setMissing(data.missing_fields.filter((f: string) => (f === "area" ? !area && !data.area : true)));
  }

  function toggle(tag: Tag) {
    setInterests((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = formSchema.safeParse({
      name, dob, gender, photo_url: photoUrl, social_url: socialUrl, area, bio, interests,
    });
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Errors;
        next[key] ??= issue.message;
      }
      return setErrors(next);
    }

    setSaving(true);
    setErrors({});
    const { error } = await supabase
      .from("profiles")
      .insert({ id: userId, ...parsed.data, bio: parsed.data.bio || null, city: "Bengaluru" });
    if (error) {
      setSaving(false);
      return setErrors({ form: error.message });
    }
    // The AI photo pre-check is a helper for the admin; never block on it.
    await fetch("/api/profile/photo-check", { method: "POST" }).catch(() => null);
    router.push("/pending");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-8" noValidate>
      <section className="flex flex-col items-center gap-3">
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
          <input
            id="photo"
            type="file"
            accept={PHOTO_TYPES.join(",")}
            className="sr-only"
            onChange={(e) => onPhoto(e.target.files?.[0])}
          />
        </label>
        <p className={meta}>{photoUrl ? "Tap to change" : "A clear photo of just you"}</p>
        {errors.photo_url && <FieldError msg={errors.photo_url} />}
      </section>

      <Field id="name" text="Name" error={errors.name}>
        <input id="name" className={input} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} autoComplete="given-name" />
      </Field>

      <Field id="dob" text="Date of birth" error={errors.dob}>
        <input id="dob" type="date" max={maxDob()} className={input} value={dob} onChange={(e) => setDob(e.target.value)} aria-invalid={!!errors.dob} />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className={`${label} mb-2`}>Gender</legend>
        <div className="flex gap-2">
          {(["female", "male"] as const).map((g) => (
            <button key={g} type="button" onClick={() => setGender(g)} className={`${chip(gender === g)} h-11 flex-1 justify-center`} aria-pressed={gender === g}>
              {g === "female" ? "Female" : "Male"}
            </button>
          ))}
        </div>
        {errors.gender && <FieldError msg={errors.gender} />}
      </fieldset>

      <Field id="social" text="Instagram or LinkedIn link" error={errors.social_url}>
        <input id="social" type="url" inputMode="url" placeholder="https://instagram.com/yourname" className={input} value={socialUrl} onChange={(e) => setSocialUrl(e.target.value)} aria-invalid={!!errors.social_url} />
      </Field>

      <Field id="bio" text="Tell us about yourself" error={errors.bio}>
        <textarea
          id="bio"
          rows={4}
          maxLength={BIO_MAX}
          placeholder="I moved to Indiranagar last year. I love evening walks, gigs and trying new coffee spots."
          className={`${input} h-auto py-3`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <button type="button" onClick={onExtract} disabled={extracting} className={btn.ghost}>
            {extracting ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            Find my interests
          </button>
          <span className={meta}>{bio.length}/{BIO_MAX}</span>
        </div>
      </Field>

      {missing.length > 0 && (
        <p className="rounded-card bg-candle p-4 text-body text-ink">
          Almost there! We couldn&apos;t find {missing.map((m) => (m === "area" ? "your area" : "your interests")).join(" or ")}. Fill{" "}
          {missing.length > 1 ? "them" : "it"} in below.
        </p>
      )}

      <Field id="area" text="Area in Bengaluru" error={errors.area}>
        <input id="area" placeholder="Indiranagar" className={input} value={area} onChange={(e) => setArea(e.target.value)} aria-invalid={!!errors.area} />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className={`${label} mb-2`}>Your interests</legend>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => (
            <button key={tag} type="button" onClick={() => toggle(tag)} className={chip(interests.includes(tag))} aria-pressed={interests.includes(tag)}>
              {tagLabel(tag)}
            </button>
          ))}
        </div>
        {errors.interests && <FieldError msg={errors.interests} />}
      </fieldset>

      {errors.form && <FieldError msg={errors.form} />}
      <button type="submit" disabled={saving || uploading} className={btn.primary}>
        {saving && <Loader2 className="animate-spin" size={18} />}
        Continue
      </button>
    </form>
  );
}

function Field({ id, text, error, children }: { id: string; text: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className={label}>
        {text}
      </label>
      {children}
      {error && <FieldError msg={error} />}
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return <p className="font-mono text-meta text-danger">{msg}</p>;
}
