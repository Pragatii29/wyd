import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export type Profile = Tables<"profiles">;

export function ageFrom(dob: string, now = new Date()) {
  const d = new Date(dob);
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

// "Ria, 22F"
export function displayName(p: Pick<Profile, "name" | "dob" | "gender">) {
  return `${p.name.split(" ")[0]}, ${ageFrom(p.dob)}${p.gender === "female" ? "F" : "M"}`;
}

export function isAdminEmail(email: string | undefined) {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  return admins.includes(email.toLowerCase());
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return { supabase, user, profile };
}

// Where a signed-in user belongs, based on their verification status.
export function homeFor(profile: Profile | null) {
  if (!profile) return "/onboarding";
  if (profile.status === "approved") return "/feed";
  return "/pending";
}

// For pages inside the app: only approved users get through.
export async function requireApproved() {
  const session = await getSession();
  if (!session.user) redirect("/");
  if (session.profile?.status !== "approved") redirect(homeFor(session.profile));
  return { ...session, user: session.user, profile: session.profile };
}
