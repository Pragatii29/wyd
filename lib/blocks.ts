import "server-only";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Everyone this user has blocked or been blocked by. A block hides both people from each other
// in the feed, notifications, requests and chats.
export async function getBlockedIds(userId: string): Promise<Set<string>> {
  if (!hasServiceRole()) {
    // Without the service role we can only see our own blocks (RLS).
    const { data } = await (await createClient()).from("blocks").select("blocked_id").eq("blocker_id", userId);
    return new Set((data ?? []).map((b) => b.blocked_id));
  }
  const { data } = await createAdminClient()
    .from("blocks")
    .select("blocker_id, blocked_id")
    .or(`blocker_id.eq.${userId},blocked_id.eq.${userId}`);
  return new Set((data ?? []).map((b) => (b.blocker_id === userId ? b.blocked_id : b.blocker_id)));
}

export async function isBlockedBetween(a: string, b: string) {
  return (await getBlockedIds(a)).has(b);
}
