import Link from "next/link";
import { requireApproved } from "@/lib/profile";
import { loadFeed } from "@/lib/feed";
import { loadIncomingRequests } from "@/lib/requests";
import { CitySwitcher } from "@/components/CitySwitcher";
import { HomeHeader } from "@/components/HomeHeader";
import { RequestRow } from "@/components/RequestRow";
import { WydCard } from "@/components/WydCard";
import { btn } from "@/lib/ui";

// Home: "For you" (plans in your active city, your interests first) and "Requests" (people asking to join you).
export default async function FeedPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const onRequests = tab === "requests";
  const { supabase, user, profile } = await requireApproved();
  const [items, incoming] = await Promise.all([
    onRequests ? Promise.resolve([]) : loadFeed(supabase, profile),
    loadIncomingRequests(supabase, user.id),
  ]);
  const waiting = incoming.filter((r) => r.status === "pending").length;
  const place = [profile.area, profile.city].filter(Boolean).join(", ");

  return (
    <main className="mx-auto w-full max-w-[480px]">
      <HomeHeader photo={profile.photo_url} name={profile.name} onRequests={onRequests} waiting={waiting} />

      {onRequests ? (
        <section aria-label="Requests">
          {incoming.length === 0 ? (
            <Empty
              title="No requests yet"
              body="When someone asks to join one of your plans, they'll show up here."
              cta={{ href: "/wyd/new", label: "Drop a WYD" }}
            />
          ) : (
            <>
              <ul>
                {incoming.map((r) => (
                  <li key={r.id}>
                    <RequestRow r={r} href={`/requests/${r.id}`} />
                  </li>
                ))}
              </ul>
              <Link href="/requests" className={`${btn.ghost} mx-4 my-4`}>
                Start a group chat from a plan
              </Link>
            </>
          )}
        </section>
      ) : (
        <section aria-label="For you">
          <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
            <p className="min-w-0 truncate font-mono text-meta text-ink-2">Near {place} · last 24h</p>
            <CitySwitcher city={profile.city} />
          </div>
          {items.length === 0 ? (
            <Empty
              title={`No plans in ${profile.city} yet`}
              body="Be the first — drop a WYD and people nearby who like the same things get a heads up."
              cta={{ href: "/wyd/new", label: "Drop a WYD" }}
            />
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.wyd.id}>
                  <WydCard {...item} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

function Empty({ title, body, cta }: { title: string; body: string; cta: { href: string; label: string } }) {
  return (
    <div className="flex flex-col items-center gap-4 px-8 pt-16 text-center">
      <h2 className="font-display text-title">{title}</h2>
      <p className="text-body text-ink-2">{body}</p>
      <Link href={cta.href} className={`${btn.primary} max-w-60`}>
        {cta.label}
      </Link>
    </div>
  );
}
