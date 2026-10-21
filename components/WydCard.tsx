import Link from "next/link";
import { BadgeCheck, MapPin, Sparkles } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { AudienceChip } from "@/components/AudienceChip";
import { InterestChip } from "@/components/InterestChip";
import { JoinButton } from "@/components/JoinButton";
import { displayName } from "@/lib/profile";
import type { Audience } from "@/lib/audience";
import { btn, card, meta, timeAgo } from "@/lib/ui";

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
  const body = <p className="line-clamp-4 text-wyd text-ink">{wyd.body}</p>;
  return (
    <article className={`${card} animate-fade-in flex flex-col gap-3`}>
      <div className="flex items-center gap-3">
        <Link href={mine ? "/profile" : `/profile/${wyd.author.id}`} className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-ink">
          <Avatar src={wyd.author.photo_url} name={wyd.author.name} size={40} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-label text-ink">
            {mine ? "You" : displayName(wyd.author)}
            <BadgeCheck size={16} className="text-success" aria-label="Verified" />
          </p>
          <p className={`${meta} flex items-center gap-1`}>
            <MapPin size={12} aria-hidden /> {[wyd.area, wyd.city].filter(Boolean).join(", ")}
          </p>
        </div>
        <time dateTime={wyd.created_at} className={meta}>
          {timeAgo(wyd.created_at)}
        </time>
      </div>

      {shared.length > 0 && !mine && (
        <span className="inline-flex items-center gap-1 self-start rounded-pill bg-candle px-3 py-1 text-label text-ink">
          <Sparkles size={14} /> Matches your interests
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

      {mine ? (
        <Link href={`/requests#wyd-${wyd.id}`} className={btn.secondary}>
          {requestCount === 0 ? "No requests yet" : `${requestCount} request${requestCount > 1 ? "s" : ""}`}
        </Link>
      ) : (
        <JoinButton threadId={wyd.id} status={requestStatus} />
      )}
    </article>
  );
}
