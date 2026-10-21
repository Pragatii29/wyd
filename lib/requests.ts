import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getBlockedIds } from "@/lib/blocks";
import { isoHoursAgo } from "@/lib/time";

export const REQUESTER_FIELDS = "id, name, dob, gender, photo_url, area, city, interests, bio, status, created_at, social_url, photo_check, rejection_reason, lat, lng";

// Requests other people sent to join this user's WYDs (last 7 days), waiting ones first.
// RLS already limits rows to the thread author; blocked people are dropped here.
export async function loadIncomingRequests(supabase: SupabaseClient<Database>, userId: string) {
  const [{ data }, blocked] = await Promise.all([
    supabase
      .from("requests")
      .select(`id, status, created_at, thread:threads!inner(id, body, author_id, created_at), requester:profiles!requests_requester_id_fkey(${REQUESTER_FIELDS})`)
      .eq("thread.author_id", userId)
      .gt("thread.created_at", isoHoursAgo(7 * 24))
      .order("created_at", { ascending: false })
      .limit(100),
    getBlockedIds(userId),
  ]);
  return (data ?? [])
    .filter((r) => r.requester && !blocked.has(r.requester.id))
    .map((r) => ({ ...r, requester: r.requester! }))
    .sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending"));
}
