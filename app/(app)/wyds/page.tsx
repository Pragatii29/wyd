import Link from "next/link";
import { Plus } from "lucide-react";
import { requireApproved } from "@/lib/profile";
import { getBlockedIds } from "@/lib/blocks";
import { RequestsBoard, type BoardWyd } from "@/components/RequestsBoard";
import { btn, eyebrow, meta, page, timeAgo } from "@/lib/ui";

// My WYDs: every plan you've posted, its status, who asked to join (accept / pass), and 1:1 or group chats.
export default async function MyWydsPage() {
  const { supabase, user, profile } = await requireApproved();
  const blocked = await getBlockedIds(user.id);

  const [{ data: mine }, { data: sent }] = await Promise.all([
    supabase
      .from("threads")
      .select(
        "id, body, status, created_at, requests(id, status, created_at, requester:profiles!requests_requester_id_fkey(id, name, dob, gender, photo_url, area, city, interests, social_url, bio)), chats(id, is_group, chat_members(user_id))",
      )
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
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
      // Waiting first, then newest.
      .sort((a, b) => Number(b.status === "pending") - Number(a.status === "pending") || b.created_at.localeCompare(a.created_at)),
  }));
  const waiting = wyds.reduce((n, w) => n + w.requests.filter((r) => r.status === "pending").length, 0);

  return (
    <main className={`${page} pb-8 pt-6`}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className={eyebrow}>
            {wyds.length} posted{waiting > 0 ? ` · ${waiting} waiting for you` : ""}
          </p>
          <h1 className="mt-1 font-display text-display">My WYDs</h1>
        </div>
        <Link href="/wyd/new" className={`${btn.smallAccent} w-auto shrink-0`}>
          <Plus size={16} /> New
        </Link>
      </div>

      {wyds.length === 0 ? (
        <section className="mt-12 flex flex-col items-center gap-4 text-center">
          <h2 className="text-h2">You haven&apos;t posted yet</h2>
          <p className="text-body text-ink-2">Drop a WYD and people who want to join show up here. Accept who you like, then start a 1:1 or group chat.</p>
          <Link href="/wyd/new" className={`${btn.primary} max-w-60`}>
            Drop a WYD
          </Link>
        </section>
      ) : (
        <RequestsBoard wyds={wyds} />
      )}

      <h2 className="mt-12 text-h2">You asked to join</h2>
      {!sent?.length ? (
        <p className="mt-2 text-body text-ink-2">Nothing yet. Find a plan on your feed and tap “Ask to join”.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {sent.map((r) => (
            <li key={r.id}>
              {r.thread ? (
                <Link href={`/wyd/${r.thread.id}`} className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface p-4">
                  <span className="min-w-0">
                    <span className="block truncate text-label">{r.thread.body}</span>
                    <span className={meta}>
                      {r.thread.author?.name.split(" ")[0]} · {timeAgo(r.created_at)}
                    </span>
                  </span>
                  <StatusPill status={r.status} />
                </Link>
              ) : (
                <p className={`${meta} rounded-card border border-line bg-surface p-4`}>This plan is no longer available.</p>
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
  const text = { pending: "Waiting", accepted: "Accepted", declined: "Not this time" }[status];
  return <span className={`shrink-0 rounded-pill px-3 py-1 text-label ${style}`}>{text}</span>;
}
