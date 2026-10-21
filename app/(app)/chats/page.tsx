import { requireApproved } from "@/lib/profile";
import { ChatListItem } from "@/components/ChatListItem";
import { meta, page } from "@/lib/ui";

export default async function ChatsPage() {
  const { supabase, user } = await requireApproved();

  // RLS: only chats this user created or is a member of.
  const { data: chats } = await supabase
    .from("chats")
    .select("id, is_group, created_at, thread:threads(body), chat_members(user_id, profile:profiles(name, photo_url))")
    .order("created_at", { ascending: false });

  const ids = (chats ?? []).map((c) => c.id);
  const { data: messages } = ids.length
    ? await supabase.from("messages").select("chat_id, body, sender_id, created_at").in("chat_id", ids).order("created_at", { ascending: false }).limit(300)
    : { data: [] };

  const items = (chats ?? [])
    .map((c) => {
      const last = messages?.find((m) => m.chat_id === c.id);
      const others = c.chat_members.filter((m) => m.user_id !== user.id && m.profile);
      return {
        id: c.id,
        isGroup: c.is_group,
        title: c.thread?.body ?? "A plan",
        people: others.map((m) => m.profile!.name.split(" ")[0]).join(", "),
        photo: others[0]?.profile?.photo_url ?? null,
        lastText: last ? `${last.sender_id === user.id ? "You: " : ""}${last.body}` : "Say hi and fix the plan",
        lastAt: last?.created_at ?? c.created_at,
        lastFromOther: !!last && last.sender_id !== user.id,
      };
    })
    .sort((a, b) => b.lastAt.localeCompare(a.lastAt));

  return (
    <main className={`${page} pt-6`}>
      <h1 className="font-display text-title">Chats</h1>
      <p className={`${meta} mt-1`}>Coordinate the time and place here. Only people in the chat can read it.</p>
      {items.length === 0 ? (
        <section className="mt-12 flex flex-col items-center gap-3 text-center">
          <h2 className="text-h2">No chats yet</h2>
          <p className="text-body text-ink-2">Chats open when a poster accepts you, or when you start one from your Requests.</p>
        </section>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {items.map((c) => (
            <li key={c.id}>
              <ChatListItem {...c} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
