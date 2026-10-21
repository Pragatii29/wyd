"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { getSession } from "@/lib/profile";
import { screenWyd } from "@/lib/ai";
import { CITIES } from "@/lib/cities";
import { overLimit } from "@/lib/limits";
import { notifyMatches } from "@/lib/notify";
import type { ActionResult } from "./profile";

const wydSchema = z.object({
  body: z.string().trim().min(1, "Write your plan first.").max(280, "Keep it under 280 characters."),
  audience: z.enum(["all", "women", "men"]),
  city: z.enum(CITIES),
  area: z.string().trim().max(60),
});

// Drop a WYD. Screened on the server before anything is saved; only live WYDs notify anyone.
export async function createWyd(
  input: z.input<typeof wydSchema>,
): Promise<ActionResult<{ id: string; status: "live" | "review" }> & { unsafe?: boolean }> {
  const { user, profile } = await getSession();
  if (!user) return { error: "Please sign in first." };
  if (profile?.status !== "approved") return { error: "You can post once your profile is verified." };

  const parsed = wydSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your post." };
  if (!hasServiceRole()) {
    return { error: "Posting isn't set up yet: add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart." };
  }
  if (await overLimit("threads", user.id, 5, 60)) return { error: "That's a lot of plans! Try again in a bit." };

  const screen = await screenWyd(parsed.data.body);
  if (screen.verdict === "unsafe") return { error: screen.reason, unsafe: true };

  const { data: thread, error } = await createAdminClient()
    .from("threads")
    .insert({
      author_id: user.id,
      body: parsed.data.body,
      audience: parsed.data.audience,
      tags: screen.tags,
      city: parsed.data.city,
      area: parsed.data.area || profile.area,
      status: screen.verdict === "safe" ? "live" : "review",
      moderation_reason: `${screen.reason} (${screen.path})`,
    })
    .select("id, status")
    .single();
  if (error) return { error: error.message };

  if (thread.status === "live") await notifyMatches(thread.id);
  revalidatePath("/feed");
  return { ok: true, id: thread.id, status: thread.status as "live" | "review" };
}

export async function deleteWyd(threadId: string): Promise<ActionResult> {
  const { supabase, user } = await getSession();
  if (!user) return { error: "Please sign in first." };
  // RLS only lets authors delete their own WYD.
  const { error } = await supabase.from("threads").delete().eq("id", threadId).eq("author_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/feed");
  return { ok: true };
}
