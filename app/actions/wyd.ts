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
  audience: z.enum(["all", "women", "men", "non_binary"]),
  city: z.enum(CITIES),
  area: z.string().trim().max(60),
});

// Drop a WYD. Screened on the server before anything is saved; only live WYDs notify anyone.
export async function createWyd(
  input: z.input<typeof wydSchema>,
): Promise<ActionResult<{ id: string; status: "live" | "review" }> & { unsafe?: boolean }> {
  const { supabase, user, profile } = await getSession();
  if (!user) return { error: "Please sign in first." };
  if (profile?.status !== "approved") return { error: "You can post once your profile is verified." };

  const parsed = wydSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your post." };
  const serverSecret = process.env.WYD_SERVER_SECRET;
  if (!hasServiceRole() && !serverSecret) {
    return { error: "Posting isn't set up yet: add SUPABASE_SERVICE_ROLE_KEY or WYD_SERVER_SECRET to .env.local and restart." };
  }
  if (await overLimit("threads", user.id, 5, 60)) return { error: "That's a lot of plans! Try again in a bit." };

  const screen = await screenWyd(parsed.data.body);
  if (screen.verdict === "unsafe") return { error: screen.reason, unsafe: true };

  const live = screen.verdict === "safe";
  const reason = `${screen.reason} (${screen.path})`;
  const area = parsed.data.area || profile.area;
  let id: string;

  if (hasServiceRole()) {
    const { data: thread, error } = await createAdminClient()
      .from("threads")
      .insert({
        author_id: user.id,
        body: parsed.data.body,
        audience: parsed.data.audience,
        tags: screen.tags,
        city: parsed.data.city,
        area,
        status: live ? "live" : "review",
        moderation_reason: reason,
      })
      .select("id")
      .single();
    if (error) return { error: error.message };
    id = thread.id;
  } else {
    // No service role: insert through create_wyd, which only accepts calls carrying the server secret,
    // so moderation above can't be skipped from a browser.
    const { data, error } = await supabase.rpc("create_wyd", {
      p_secret: serverSecret!,
      p_body: parsed.data.body,
      p_audience: parsed.data.audience,
      p_city: parsed.data.city,
      p_area: area,
      p_tags: screen.tags,
      p_live: live,
      p_reason: reason,
    });
    if (error || !data) return { error: error?.message ?? "Couldn't post your WYD. Try again." };
    id = data;
  }

  // Matching + push need the service role; demo requests come from a database trigger either way.
  if (live && hasServiceRole()) await notifyMatches(id);
  revalidatePath("/feed");
  revalidatePath("/wyds");
  return { ok: true, id, status: live ? "live" : "review" };
}

export async function deleteWyd(threadId: string): Promise<ActionResult> {
  const { supabase, user } = await getSession();
  if (!user) return { error: "Please sign in first." };
  // RLS only lets authors delete their own WYD.
  const { error } = await supabase.from("threads").delete().eq("id", threadId).eq("author_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/feed");
  revalidatePath("/wyds");
  return { ok: true };
}
