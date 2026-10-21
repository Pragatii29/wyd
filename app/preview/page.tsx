import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { BottomNav } from "@/components/BottomNav";
import { ChatListItem } from "@/components/ChatListItem";
import { Composer } from "@/components/Composer";
import { PreviewLinkGuard } from "@/components/PreviewLinkGuard";
import { CitySwitcher } from "@/components/CitySwitcher";
import { HomeHeader } from "@/components/HomeHeader";
import { ProfileCard } from "@/components/ProfileCard";
import { RequestDecision } from "@/components/RequestDecision";
import { RequestRow, type IncomingRequest } from "@/components/RequestRow";
import { WydCard, type FeedWyd } from "@/components/WydCard";
import type { Profile } from "@/lib/profile";
import { card, meta, page, timeAgo } from "@/lib/ui";

// Local look at the signed-in screens using the demo users. Development only: 404 on the live site.
// Every link and button stays inside the preview; nothing is saved.

const ago = (mins: number): string => new Date(Date.now() - mins * 60_000).toISOString();

function person(p: Partial<Profile> & Pick<Profile, "id" | "name" | "dob" | "gender" | "area" | "bio" | "interests">): Profile {
  return {
    city: "Bengaluru", photo_url: `/demo/${p.id}.png`, social_url: "", status: "approved", photo_check: null,
    rejection_reason: null, lat: null, lng: null, created_at: ago(600), ...p,
  };
}

const ME = person({ id: "ria", name: "Ria Sharma", dob: "2004-01-15", gender: "female", area: "Bannerghatta Road",
  bio: "Moved to Bangalore three months ago for my first job. I love slow mornings in new cafés, evening walks and live gigs on weekends.",
  interests: ["coffee_cafes", "walking", "concerts", "photography", "exploring_city"] });
const ARJUN = person({ id: "arjun", name: "Arjun Rao", dob: "2001-01-15", gender: "male", area: "Koramangala",
  bio: "Software engineer, weekend cricketer and street food hunter. Always down for long drives, good food and fun adventures!",
  interests: ["cricket", "football", "street_food", "walking", "day_trips"] });
const KABIR = person({ id: "kabir", name: "Kabir Singh", dob: "2002-01-15", gender: "male", area: "HSR Layout",
  bio: "Product designer by day, board game collector by night.", interests: ["board_games", "movies", "standup_comedy", "coffee_cafes"] });
const MEERA = person({ id: "meera", name: "Meera Iyer", dob: "1999-01-15", gender: "female", area: "Jayanagar",
  bio: "Bookworm and filter coffee loyalist.", interests: ["books", "chai", "art_museums", "yoga"] });

const author = (p: Profile) => ({ id: p.id, name: p.name, dob: p.dob, gender: p.gender, photo_url: p.photo_url });
const FEED: { wyd: FeedWyd; shared: string[]; mine: boolean; requestStatus: null; requestCount: number }[] = [
  { wyd: { id: "1", body: "Board games night at a café in HSR, need 2 or 3 more for Catan.", audience: "all", tags: ["board_games", "coffee_cafes"], area: "HSR Layout", city: "Bengaluru", created_at: ago(18), author: author(KABIR) }, shared: ["coffee_cafes"], mine: false, requestStatus: null, requestCount: 0 },
  { wyd: { id: "2", body: "Chai and a book swap in Jayanagar at 5pm? Bring one you loved.", audience: "women", tags: ["chai", "books"], area: "Jayanagar", city: "Bengaluru", created_at: ago(58), author: author(MEERA) }, shared: [], mine: false, requestStatus: null, requestCount: 0 },
  { wyd: { id: "3", body: "Looking for people to play cricket this evening in Koramangala. Have a bat and ball!", audience: "all", tags: ["cricket"], area: "Koramangala", city: "Bengaluru", created_at: ago(35), author: author(ARJUN) }, shared: [], mine: false, requestStatus: null, requestCount: 0 },
  { wyd: { id: "4", body: "New to Bangalore, 22F. Anyone up for exploring cafes near Bannerghatta Road today?", audience: "all", tags: ["coffee_cafes", "exploring_city"], area: "Bannerghatta Road", city: "Bengaluru", created_at: ago(9), author: author(ME) }, shared: [], mine: true, requestStatus: null, requestCount: 2 },
];
const REQUESTS: IncomingRequest[] = [
  { id: "r1", status: "pending", created_at: ago(4), thread: { body: FEED[3].wyd.body }, requester: ARJUN },
  { id: "r2", status: "accepted", created_at: ago(7), thread: { body: FEED[3].wyd.body }, requester: KABIR },
];

const PEOPLE: Record<string, Profile> = { ria: ME, arjun: ARJUN, kabir: KABIR, meera: MEERA };
const MESSAGES = [
  { from: "arjun", body: "Hey! Saw your plan. I know a great café near Bannerghatta Road", mins: 6 },
  { from: "ria", body: "Oh nice, which one? I'm free after 5", mins: 5 },
  { from: "arjun", body: "Third Wave on the main road? 5:30 works?", mins: 4 },
  { from: "ria", body: "Perfect, see you there", mins: 3 },
];

const SCREENS = ["home", "requests", "request", "post", "alerts", "chats", "chat", "profile"] as const;
type Screen = (typeof SCREENS)[number];
const NAV_CURRENT: Partial<Record<Screen, "/feed" | "/notifications" | "/chats" | "/profile">> = {
  home: "/feed", requests: "/feed", alerts: "/notifications", chats: "/chats", chat: "/chats", profile: "/profile",
};

function Back({ to, title }: { to: Screen; title: string }) {
  return (
    <header className="sticky top-0 z-20 -mx-4 grid h-14 grid-cols-[44px_1fr_44px] items-center bg-canvas/90 px-4 backdrop-blur">
      <Link href={`/preview?screen=${to}`} className="inline-flex size-11 items-center justify-center rounded-full text-ink" aria-label="Back">
        <ArrowLeft size={24} />
      </Link>
      <h1 className="text-center text-h2">{title}</h1>
      <span />
    </header>
  );
}

export default async function Preview({ searchParams }: { searchParams: Promise<{ screen?: string; tab?: string; who?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const sp = await searchParams;
  const screen: Screen = sp.tab === "requests" ? "requests" : SCREENS.find((s) => s === sp.screen) ?? "home";
  const shown = PEOPLE[sp.who ?? "ria"] ?? ME;

  return (
    <div className="min-h-dvh pb-[calc(80px+env(safe-area-inset-bottom))]">
      <PreviewLinkGuard />
      <nav className="flex gap-1 overflow-x-auto bg-candle px-2 py-1.5 text-label text-ink" aria-label="Preview screens">
        <span className="shrink-0 px-2 py-1">Preview:</span>
        {SCREENS.map((s) => (
          <Link key={s} href={`/preview?screen=${s}`} className={`shrink-0 rounded-pill px-3 py-1 ${s === screen ? "bg-ink text-bone" : ""}`}>
            {s}
          </Link>
        ))}
      </nav>

      {(screen === "home" || screen === "requests") && (
        <main className="mx-auto w-full max-w-[480px]">
          <HomeHeader photo={ME.photo_url} name={ME.name} onRequests={screen === "requests"} waiting={1} base="/preview" />
          {screen === "home" ? (
            <>
              <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-2">
                <p className="min-w-0 truncate font-mono text-meta text-ink-2">Near {ME.area}, {ME.city} · last 24h</p>
                <CitySwitcher city={ME.city} />
              </div>
              <ul>
                {FEED.map((item) => (
                  <li key={item.wyd.id}>
                    <WydCard {...item} linkBody={false} preview />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <ul>
              {REQUESTS.map((r) => (
                <li key={r.id}>
                  <RequestRow r={r} href={r.status === "pending" ? "/preview?screen=request" : "/preview?screen=chat"} />
                </li>
              ))}
            </ul>
          )}
        </main>
      )}

      {screen === "request" && (
        <main className={`${page} pb-32`}>
          <Back to="requests" title="Chat request" />
          <div className="mb-4 mt-2 rounded-card bg-night px-4 py-3 text-bone">
            <span className="font-mono text-meta text-bone">Wants to join · 4 min ago</span>
            <span className="mt-1 line-clamp-2 block text-wyd">{FEED[3].wyd.body}</span>
          </div>
          <ProfileCard profile={ARJUN} sharedWith={ME.interests} />
          <RequestDecision requestId="preview" threadId="preview" requesterId="preview" firstName="Arjun" planText={FEED[3].wyd.body} status="pending" chatId={null} preview />
        </main>
      )}

      {screen === "post" && (
        <main className={`${page} pt-2`}>
          <Back to="home" title="Drop a WYD" />
          <p className="mt-2 text-body text-ink-2">Share a plan. People in your city who like the same things get a heads up.</p>
          <Composer city={ME.city} area={ME.area} preview />
        </main>
      )}

      {screen === "alerts" && (
        <main className={`${page} pt-2`}>
          <Back to="home" title="Notifications" />
          <ul className="mt-2 flex flex-col gap-2">
            {[
              { who: KABIR, body: FEED[0].wyd.body, mins: 18, unread: true },
              { who: MEERA, body: FEED[1].wyd.body, mins: 58, unread: true },
              { who: ARJUN, body: "Arjun asked to join your plan", mins: 4, unread: false },
            ].map((n) => (
              <li key={n.body}>
                <Link href="/preview?screen=home" className="flex items-start gap-3 rounded-card bg-surface p-4 shadow-card">
                  <Avatar src={n.who.photo_url} name={n.who.name} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-label">{n.who.name.split(" ")[0]}</span>
                    <span className="block text-body text-ink-2">{n.body}</span>
                    <span className={meta}>{timeAgo(ago(n.mins))}</span>
                  </span>
                  {n.unread && <span className="mt-2 size-2 shrink-0 rounded-full bg-coral" aria-label="Unread" />}
                </Link>
              </li>
            ))}
          </ul>
        </main>
      )}

      {screen === "chats" && (
        <main className={`${page} pt-6`}>
          <h1 className="font-display text-title">Chats</h1>
          <p className={`${meta} mt-1`}>Coordinate the time and place here. Only people in the chat can read it.</p>
          <ul className="mt-4 flex flex-col gap-2">
            <li>
              <ChatListItem id="preview-1" isGroup={false} title={FEED[3].wyd.body} people="Arjun" photo={ARJUN.photo_url} lastText="Perfect, see you there" lastAt={ago(3)} lastFromOther={false} />
            </li>
            <li>
              <ChatListItem id="preview-2" isGroup title="Board games night at a café in HSR" people="Kabir, Meera" photo={null} lastText="Kabir: I'll bring Catan and Codenames" lastAt={ago(20)} lastFromOther />
            </li>
          </ul>
        </main>
      )}

      {screen === "chat" && (
        <main className={`${page} flex h-[calc(100dvh-120px-env(safe-area-inset-bottom))] flex-col pt-2`}>
          <Back to="chats" title="Arjun" />
          <p className={`${meta} truncate text-center`}>{FEED[3].wyd.body}</p>
          <ul className="flex flex-1 flex-col gap-2 overflow-y-auto py-4">
            {MESSAGES.map((m) => {
              const mine = m.from === "ria";
              return (
                <li key={m.body} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                  <p className={`max-w-[78%] rounded-[20px] px-3.5 py-2.5 text-body ${mine ? "bg-ink text-bone" : "bg-surface text-ink shadow-card"}`}>{m.body}</p>
                  <span className={`${meta} mt-0.5 px-2`}>{timeAgo(ago(m.mins))}</span>
                </li>
              );
            })}
          </ul>
          <div className="flex items-end gap-2 pb-2">
            <input disabled placeholder="Message (preview)" className="h-12 flex-1 rounded-pill border border-line bg-surface px-4 text-body placeholder:text-ink-3" />
            <span className="flex size-12 items-center justify-center rounded-full bg-sunk text-ink-3">
              <ArrowUp size={20} />
            </span>
          </div>
        </main>
      )}

      {screen === "profile" && (
        <main className={`${page} pt-6`}>
          <ProfileCard profile={shown} sharedWith={shown.id === ME.id ? [] : ME.interests} />
          {shown.id !== ME.id && (
            <div className={`${card} mt-4`}>
              <Link href="/preview?screen=home" className="text-label text-coral-text">Back to For you</Link>
            </div>
          )}
        </main>
      )}

      <BottomNav unreadAlerts={2} photo={ME.photo_url} name="Ria" compose={screen === "home"} current={NAV_CURRENT[screen]} />
    </div>
  );
}
