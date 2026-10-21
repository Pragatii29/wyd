"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/profile";
import { notifyMatches } from "@/lib/notify";

// Every admin action re-checks the signed-in email against ADMIN_EMAILS on the server.
async function adminClient() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!isAdminEmail(user?.email)) throw new Error("Not allowed");
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
