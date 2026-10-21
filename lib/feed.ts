import "server-only";
import { isoHoursAgo } from "@/lib/time";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import type { Profile } from "@/lib/profile";
import type { FeedWyd } from "@/components/WydCard";
import { getBlockedIds } from "@/lib/blocks";

export const AUTHOR_FIELDS = "id, name, dob, gender, photo_url";

// The feed, enforced on the server in this order:
// approved viewer (layout) → live + passed moderation → viewer's active city → audience rule (RLS)
// → not blocked either way → last 24 hours. Shared interests only rank; they never hide a WYD.
export async function loadFeed(supabase: SupabaseClient<Database>, viewer: Profile) {
  const since = isoHoursAgo(24);
  const [{ data: threads, error }, blocked] = await Promise.all([
    supabase
      .from("threads")
      .select(`id, body, audience, tags, area, city, created_at, author_id, author:profiles!threads_author_id_fkey(${AUTHOR_FIELDS})`)
      .eq("status", "live")
      .eq("city", viewer.city)
      .gt("created_at", since)
      .order("created_at", { ascending: false })
      .limit(100),
    getBlockedIds(viewer.id),
  ]);
  if (error) throw new Error(error.message);

  const visible = (threads ?? []).filter((t) => t.author && !blocked.has(t.author_id)) as unknown as (FeedWyd & {
    author_id: string;
  })[];

  const ids = visible.map((t) => t.id);
  const { data: requests } = ids.length
    ? await supabase.from("requests").select("thread_id, requester_id, status").in("thread_id", ids)
    : { data: [] };

  const items = visible.map((wyd) => {
    const mine = wyd.author_id === viewer.id;
    const shared = wyd.tags.filter((t) => viewer.interests.includes(t));
    const forThread = (requests ?? []).filter((r) => r.thread_id === wyd.id);
    return {
      wyd,
      mine,
      shared,
      requestStatus: forThread.find((r) => r.requester_id === viewer.id)?.status ?? null,
      requestCount: mine ? forThread.length : 0,
    };
  });

  // Matching interests first, then most recent.
  return items.sort(
    (a, b) =>
      Number(b.shared.length > 0) - Number(a.shared.length > 0) ||
      b.shared.length - a.shared.length ||
      b.wyd.created_at.localeCompare(a.wyd.created_at),
  );
}
