import Link from "next/link";
import { BadgeCheck, Inbox, MapPin, Sparkles } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { AudienceChip } from "@/components/AudienceChip";
import { InterestChip } from "@/components/InterestChip";
import { JoinButton } from "@/components/JoinButton";
import { displayName } from "@/lib/profile";
import type { Audience } from "@/lib/audience";
import { timeAgo } from "@/lib/ui";

export type FeedWyd = {
  id: string;
  body: string;
  audience: Audience;
  tags: string[];
  area: string;
  city: string;
  created_at: string;
  author: { id: string; name: string; dob: string; gender: "female" | "male"; photo_url: string };
};

// A WYD as a post row: avatar on the left, name · area · time, the plan, chips, then the action.
export function WydCard({
  wyd,
  shared,
  mine,
  requestStatus,
  requestCount,
  linkBody = true,
}: {
  wyd: FeedWyd;
  shared: string[];
  mine: boolean;
  requestStatus: "pending" | "accepted" | "declined" | null;
  requestCount: number;
  linkBody?: boolean;
}) {
  const body = <p className={`${linkBody ? "line-clamp-4" : ""} text-wyd text-ink`}>{wyd.body}</p>;
  return (
    <article className="animate-fade-in flex gap-3 border-b border-line px-4 py-4">
      <Link href={mine ? "/profile" : `/profile/${wyd.author.id}`} className="shrink-0 self-start rounded-full focus-visible:outline-2 focus-visible:outline-ink">
        <Avatar src={wyd.author.photo_url} name={wyd.author.name} size={48} />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-1 text-body">
          <span className="text-label text-ink">{mine ? "You" : displayName(wyd.author)}</span>
          <BadgeCheck size={16} className="text-success" aria-label="Verified" />
          <span className="font-mono text-meta text-ink-2">
            · <time dateTime={wyd.created_at}>{timeAgo(wyd.created_at)}</time>
          </span>
        </div>
        <p className="-mt-1 flex items-center gap-1 font-mono text-meta text-ink-2">
          <MapPin size={12} aria-hidden /> {[wyd.area, wyd.city].filter(Boolean).join(", ")}
        </p>

        {shared.length > 0 && !mine && (
          <span className="inline-flex items-center gap-1 self-start rounded-pill bg-candle px-2.5 py-0.5 text-label text-ink">
            <Sparkles size={12} /> Matches your interests
          </span>
        )}

        {linkBody ? (
          <Link href={`/wyd/${wyd.id}`} className="rounded-sm focus-visible:outline-2 focus-visible:outline-ink">
            {body}
          </Link>
        ) : (
          body
        )}

        <div className="flex flex-wrap items-center gap-2">
          <AudienceChip audience={wyd.audience} />
          {wyd.tags.slice(0, 3).map((t) => (
            <InterestChip key={t} tag={t} highlight={shared.includes(t)} />
          ))}
        </div>

        <div className="pt-1">
          {mine ? (
            <Link
              href="/feed?tab=requests"
              className="inline-flex h-11 items-center gap-2 rounded-pill border border-line bg-surface px-4 text-label text-ink transition duration-fast ease-out active:scale-[0.97]"
            >
              <Inbox size={16} /> {requestCount === 0 ? "No requests yet" : `${requestCount} request${requestCount > 1 ? "s" : ""}`}
            </Link>
          ) : (
            <JoinButton threadId={wyd.id} status={requestStatus} compact />
          )}
        </div>
      </div>
    </article>
  );
}
