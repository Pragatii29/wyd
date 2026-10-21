"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { ADMIN_COOKIE, adminToken, isAdmin, passcodeMatches } from "@/lib/admin";
import { notifyMatches } from "@/lib/notify";

// Unlock /admin on this device with ADMIN_PASSCODE. Returns an error message, or null when unlocked.
export async function unlockAdmin(_prev: string | null, formData: FormData): Promise<string | null> {
  const token = adminToken();
  if (!token) return "Admin isn't set up yet: add ADMIN_PASSCODE to the server environment.";
  if (!passcodeMatches(String(formData.get("passcode") ?? ""))) return "That passcode isn't right.";
  (await cookies()).set(ADMIN_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 });
  revalidatePath("/admin");
  return null;
}

export async function lockAdmin() {
  (await cookies()).delete(ADMIN_COOKIE);
  revalidatePath("/admin");
}

// Every admin action re-checks admin access (passcode cookie or ADMIN_EMAILS) on the server.
async function adminClient() {
  if (!(await isAdmin())) throw new Error("Not allowed");
  if (!hasServiceRole()) throw new Error("Add SUPABASE_SERVICE_ROLE_KEY to .env.local to use admin actions.");
  return createAdminClient();
}

const id = z.guid();

export async function approveProfile(formData: FormData) {
  const admin = await adminClient();
  const { error } = await admin
    .from("profiles")
    .update({ status: "approved", rejection_reason: null })
    .eq("id", id.parse(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function rejectProfile(formData: FormData) {
  const admin = await adminClient();
  const reason = z.string().trim().min(1).max(300).catch("Your profile didn't pass our checks.").parse(formData.get("reason"));
  const { error } = await admin
    .from("profiles")
    .update({ status: "rejected", rejection_reason: reason })
    .eq("id", id.parse(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function suspendProfile(formData: FormData) {
  const admin = await adminClient();
  const { error } = await admin
    .from("profiles")
    .update({ status: "suspended", rejection_reason: "Suspended after a report." })
    .eq("id", id.parse(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

// Approving a WYD from review publishes it and runs the same matching step as a live post.
export async function approveWyd(formData: FormData) {
  const admin = await adminClient();
  const threadId = id.parse(formData.get("id"));
  const { error } = await admin.from("threads").update({ status: "live" }).eq("id", threadId).eq("status", "review");
  if (error) throw new Error(error.message);
  await notifyMatches(threadId);
  revalidatePath("/admin");
}

export async function blockWyd(formData: FormData) {
  const admin = await adminClient();
  const { error } = await admin.from("threads").update({ status: "blocked" }).eq("id", id.parse(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function resolveReport(formData: FormData) {
  const admin = await adminClient();
  const { error } = await admin.from("reports").delete().eq("id", id.parse(formData.get("id")));
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
