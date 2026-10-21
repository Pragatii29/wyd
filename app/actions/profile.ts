"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { checkPhoto, extractProfile } from "@/lib/ai";
import { CITIES } from "@/lib/cities";
import { TAGS } from "@/lib/tags";
import { isValidPhone, normalizePhone } from "@/lib/phone";
import type { Json } from "@/lib/database.types";

export type ActionResult<T = object> = ({ ok: true } & T) | { ok?: false; error: string };

const SOCIAL_HOSTS = ["instagram.com", "linkedin.com", "x.com", "twitter.com", "facebook.com", "github.com", "behance.net"];

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function eighteenYearsAgo() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
}

const profileSchema = z.object({
  name: z.string().trim().min(1, "Add your name").max(60),
  phone: z
    .string()
    .trim()
    .min(1, "Add your phone number")
    .transform(normalizePhone)
    .refine(isValidPhone, "Enter a valid mobile number, e.g. 98765 43210"),
  dob: z.iso.date("Add your date of birth").refine((v) => v <= eighteenYearsAgo(), "You must be 18 or older to use WYD?"),
  gender: z.enum(["female", "male"], { message: "Pick one" }),
  photo_url: z
    .string()
    .url("Add a clear photo of your face")
    .refine((v) => /\.jpe?g$/i.test(v), "Your photo must be a JPG"),
  social_url: z
    .string()
    .trim()
    .url("Paste a full link, starting with https://")
    .refine((v) => {
      try {
        const host = new URL(v).hostname.replace(/^www\./, "");
        return v.startsWith("https://") && SOCIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
      } catch {
        return false;
      }
    }, "Use a LinkedIn link (or Instagram, X, Facebook, GitHub, Behance)"),
  city: z.enum(CITIES, { message: "Pick your city" }),
  area: z.string().trim().max(60),
  bio: z
    .string()
    .trim()
    .min(1, "Tell us a little about yourself")
    .refine((v) => wordCount(v) <= 250, "Keep it to 250 words or less"),
  interests: z.array(z.enum(TAGS)).max(15),
});

export type ProfileInput = z.input<typeof profileSchema>;
export type ProfileErrors = Partial<Record<keyof ProfileInput | "form", string>>;

export async function suggestFromAbout(text: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Please sign in first." };
  const clean = text.trim().slice(0, 2000);
  if (!clean) return { ok: false as const, error: "Write a few lines first." };
  const result = await extractProfile(clean);
  return { ok: true as const, ...result };
}

// Creates or updates the signed-in user's profile. A rejected profile goes back to pending review.
export async function saveProfile(input: ProfileInput): Promise<{ ok: true } | { ok: false; errors: ProfileErrors }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, errors: { form: "Please sign in first." } };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    const errors: ProfileErrors = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ProfileErrors;
      errors[key] ??= issue.message;
    }
    return { ok: false, errors };
  }
  const { phone, ...data } = parsed.data;

  // Photos must live in this user's own folder of our avatars bucket.
  const photoPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.id}/`;
  if (!data.photo_url.startsWith(photoPrefix)) return { ok: false, errors: { photo_url: "Upload your photo again." } };

  const { data: existing } = await supabase.from("profiles").select("status, photo_url").eq("id", user.id).maybeSingle();
  const row = { ...data, id: user.id };
  const { error } = existing
    ? await supabase.from("profiles").update(row).eq("id", user.id)
    : await supabase.from("profiles").insert(row);
  if (error) {
    const msg = error.message.includes("18 or older") ? "You must be 18 or older to use WYD?" : error.message;
    return { ok: false, errors: { form: msg } };
  }

  // Phone lives in a private table only this user and the admin can read.
  const { error: phoneError } = await supabase.from("profile_private").upsert({ id: user.id, phone, updated_at: new Date().toISOString() });
  if (phoneError) return { ok: false, errors: { phone: "Couldn't save your phone number. Try again." } };

  if (hasServiceRole()) {
    const admin = createAdminClient();
    const update: { status?: "pending"; rejection_reason?: null; photo_check?: Json } = {};
    if (existing?.status === "rejected") Object.assign(update, { status: "pending", rejection_reason: null });
    if (!existing || existing.photo_url !== data.photo_url) update.photo_check = await runPhotoCheck(data.photo_url);
    if (Object.keys(update).length) {
      const { error: adminError } = await admin.from("profiles").update(update).eq("id", user.id);
      if (adminError) console.warn("[profile] admin update failed:", adminError.message);
    }
  } else {
    console.warn("[profile] SUPABASE_SERVICE_ROLE_KEY missing: photo check and resubmission not saved");
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

// The AI photo pre-check is a helper for the admin. It never approves anyone.
async function runPhotoCheck(photoUrl: string): Promise<Json> {
  try {
    const img = await fetch(photoUrl);
    if (!img.ok) throw new Error(`photo fetch ${img.status}`);
    const data = Buffer.from(await img.arrayBuffer()).toString("base64");
    return await checkPhoto({ mimeType: img.headers.get("content-type") ?? "image/jpeg", data });
  } catch (err) {
    console.warn("[photo-check] could not load photo:", err);
    return { skipped: true, path: "fallback" };
  }
}

// Switching the active city changes the feed and future notifications immediately.
export async function setActiveCity(city: string): Promise<ActionResult> {
  const parsed = z.enum(CITIES).safeParse(city);
  if (!parsed.success) return { error: "Pick a city from the list." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in first." };
  const { error } = await supabase.from("profiles").update({ city: parsed.data }).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
