"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/profile";
import { getBlockedIds, isBlockedBetween } from "@/lib/blocks";
import { overLimit } from "@/lib/limits";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import type { ActionResult } from "./profile";

const uuid = z.guid();

async function approvedUser() {
  const session = await getSession();
  if (!session.user) return { error: "Please sign in first." } as const;
  if (session.profile?.status !== "approved") return { error: "This needs a verified profile." } as const;
  return { ...session, user: session.user, profile: session.profile };
}

// Ask to join. RLS checks the WYD is live, visible and not your own; we add blocks and rate limits.
export async function requestToJoin(threadId: string): Promise<ActionResult> {
  const s = await approvedUser();
  if ("error" in s) return { error: s.error! };
  if (!uuid.safeParse(threadId).success) return { error: "Unknown plan." };

  const { data: thread } = await s.supabase.from("threads").select("author_id, city").eq("id", threadId).maybeSingle();
  if (!thread) return { error: "This plan isn't available any more." };
  if (thread.city !== s.profile.city) return { error: `Switch to ${thread.city} to join plans there.` };
  if (await isBlockedBetween(s.user.id, thread.author_id)) return { error: "You can't join this plan." };
  if (await overLimit("requests", s.user.id, 20, 60)) return { error: "Too many requests. Try again later." };

  const { error } = await s.supabase.from("requests").insert({ thread_id: threadId, requester_id: s.user.id });
  if (error) return { error: error.code === "23505" ? "You've already asked to join." : error.message };
  revalidatePath(`/wyd/${threadId}`);
  return { ok: true };
}

// Only the WYD's author can accept or decline (RLS).
export async function answerRequest(requestId: string, status: "accepted" | "declined"): Promise<ActionResult> {
  const s = await approvedUser();
  if ("error" in s) return { error: s.error! };
  if (!uuid.safeParse(requestId).success || !["accepted", "declined"].includes(status)) return { error: "Invalid request." };
  const { data, error } = await s.supabase.from("requests").update({ status }).eq("id", requestId).select("id");
  if (error) return { error: error.message };
  if (!data?.length) return { error: "Only the person who posted this plan can answer." };
  revalidatePath("/requests");
  return { ok: true };
}

// Poster opens a 1:1 (one person) or group chat (several) with accepted participants of their WYD.
export async function startChat(threadId: string, userIds: string[]): Promise<ActionResult<{ chatId: string }>> {
  const s = await approvedUser();
  if ("error" in s) return { error: s.error! };
  const ids = Array.from(new Set(userIds)).filter((id) => uuid.safeParse(id).success);
  if (!uuid.safeParse(threadId).success || ids.length === 0) return { error: "Pick at least one person." };

  const { data: thread } = await s.supabase.from("threads").select("author_id").eq("id", threadId).maybeSingle();
  if (thread?.author_id !== s.user.id) return { error: "Only the poster can start this chat." };

  const { data: accepted } = await s.supabase
    .from("requests")
    .select("requester_id")
    .eq("thread_id", threadId)
    .eq("status", "accepted")
    .in("requester_id", ids);
  const blocked = await getBlockedIds(s.user.id);
  const members = (accepted ?? []).map((r) => r.requester_id).filter((id) => !blocked.has(id));
  if (members.length !== ids.length) return { error: "You can only chat with people you've accepted." };

  const { data: chat, error } = await s.supabase
    .from("chats")
    .insert({ thread_id: threadId, created_by: s.user.id, is_group: members.length > 1 })
    .select("id")
    .single();
  if (error) return { error: error.message };
  // RLS: the creator can only add themselves and accepted requesters of this WYD.
  const { error: memberError } = await s.supabase
    .from("chat_members")
    .insert([s.user.id, ...members].map((user_id) => ({ chat_id: chat.id, user_id })));
  if (memberError) return { error: memberError.message };

  revalidatePath("/chats");
  return { ok: true, chatId: chat.id };
}

// Members only (RLS). In a 1:1 chat, a block in either direction stops new messages.
export async function sendMessage(chatId: string, body: string): Promise<ActionResult> {
  const s = await approvedUser();
  if ("error" in s) return { error: s.error! };
  const text = body.trim();
  if (!uuid.safeParse(chatId).success || !text) return { error: "Write a message first." };
  if (text.length > 1000) return { error: "Keep it under 1000 characters." };

  const { data: members } = await s.supabase.from("chat_members").select("user_id").eq("chat_id", chatId);
  if (!members?.some((m) => m.user_id === s.user.id)) return { error: "You're not in this chat." };
  const blocked = await getBlockedIds(s.user.id);
  const others = members.filter((m) => m.user_id !== s.user.id);
  if (others.length === 1 && blocked.has(others[0].user_id)) return { error: "You can't message this person." };
  if (await overLimit("messages", s.user.id, 60, 1)) return { error: "Slow down a little." };

  const { error } = await s.supabase.from("messages").insert({ chat_id: chatId, sender_id: s.user.id, body: text });
  if (error) return { error: error.message };
  return { ok: true };
}

const reportSchema = z.object({
  target_type: z.enum(["profile", "thread", "message"]),
  target_id: z.guid(),
  reason: z.string().trim().max(500).optional(),
});

export async function report(input: z.input<typeof reportSchema>): Promise<ActionResult> {
  const s = await approvedUser();
  if ("error" in s) return { error: s.error! };
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return { error: "Couldn't send that report." };
  if (await overLimit("reports", s.user.id, 10, 60)) return { error: "Too many reports. Try again later." };
  const { error } = await s.supabase.from("reports").insert({ ...parsed.data, reporter_id: s.user.id });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function blockUser(userId: string): Promise<ActionResult> {
  const s = await approvedUser();
  if ("error" in s) return { error: s.error! };
  if (!uuid.safeParse(userId).success || userId === s.user.id) return { error: "You can't block that." };
  const { error } = await s.supabase.from("blocks").insert({ blocker_id: s.user.id, blocked_id: userId });
  if (error && error.code !== "23505") return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function unblockUser(userId: string): Promise<ActionResult> {
  const s = await approvedUser();
  if ("error" in s) return { error: s.error! };
  const { error } = await s.supabase.from("blocks").delete().eq("blocker_id", s.user.id).eq("blocked_id", userId);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function markNotificationsRead(): Promise<ActionResult> {
  const { supabase, user } = await getSession();
  if (!user) return { error: "Please sign in first." };
  await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
  revalidatePath("/notifications");
  return { ok: true };
}

const subSchema = z.object({
  endpoint: z.url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

export async function savePushSubscription(sub: unknown): Promise<ActionResult> {
  const { supabase, user, profile } = await getSession();
  if (!user || !profile) return { error: "Finish your profile first." };
  const parsed = subSchema.safeParse(sub);
  if (!parsed.success) return { error: "Your browser sent an invalid subscription." };
  // Same endpoint for a different account on this browser: replace it.
  const owner = hasServiceRole() ? createAdminClient() : supabase;
  await owner.from("push_subscriptions").delete().eq("endpoint", parsed.data.endpoint);
  const { error } = await supabase.from("push_subscriptions").insert({
    endpoint: parsed.data.endpoint,
    p256dh: parsed.data.keys.p256dh,
    auth: parsed.data.keys.auth,
    user_id: user.id,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function removePushSubscription(endpoint: string): Promise<ActionResult> {
  const { supabase, user } = await getSession();
  if (!user) return { error: "Please sign in first." };
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", user.id);
  return { ok: true };
}
