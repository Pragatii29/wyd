import Link from "next/link";
import { requireApproved } from "@/lib/profile";
import { loadFeed } from "@/lib/feed";
import { loadIncomingRequests, loadPlanGroups } from "@/lib/requests";
import { CitySwitcher } from "@/components/CitySwitcher";
import { HomeHeader } from "@/components/HomeHeader";
import { PlanGroupChat } from "@/components/PlanGroupChat";
import { RequestRow } from "@/components/RequestRow";
import { WydCard } from "@/components/WydCard";
import { Haze, Logo } from "@/components/Logo";
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

  // Requests grouped by plan, so a plan with several people can become one group chat.
  const plans = new Map<string, { thread: (typeof incoming)[number]["thread"]; rows: typeof incoming }>();
  for (const r of incoming) {
    const plan = plans.get(r.thread.id) ?? { thread: r.thread, rows: [] };
    plan.rows.push(r);
    plans.set(r.thread.id, plan);
  }
  const groups = onRequests ? await loadPlanGroups(supabase, user.id, [...plans.keys()]) : new Map();

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
              {[...plans.values()].map(({ thread, rows }) => {
                const open = rows.filter((r) => r.status === "pending").length;
                const accepted = rows.filter((r) => r.status === "accepted").map((r) => r.requester.id);
                return (
                  <div key={thread.id} className="border-b border-line">
                    <div className="flex flex-col gap-3 bg-surface px-4 py-3">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="line-clamp-2 text-label">“{thread.body}”</p>
                        <span className="shrink-0 font-mono text-meta text-ink-2">
                          {rows.length} {rows.length === 1 ? "person" : "people"}
                        </span>
                      </div>
                      {rows.length + (groups.get(thread.id) ? 1 : 0) > 1 && (
                        <div className="flex gap-2">
                          <Link href={`/wyds#wyd-${thread.id}`} className={`${btn.small} shrink-0`}>
                            Choose people
                          </Link>
                          <PlanGroupChat
                            threadId={thread.id}
                            waiting={open}
                            accepted={accepted}
                            group={groups.get(thread.id)}
                            className={`${btn.smallAccent} w-full flex-1`}
                          />
                        </div>
                      )}
                    </div>
                    <ul>
                      {rows.map((r) => (
                        <li key={r.id}>
                          <RequestRow r={r} href={`/requests/${r.id}`} />
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              <Link href="/wyds" className={`${btn.ghost} mx-4 my-4`}>
                Manage requests and chats in My WYDs
              </Link>
            </>
          )}
        </section>
      ) : (
        <section aria-label="For you">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-1.5">
            <CitySwitcher city={profile.city} area={profile.area} inline />
            <span className="shrink-0 font-mono text-meta text-ink-3">last 24h</span>
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
    <div className="relative mx-4 mt-8 overflow-hidden rounded-card bg-brand px-8 pb-10 pt-12 text-center text-on-brand">
      <Haze sphere={false} />
      <div className="relative flex flex-col items-center gap-4">
        <Logo className="h-10 w-auto" spark twinkle />
        <h2 className="font-display text-title">{title}</h2>
        <p className="text-body text-on-brand/75">{body}</p>
        <Link href={cta.href} className={`${btn.brand} max-w-60`}>
          {cta.label}
        </Link>
      </div>
    </div>
  );
}
