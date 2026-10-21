import Link from "next/link";
import { requireApproved } from "@/lib/profile";
import { getBlockedIds } from "@/lib/blocks";
import { RequestsBoard, type BoardWyd } from "@/components/RequestsBoard";
import { meta, page, timeAgo } from "@/lib/ui";
import { isoHoursAgo } from "@/lib/time";

export default async function RequestsPage() {
  const { supabase, user, profile } = await requireApproved();
  const since = isoHoursAgo(7 * 24);
  const blocked = await getBlockedIds(user.id);

  const [{ data: mine }, { data: sent }] = await Promise.all([
    supabase
      .from("threads")
      .select(
        "id, body, status, created_at, requests(id, status, created_at, requester:profiles!requests_requester_id_fkey(id, name, dob, gender, photo_url, area, city, interests, social_url, bio)), chats(id, is_group, chat_members(user_id))",
      )
      .eq("author_id", user.id)
      .gt("created_at", since)
      .order("created_at", { ascending: false }),
    supabase
      .from("requests")
      .select("id, status, created_at, thread:threads(id, body, author:profiles!threads_author_id_fkey(name))")
      .eq("requester_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const wyds: BoardWyd[] = (mine ?? []).map((t) => ({
    id: t.id,
    body: t.body,
    status: t.status,
    created_at: t.created_at,
    chats: t.chats.map((c) => ({ id: c.id, is_group: c.is_group, members: c.chat_members.map((m) => m.user_id) })),
    requests: t.requests
      .filter((r) => r.requester && !blocked.has(r.requester.id))
      .map((r) => ({ ...r, requester: r.requester!, shared: r.requester!.interests.filter((i) => profile.interests.includes(i)) }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at)),
  }));

  return (
    <main className={`${page} pt-6`}>
      <h1 className="font-display text-title">Requests</h1>
      <p className={`${meta} mt-1`}>People asking to join your plans from the last 7 days.</p>

      {wyds.length === 0 ? (
        <section className="mt-12 flex flex-col items-center gap-3 text-center">
          <h2 className="text-h2">No plans yet</h2>
          <p className="text-body text-ink-2">When you drop a WYD, requests to join show up here, grouped by plan.</p>
        </section>
      ) : (
        <RequestsBoard wyds={wyds} />
      )}

      <h2 className="mt-10 text-h2">You asked to join</h2>
      {!sent?.length ? (
        <p className="mt-2 text-body text-ink-2">Nothing yet. Find a plan on your feed and tap “Ask to join”.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {sent.map((r) => (
            <li key={r.id}>
              {r.thread ? (
                <Link href={`/wyd/${r.thread.id}`} className="flex items-center justify-between gap-3 rounded-card bg-surface p-4 shadow-card">
                  <span className="min-w-0">
                    <span className="block truncate text-label">{r.thread.body}</span>
                    <span className={meta}>
                      {r.thread.author?.name.split(" ")[0]} · {timeAgo(r.created_at)}
                    </span>
                  </span>
                  <StatusPill status={r.status} />
                </Link>
              ) : (
                <p className={`${meta} rounded-card bg-surface p-4`}>This plan is no longer available.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function StatusPill({ status }: { status: "pending" | "accepted" | "declined" }) {
  const style = { pending: "bg-sunk text-ink", accepted: "bg-success/15 text-success", declined: "bg-sunk text-ink-2" }[status];
  const text = { pending: "Waiting", accepted: "Accepted", declined: "Declined" }[status];
  return <span className={`shrink-0 rounded-pill px-3 py-1 text-label ${style}`}>{text}</span>;
}
