import "server-only";
import { isoHoursAgo } from "@/lib/time";
import { createAdminClient } from "@/lib/supabase/admin";
import { displayName } from "@/lib/profile";
import { sendPush } from "@/lib/push";

const DAILY_CAP = 5;
const MAX_RECIPIENTS = 200;

// Notifies eligible people about a newly live WYD, in this order:
// approved → same active city → audience rule → not blocked either way → under the daily cap.
// Shared interests and same area only rank who goes first; they never gate.
export async function notifyMatches(threadId: string) {
  const admin = createAdminClient();
  const { data: thread } = await admin
    .from("threads")
    .select("*, author:profiles!threads_author_id_fkey(name, dob, gender)")
    .eq("id", threadId)
    .single();
  if (!thread || thread.status !== "live" || !thread.author) return { notified: 0 };

  let query = admin
    .from("profiles")
    .select("id, interests, area")
    .eq("status", "approved")
    .eq("city", thread.city)
    .neq("id", thread.author_id);
  if (thread.audience === "women") query = query.eq("gender", "female");
  if (thread.audience === "men") query = query.eq("gender", "male");
  const { data: candidates } = await query;
  if (!candidates?.length) return { notified: 0 };

  const ids = candidates.map((c) => c.id);
  const since = isoHoursAgo(24);
  const [{ data: blocks }, { data: recent }] = await Promise.all([
    admin
      .from("blocks")
      .select("blocker_id, blocked_id")
      .or(`blocker_id.eq.${thread.author_id},blocked_id.eq.${thread.author_id}`),
    admin.from("notifications").select("user_id").in("user_id", ids).gt("sent_at", since),
  ]);
  const blocked = new Set((blocks ?? []).flatMap((b) => [b.blocker_id, b.blocked_id]));
  const counts = new Map<string, number>();
  for (const n of recent ?? []) counts.set(n.user_id, (counts.get(n.user_id) ?? 0) + 1);

  const recipients = candidates
    .filter((c) => !blocked.has(c.id) && (counts.get(c.id) ?? 0) < DAILY_CAP)
    .map((c) => ({
      id: c.id,
      score: c.interests.filter((t) => thread.tags.includes(t)).length * 10 + (c.area === thread.area ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RECIPIENTS);
  if (!recipients.length) return { notified: 0 };

  const title = displayName(thread.author);
  const body = thread.body.slice(0, 120);
  // Primary key (thread_id, user_id) makes this idempotent: nobody is notified twice for one WYD.
  const { data: inserted, error } = await admin
    .from("notifications")
    .upsert(
      recipients.map((r) => ({ thread_id: thread.id, user_id: r.id, title, body })),
      { onConflict: "thread_id,user_id", ignoreDuplicates: true },
    )
    .select("user_id");
  if (error) {
    console.warn("[notify] insert failed:", error.message);
    return { notified: 0 };
  }

  const newIds = (inserted ?? []).map((n) => n.user_id);
  await sendPush(newIds, { title: `New plan in ${thread.city}`, body, url: `/wyd/${thread.id}` });
  console.log(`[notify] thread ${thread.id}: ${newIds.length} notified`);
  return { notified: newIds.length };
}
