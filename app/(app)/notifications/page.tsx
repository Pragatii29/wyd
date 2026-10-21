import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireApproved } from "@/lib/profile";
import { PushToggle } from "@/components/PushToggle";
import { MarkRead } from "@/components/MarkRead";
import { card, meta, page, timeAgo } from "@/lib/ui";

export default async function NotificationsPage() {
  const { supabase, user } = await requireApproved();
  const { data: items } = await supabase
    .from("notifications")
    .select("thread_id, title, body, read, sent_at")
    .eq("user_id", user.id)
    .order("sent_at", { ascending: false })
    .limit(50);
  const unread = items?.some((n) => !n.read) ?? false;

  return (
    <main className={`${page} pt-6`}>
      <Link href="/feed" className="inline-flex size-11 items-center justify-center rounded-full text-ink" aria-label="Back to feed">
        <ArrowLeft size={22} />
      </Link>
      <h1 className="mt-2 font-display text-title">Notifications</h1>
      <div className={`${card} mt-4`}>
        <PushToggle />
      </div>

      {!items?.length ? (
        <p className="mt-10 text-center text-body text-ink-2">No alerts yet. When someone in your city posts a plan you might like, it shows up here.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {items.map((n) => (
            <li key={n.thread_id}>
              <Link href={`/wyd/${n.thread_id}`} className="flex items-start gap-3 rounded-card bg-surface p-4 shadow-card">
                <span className={`mt-2 size-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-coral"}`} aria-label={n.read ? undefined : "Unread"} />
                <span className="min-w-0 flex-1">
                  <span className="block text-label">{n.title}</span>
                  <span className="block text-body text-ink-2">{n.body}</span>
                  <span className={meta}>{timeAgo(n.sent_at)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {unread && <MarkRead />}
    </main>
  );
}
