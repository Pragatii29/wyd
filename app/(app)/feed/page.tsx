import Link from "next/link";
import { Bell } from "lucide-react";
import { requireApproved } from "@/lib/profile";
import { loadFeed } from "@/lib/feed";
import { CitySwitcher } from "@/components/CitySwitcher";
import { RefreshButton } from "@/components/RefreshButton";
import { WydCard } from "@/components/WydCard";
import { btn, page } from "@/lib/ui";

export default async function FeedPage() {
  const { supabase, user, profile } = await requireApproved();
  const [items, { count: unread }] = await Promise.all([
    loadFeed(supabase, profile),
    supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
  ]);

  return (
    <main className={`${page} pt-6`}>
      <header className="flex items-center justify-between gap-2">
        <h1 className="font-display text-title">WYD?</h1>
        <div className="flex items-center gap-1">
          <CitySwitcher city={profile.city} />
          <RefreshButton />
          <Link
            href="/notifications"
            aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
            className="relative inline-flex size-11 items-center justify-center rounded-full text-ink focus-visible:outline-2 focus-visible:outline-ink"
          >
            <Bell size={22} />
            {!!unread && <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-coral" />}
          </Link>
        </div>
      </header>
      <p className="mt-1 font-mono text-meta text-ink-2">Plans in {profile.city} from the last 24 hours</p>

      {items.length === 0 ? (
        <section className="mt-16 flex flex-col items-center gap-4 text-center">
          <h2 className="font-display text-title">No plans in {profile.city} yet</h2>
          <p className="text-body text-ink-2">Be the first — drop a WYD and people nearby who like the same things get a heads up.</p>
          <Link href="/wyd/new" className={`${btn.primary} max-w-60`}>
            Drop a WYD
          </Link>
        </section>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.wyd.id}>
              <WydCard {...item} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
