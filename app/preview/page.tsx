import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { CitySwitcher } from "@/components/CitySwitcher";
import { HomeHeader } from "@/components/HomeHeader";
import { ProfileCard } from "@/components/ProfileCard";
import { RequestDecision } from "@/components/RequestDecision";
import { RequestRow, type IncomingRequest } from "@/components/RequestRow";
import { WydCard, type FeedWyd } from "@/components/WydCard";
import type { Profile } from "@/lib/profile";
import { page } from "@/lib/ui";

// Local look at the signed-in screens using the demo users. Development only: 404 on the live site.
// Buttons that save things (Ask to join, Pass, Accept) need a real signed-in account.

const ago = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString();

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

const SCREENS = ["home", "requests", "request", "profile"] as const;

export default async function Preview({ searchParams }: { searchParams: Promise<{ screen?: string; tab?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const sp = await searchParams;
  const screen = sp.tab === "requests" ? "requests" : SCREENS.find((s) => s === sp.screen) ?? "home";

  return (
    <div className="min-h-dvh pb-[calc(80px+env(safe-area-inset-bottom))]">
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
                    <WydCard {...item} linkBody={false} />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <ul>
              {REQUESTS.map((r) => (
                <li key={r.id}>
                  <RequestRow r={r} href="/preview?screen=request" />
                </li>
              ))}
            </ul>
          )}
        </main>
      )}

      {screen === "request" && (
        <main className={`${page} pb-32`}>
          <header className="sticky top-0 z-20 -mx-4 grid h-14 grid-cols-[44px_1fr_44px] items-center bg-canvas/90 px-4 backdrop-blur">
            <Link href="/preview?screen=requests" className="inline-flex size-11 items-center justify-center rounded-full text-ink" aria-label="Back">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-center text-h2">Chat request</h1>
            <span />
          </header>
          <div className="mb-4 mt-2 rounded-card bg-night px-4 py-3 text-bone">
            <span className="font-mono text-meta text-bone">Wants to join · 4 min ago</span>
            <span className="mt-1 line-clamp-2 block text-wyd">{FEED[3].wyd.body}</span>
          </div>
          <ProfileCard profile={ARJUN} sharedWith={ME.interests} />
          <RequestDecision requestId="preview" threadId="preview" requesterId="preview" firstName="Arjun" planText={FEED[3].wyd.body} status="pending" chatId={null} />
        </main>
      )}

      {screen === "profile" && (
        <main className={`${page} pt-6`}>
          <ProfileCard profile={ME} />
        </main>
      )}

      <BottomNav unreadAlerts={2} photo={ME.photo_url} name="Ria" compose={screen === "home"} />
    </div>
  );
}
