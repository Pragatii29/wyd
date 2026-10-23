"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ImagePlus, Loader2, Lock, Mars, NonBinary, Plus, Sparkles, Venus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { saveProfile, suggestFromAbout, type ProfileErrors } from "@/app/actions/profile";
import { TAGS, TAG_EMOJI, type Tag } from "@/lib/tags";
import { CITIES } from "@/lib/cities";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import { ageOn } from "@/lib/time";
import { clearDraft, type SignupDraft } from "@/lib/draft";
import { GENDERS, type Gender } from "@/lib/gender";
import { isValidSocialUrl, SOCIAL_ERROR, toSocialUrl, type PlatformId } from "@/lib/social";
import { SelfieCamera } from "@/components/SelfieCamera";
import { SocialLinkField } from "@/components/SocialLinkField";
import { SIGNUP_STEPS, SlideShell } from "@/components/SlideShell";
import { btn, chip, input, meta, tagLabel } from "@/lib/ui";

const MAX_WORDS = 250;
const GENDER_ICON = { male: Mars, female: Venus, non_binary: NonBinary } as const;
// Which screen each field is asked on, so a server error sends the user back to it.
const FIELD_STEP: Record<string, number> = {
  name: 1, selfie_path: 2, photo_url: 2, gender: 3, dob: 4, phone: 5, city: 6, area: 6, bio: 7, interests: 8, social_url: 9,
};

function maxDob() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const isJpg = (f: File) => f.type === "image/jpeg" || /\.jpe?g$/i.test(f.name);

// New-member sign-up, one question per screen (the name screen is on the welcome page).
// The live selfie is required; if they skip the optional upload, the selfie becomes their profile photo.
export function SignupSlides({ userId, draft, hasSelfie = false }: { userId: string; draft: SignupDraft | null; hasSelfie?: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(draft?.name ? 2 : 1);
  const [name, setName] = useState(draft?.name ?? "");
  const [selfiePath, setSelfiePath] = useState("");
  const selfieBlob = useRef<Blob | null>(null);
  const [selfiePreview, setSelfiePreview] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState(draft?.phone ?? "");
  const [city, setCity] = useState<string>("Bengaluru");
  const [area, setArea] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<Tag[]>([]);
  const [suggested, setSuggested] = useState<Tag[]>([]);
  const [platform, setPlatform] = useState<PlatformId>("linkedin");
  const [social, setSocial] = useState(draft?.social_url ?? "");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});

  const selfieDone = hasSelfie || !!selfiePath;
  const firstName = name.trim().split(" ")[0];
  const shownPhoto = photoUrl || selfiePreview;
  const age = dob ? ageOn(dob) : null;

  const go = (s: number) => {
    setErrors({});
    setStep(s);
    window.scrollTo({ top: 0 });
  };
  const back = step > 1 ? () => go(step - 1) : undefined;

  // Live selfie → private verifications bucket (only this user and the admin can read it).
  async function onSelfie(jpeg: Blob, source: "live" | "upload"): Promise<string | null> {
    const path = `${userId}/selfie-${source}-${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("verifications").upload(path, jpeg, { contentType: "image/jpeg" });
    if (error) return `Couldn't save your selfie: ${error.message}`;
    selfieBlob.current = jpeg;
    setSelfiePreview(URL.createObjectURL(jpeg));
    setSelfiePath(path);
    setErrors({});
    return null;
  }

  // Optional profile photo → public avatars bucket.
  async function onPhoto(file: File | undefined) {
    if (!file) return;
    if (!isJpg(file)) return setErrors({ photo_url: "Please upload a JPG photo (.jpg or .jpeg)" });
    if (file.size > 5 * 1024 * 1024) return setErrors({ photo_url: "Photo must be under 5 MB" });
    setBusy(true);
    setErrors({});
    const path = `${userId}/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { contentType: "image/jpeg" });
    if (error) setErrors({ photo_url: error.message });
    else setPhotoUrl(supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl);
    setBusy(false);
  }

  // Leaving the photo screen: with no uploaded photo, the live selfie becomes the profile photo.
  async function photosNext() {
    if (!selfieDone) return setErrors({ selfie_path: "Take a live selfie to continue" });
    if (!photoUrl) {
      if (!selfieBlob.current) return setErrors({ photo_url: "Retake your selfie, or add a profile photo" });
      setBusy(true);
      const path = `${userId}/selfie-photo-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("avatars").upload(path, selfieBlob.current, { contentType: "image/jpeg" });
      setBusy(false);
      if (error) return setErrors({ photo_url: `Couldn't use your selfie: ${error.message}` });
      setPhotoUrl(supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl);
    }
    go(3);
  }

  async function suggest() {
    setBusy(true);
    const res = await suggestFromAbout(bio);
    setBusy(false);
    if (!res.ok) return setErrors({ interests: res.error });
    setSuggested(res.interests.filter((t) => !interests.includes(t as Tag)) as Tag[]);
    if (res.area && !area) setArea(res.area);
  }

  const toggle = (t: Tag) => setInterests((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  async function create(skipSocial = false) {
    const socialUrl = skipSocial ? "" : toSocialUrl(platform, social);
    if (socialUrl && !isValidSocialUrl(socialUrl)) return setErrors({ social_url: SOCIAL_ERROR });
    setBusy(true);
    setErrors({});
    let res: Awaited<ReturnType<typeof saveProfile>>;
    try {
      res = await saveProfile({
        name, phone, dob, gender: gender as Gender, photo_url: photoUrl, social_url: socialUrl,
        city: city as "Bengaluru", area, bio, interests, selfie_path: selfiePath || undefined,
      });
    } catch {
      setBusy(false);
      return setErrors({ form: "We couldn't save your profile. Check your connection and try again." });
    }
    if (!res.ok) {
      setBusy(false);
      const first = Object.keys(res.errors).find((k) => k !== "form");
      if (first) go(FIELD_STEP[first] ?? step);
      return setErrors(res.errors);
    }
    clearDraft();
    router.push("/profile?welcome=1");
    router.refresh();
  }

  const common = { step, total: SIGNUP_STEPS, onBack: back };
  const err = (k: keyof ProfileErrors) => errors[k] ?? errors.form;

  // "Hey [photo] Ria" — shown once we have a photo, like a hello.
  const greeting = shownPhoto ? (
    <span className="inline-flex items-center gap-3">
      Hey
      <span className="relative inline-block size-12 -rotate-6 overflow-hidden rounded-field border-2 border-on-brand shadow-float">
        <Image src={shownPhoto} alt="" fill sizes="48px" className="object-cover" unoptimized={shownPhoto.startsWith("blob:")} />
      </span>
      <span className="font-normal">{firstName}</span>
    </span>
  ) : undefined;

  if (step === 1)
    return (
      <SlideShell {...common} question="What should we call you?" hint="Your first name is what people see." onNext={() => (name.trim() ? go(2) : setErrors({ name: "Add your name to continue" }))} error={err("name")}>
        <label htmlFor="name" className="sr-only">Full name</label>
        <input id="name" autoFocus autoComplete="name" placeholder="Your full name" className={`${input} text-center text-wyd`} value={name} onChange={(e) => setName(e.target.value)} />
      </SlideShell>
    );

  if (step === 2)
    return (
      <SlideShell
        {...common}
        question={`Hi ${firstName}, let's see you`}
        hint="A live selfie keeps WYD? real. Add a different profile photo if you like."
        onNext={photosNext}
        busy={busy}
        disabled={!selfieDone}
        error={errors.selfie_path ?? errors.photo_url ?? errors.form}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-label">Live selfie</p>
          <span className="inline-flex items-center gap-1 rounded-pill bg-sunk px-2.5 py-0.5 text-meta text-ink-2">Required</span>
        </div>
        <SelfieCamera done={selfieDone} onCapture={onSelfie} />
        <div className="my-2 h-px bg-line" />
        <div className="flex items-center gap-4">
          <label htmlFor="photo" className="relative flex aspect-[4/5] w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-field border border-dashed border-ink-3 bg-sunk">
            {photoUrl ? <Image src={photoUrl} alt="Your profile photo" fill sizes="96px" className="object-cover" /> : <ImagePlus size={24} className="text-ink-2" />}
            <input id="photo" type="file" accept="image/jpeg,.jpg,.jpeg" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
          <div className="min-w-0">
            <p className="text-label">Profile photo <span className="text-ink-3">· optional</span></p>
            <p className={`${meta} mt-1`}>
              {photoUrl ? "Tap to change." : "JPG, just you, under 5 MB. Skip it and your live selfie becomes your profile photo."}
            </p>
          </div>
        </div>
      </SlideShell>
    );

  if (step === 3)
    return (
      <SlideShell {...common} greeting={greeting} question="Who do you identify as?" hint="Used for Women only and Men only plans." onNext={() => (gender ? go(4) : setErrors({ gender: "Pick one to continue" }))} error={err("gender")}>
        {GENDERS.map((g) => {
          const Icon = GENDER_ICON[g.value];
          const on = gender === g.value;
          return (
            <button
              key={g.value}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setGender(g.value);
                setTimeout(() => go(4), 220);
              }}
              className={`flex h-16 items-center justify-center gap-3 rounded-field border text-wyd transition duration-base ease-press active:scale-[0.98] ${
                on ? "border-ink bg-ink text-on-ink" : "border-line bg-sunk text-ink hover:border-ink-3"
              }`}
            >
              <Icon size={20} /> {g.label}
            </button>
          );
        })}
      </SlideShell>
    );

  if (step === 4)
    return (
      <SlideShell
        {...common}
        greeting={greeting}
        question="When's your birthday?"
        hint="We only show your age, never the date. You must be 18 or older."
        onNext={() => (!dob ? setErrors({ dob: "Add your date of birth" }) : dob > maxDob() ? setErrors({ dob: "You must be 18 or older to use WYD?" }) : go(5))}
        error={err("dob")}
      >
        <label htmlFor="dob" className="sr-only">Date of birth</label>
        <input id="dob" type="date" max={maxDob()} className={`${input} text-center`} value={dob} onChange={(e) => setDob(e.target.value)} />
        {age !== null && age >= 18 && <p className={`${meta} text-center`}>You&apos;ll show as {firstName}, {age}</p>}
      </SlideShell>
    );

  if (step === 5)
    return (
      <SlideShell
        {...common}
        question="Your mobile number"
        hint={<span className="inline-flex items-center gap-1"><Lock size={14} /> Private. Only our team sees it, to verify you.</span>}
        onNext={() => (isValidPhone(normalizePhone(phone)) ? go(6) : setErrors({ phone: "Enter a valid mobile number, e.g. 98765 43210" }))}
        error={err("phone")}
      >
        <div className="flex gap-2">
          <span className="flex h-14 shrink-0 items-center rounded-field border border-line bg-sunk px-4 text-body text-ink-2">+91</span>
          <label htmlFor="phone" className="sr-only">Phone number</label>
          <input id="phone" type="tel" inputMode="tel" autoFocus autoComplete="tel-national" placeholder="98765 43210" className={input} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </SlideShell>
    );

  if (step === 6)
    return (
      <SlideShell {...common} question="Where are you based?" hint="You'll see plans in this city. You can switch any time." onNext={() => go(7)} error={err("city") ?? errors.area}>
        <div className="flex flex-wrap justify-center gap-2">
          {CITIES.map((c) => (
            <button key={c} type="button" onClick={() => setCity(c)} className={chip(city === c)} aria-pressed={city === c}>
              {c}
            </button>
          ))}
        </div>
        <label htmlFor="area" className="sr-only">Area (optional)</label>
        <input id="area" placeholder="Your area (optional)" className={`${input} text-center`} value={area} onChange={(e) => setArea(e.target.value)} />
      </SlideShell>
    );

  if (step === 7)
    return (
      <SlideShell
        {...common}
        greeting={greeting}
        question="Tell people about you"
        hint="What you do, what you love, what you're up for. 250 words max."
        onNext={() => (!bio.trim() ? setErrors({ bio: "Write a few lines about yourself" }) : words(bio) > MAX_WORDS ? setErrors({ bio: "Keep it to 250 words or less" }) : go(8))}
        error={err("bio")}
      >
        <label htmlFor="bio" className="sr-only">About you</label>
        <textarea
          id="bio"
          rows={7}
          autoFocus
          placeholder="I moved to Bengaluru last year for work. I love evening walks, live gigs and trying new coffee spots."
          className={`${input} h-auto py-4`}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <span className={`${meta} self-end ${words(bio) > MAX_WORDS ? "text-danger" : ""}`}>
          {words(bio)}/{MAX_WORDS} words
        </span>
      </SlideShell>
    );

  if (step === 8)
    return (
      <SlideShell
        {...common}
        question="What are you into?"
        hint="Pick a few. We'll show you plans you'll like first."
        onNext={() => go(9)}
        cta={interests.length ? `Next · ${interests.length} picked` : "Next"}
        error={err("interests")}
      >
        {bio.trim() && suggested.length === 0 && (
          <button type="button" onClick={suggest} disabled={busy} className={`${btn.small} self-center`}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Suggest from my About
          </button>
        )}
        {suggested.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {suggested.map((t) => (
              <button key={t} type="button" onClick={() => { toggle(t); setSuggested((s) => s.filter((x) => x !== t)); }} className="inline-flex h-9 items-center gap-1 rounded-pill bg-candle px-3 text-label text-on-light">
                <Plus size={14} /> {TAG_EMOJI[t]} {tagLabel(t)}
              </button>
            ))}
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          {TAGS.map((t) => {
            const on = interests.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggle(t)}
                aria-pressed={on}
                className={`relative flex aspect-square flex-col items-center justify-center gap-1.5 rounded-field border p-2 text-center text-meta transition duration-base ease-press active:scale-[0.96] ${
                  on ? "border-ink bg-ink text-on-ink" : "border-line bg-sunk text-ink hover:border-ink-3"
                }`}
              >
                <span className="text-title" aria-hidden>{TAG_EMOJI[t]}</span>
                {tagLabel(t)}
                {on && <Check size={14} className="absolute right-2 top-2" />}
              </button>
            );
          })}
        </div>
      </SlideShell>
    );

  return (
    <SlideShell
      {...common}
      greeting={greeting}
      question="Add a social profile?"
      hint="Optional. It helps people see you're real. We never read your account."
      cta="Create my profile"
      onNext={() => create()}
      busy={busy}
      error={errors.social_url ?? errors.form}
      secondary={
        <button type="button" onClick={() => create(true)} disabled={busy} className={`${btn.ghost} self-center text-ink-2`}>
          Skip and create my profile
        </button>
      }
    >
      <SocialLinkField bare platform={platform} value={social} onPlatform={setPlatform} onValue={setSocial} />
    </SlideShell>
  );
}
