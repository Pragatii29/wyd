import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { requireApproved } from "@/lib/profile";
import { getBlockedIds } from "@/lib/blocks";
import { AUTHOR_FIELDS } from "@/lib/feed";
import { WydCard, type FeedWyd } from "@/components/WydCard";
import { SafetyMenu } from "@/components/SafetyMenu";
import { DeleteWydButton } from "@/components/DeleteWydButton";
import { btn, meta, page } from "@/lib/ui";
import { olderThanHours } from "@/lib/time";

export default async function WydPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile } = await requireApproved();

  // RLS only returns WYDs this viewer may see (live + audience rule, or their own).
  const { data: thread } = /^[0-9a-f-]{36}$/i.test(id)
    ? await supabase
        .from("threads")
        .select(`id, body, audience, tags, area, city, created_at, status, author_id, moderation_reason, author:profiles!threads_author_id_fkey(${AUTHOR_FIELDS})`)
        .eq("id", id)
        .maybeSingle()
    : { data: null };
  const blocked = thread ? (await getBlockedIds(user.id)).has(thread.author_id) : false;

  if (!thread || !thread.author || blocked) {
    return (
      <main className={`${page} flex flex-col gap-4 pt-16`}>
        <h1 className="font-display text-title">This plan isn&apos;t available</h1>
        <p className="text-body text-ink-2">It may have been deleted, or it isn&apos;t shared with you.</p>
        <Link href="/feed" className={btn.primary}>
          Back to feed
        </Link>
      </main>
    );
  }

  const mine = thread.author_id === user.id;
  const [{ data: requests }, { data: chats }] = await Promise.all([
    supabase.from("requests").select("requester_id, status").eq("thread_id", thread.id),
    supabase.from("chats").select("id").eq("thread_id", thread.id),
  ]);
  const myRequest = requests?.find((r) => r.requester_id === user.id);
  const expired = olderThanHours(thread.created_at, 24);

  return (
    <main className={`${page} pt-6`}>
      <div className="flex items-center justify-between">
        <Link href="/feed" className="inline-flex size-11 items-center justify-center rounded-full text-ink" aria-label="Back to feed">
          <ArrowLeft size={22} />
        </Link>
        {!mine && (
          <SafetyMenu target={{ type: "thread", id: thread.id }} userId={thread.author_id} userName={thread.author.name.split(" ")[0]} />
        )}
      </div>

      {mine && thread.status !== "live" && (
        <p className="mt-2 rounded-card border border-candle bg-surface p-4 text-body">
          {thread.status === "review"
            ? "Waiting for a quick review before it goes live. Nobody can see it yet."
            : "This WYD was blocked by our team."}
        </p>
      )}
      {!mine && thread.city !== profile.city && (
        <p className="mt-2 rounded-card bg-sunk p-4 text-body">This plan is in {thread.city}. Switch your active city to join it.</p>
      )}
      {expired && <p className={`${meta} mt-2`}>This plan is more than a day old.</p>}

      <div className="mt-2">
        <WydCard
          wyd={thread as unknown as FeedWyd}
          shared={thread.tags.filter((t) => profile.interests.includes(t))}
          mine={mine}
          requestStatus={myRequest?.status ?? null}
          requestCount={requests?.length ?? 0}
          linkBody={false}
        />
      </div>

      {!!chats?.length && (
        <div className="mt-3 flex flex-col gap-2">
          {chats.map((c) => (
            <Link key={c.id} href={`/chats/${c.id}`} className={btn.secondary}>
              <MessageCircle size={18} /> Open chat
            </Link>
          ))}
        </div>
      )}

      {mine && (
        <div className="mt-6">
          <DeleteWydButton threadId={thread.id} />
        </div>
      )}
    </main>
  );
}
