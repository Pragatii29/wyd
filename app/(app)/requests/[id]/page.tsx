import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireApproved } from "@/lib/profile";
import { getBlockedIds } from "@/lib/blocks";
import { ProfileCard } from "@/components/ProfileCard";
import { RequestDecision } from "@/components/RequestDecision";
import { SafetyMenu } from "@/components/SafetyMenu";
import { btn, page, timeAgo } from "@/lib/ui";

// One person's request to join your WYD: their profile, then Pass / Accept.
export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile: me } = await requireApproved();

  // RLS: only the requester or the WYD's author can read a request.
  const { data: req } = /^[0-9a-f-]{36}$/i.test(id)
    ? await supabase
        .from("requests")
        .select("id, status, created_at, thread:threads(id, body, author_id), requester:profiles!requests_requester_id_fkey(*)")
        .eq("id", id)
        .maybeSingle()
    : { data: null };
  const blocked = req?.requester ? (await getBlockedIds(user.id)).has(req.requester.id) : false;

  if (!req || !req.thread || !req.requester || req.thread.author_id !== user.id || blocked) {
    return (
      <main className={`${page} flex flex-col gap-4 pt-16`}>
        <h1 className="font-display text-title">Request not available</h1>
        <p className="text-body text-ink-2">It may have been withdrawn, or it isn&apos;t for one of your plans.</p>
        <Link href="/feed?tab=requests" className={btn.primary}>
          Back to requests
        </Link>
      </main>
    );
  }

  const { data: chats } = await supabase
    .from("chats")
    .select("id, is_group, chat_members(user_id)")
    .eq("thread_id", req.thread.id)
    .eq("is_group", false);
  const chatId = chats?.find((c) => c.chat_members.some((m) => m.user_id === req.requester!.id))?.id ?? null;
  const firstName = req.requester.name.split(" ")[0];

  return (
    <main className={`${page} pb-32`}>
      <header className="sticky top-0 z-20 -mx-4 grid h-14 grid-cols-[44px_1fr_44px] items-center bg-canvas/90 px-4 backdrop-blur">
        <Link href="/feed?tab=requests" className="inline-flex size-11 items-center justify-center rounded-full text-ink" aria-label="Back to requests">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-center text-h2">Chat request</h1>
        <span />
      </header>

      <Link href={`/wyd/${req.thread.id}`} className="mb-4 mt-2 block rounded-card bg-night px-4 py-3 text-bone">
        <span className="font-mono text-meta text-bone">Wants to join · {timeAgo(req.created_at)}</span>
        <span className="mt-1 line-clamp-2 block text-wyd">{req.thread.body}</span>
      </Link>

      <ProfileCard
        profile={req.requester}
        sharedWith={me.interests}
        action={<SafetyMenu target={{ type: "profile", id: req.requester.id }} userId={req.requester.id} userName={firstName} afterBlock="/feed?tab=requests" />}
      />

      <RequestDecision
        requestId={req.id}
        threadId={req.thread.id}
        requesterId={req.requester.id}
        firstName={firstName}
        planText={req.thread.body}
        status={req.status}
        chatId={chatId}
      />
    </main>
  );
}
