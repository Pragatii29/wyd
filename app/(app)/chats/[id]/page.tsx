import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireApproved } from "@/lib/profile";
import { getBlockedIds } from "@/lib/blocks";
import { ChatRoom } from "@/components/ChatRoom";
import { btn, page } from "@/lib/ui";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireApproved();

  // RLS returns nothing unless this user is a member (or the creator).
  const { data: chat } = /^[0-9a-f-]{36}$/i.test(id)
    ? await supabase
        .from("chats")
        .select("id, is_group, thread_id, thread:threads(body), chat_members(user_id, profile:profiles(id, name, photo_url))")
        .eq("id", id)
        .maybeSingle()
    : { data: null };
  const isMember = chat?.chat_members.some((m) => m.user_id === user.id);

  if (!chat || !isMember) {
    return (
      <main className={`${page} flex flex-col gap-4 pt-16`}>
        <h1 className="font-display text-title">You&apos;re not in this chat</h1>
        <p className="text-body text-ink-2">Chats are private to the poster and the people they picked.</p>
        <Link href="/chats" className={btn.primary}>
          Back to chats
        </Link>
      </main>
    );
  }

  const [{ data: messages }, blocked] = await Promise.all([
    supabase.from("messages").select("id, body, sender_id, created_at").eq("chat_id", chat.id).order("created_at").limit(200),
    getBlockedIds(user.id),
  ]);
  const members = chat.chat_members.filter((m) => m.profile).map((m) => ({ id: m.profile!.id, name: m.profile!.name, photo: m.profile!.photo_url }));

  return (
    <main className={`${page} flex h-[calc(100dvh-100px-env(safe-area-inset-bottom))] flex-col pt-4`}>
      <div className="flex items-center gap-2">
        <Link href="/chats" className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink" aria-label="Back to chats">
          <ArrowLeft size={22} />
        </Link>
        <Link href={chat.thread_id ? `/wyd/${chat.thread_id}` : "/chats"} className="min-w-0 flex-1">
          <span className="block truncate text-label">{chat.thread?.body ?? "Plan chat"}</span>
          <span className="block truncate font-mono text-meta text-ink-2">
            {members.filter((m) => m.id !== user.id).map((m) => m.name.split(" ")[0]).join(", ")}
            {chat.is_group ? " · group" : ""}
          </span>
        </Link>
      </div>
      <ChatRoom
        chatId={chat.id}
        me={user.id}
        isGroup={chat.is_group}
        members={members}
        blocked={Array.from(blocked)}
        initial={messages ?? []}
      />
    </main>
  );
}
