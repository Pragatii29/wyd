import Link from "next/link";
import { BadgeCheck, ChevronRight, Inbox } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { JoinButton } from "@/components/JoinButton";
import { displayName } from "@/lib/profile";
import { AUDIENCES, type Audience } from "@/lib/audience";
import { timeShort } from "@/lib/ui";

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

// A WYD as a flat post row: who · when, the plan in large type, one quiet mono line of context, then the action.
export function WydCard({
  wyd,
  shared,
  mine,
  requestStatus,
  requestCount,
  linkBody = true,
  preview,
}: {
  wyd: FeedWyd;
  shared: string[];
  mine: boolean;
  requestStatus: "pending" | "accepted" | "declined" | null;
  requestCount: number;
  linkBody?: boolean;
  preview?: boolean;
}) {
  const audience = AUDIENCES.find((a) => a.value === wyd.audience)!;
  const AudienceIcon = audience.icon;
  const body = <p className={`${linkBody ? "line-clamp-5" : ""} text-wyd text-ink`}>{wyd.body}</p>;

  return (
    <article className="flex gap-3 border-b border-line px-5 py-5 transition duration-base ease-out hover:bg-surface">
      <Link href={mine ? "/profile" : `/profile/${wyd.author.id}`} className="shrink-0 self-start rounded-full focus-visible:outline-2 focus-visible:outline-ink">
        <Avatar src={wyd.author.photo_url} name={wyd.author.name} size={48} />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-label text-ink">{mine ? "You" : displayName(wyd.author)}</span>
          <BadgeCheck size={15} className="shrink-0 text-success" aria-label="Verified" />
          <time dateTime={wyd.created_at} className="shrink-0 font-mono text-meta text-ink-3">
            · {timeShort(wyd.created_at)}
          </time>
          {shared.length > 0 && !mine && (
            <span className="ml-auto shrink-0 rounded-pill bg-candle px-2.5 py-0.5 font-mono text-meta text-on-light">for you</span>
          )}
        </div>

        <div className="mt-1.5">
          {linkBody ? (
            <Link href={`/wyd/${wyd.id}`} className="rounded-sm focus-visible:outline-2 focus-visible:outline-ink">
              {body}
            </Link>
          ) : (
            body
          )}
        </div>

        <p className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-meta text-ink-2">
          <span>{wyd.area || wyd.city}</span>
          <span aria-hidden>·</span>
          <span className={`inline-flex items-center gap-1 ${wyd.audience !== "all" ? "text-ink" : ""}`}>
            <AudienceIcon size={12} aria-hidden /> {audience.label.toLowerCase()}
          </span>
          {wyd.tags.slice(0, 2).map((t) => (
            <span key={t} className={shared.includes(t) ? "text-ink" : ""}>
              #{t.replace(/_/g, "")}
            </span>
          ))}
        </p>

        <div className="mt-3">
          {mine ? (
            <Link href={`/wyds#wyd-${wyd.id}`} className="inline-flex h-10 items-center gap-1.5 text-label text-ink transition duration-fast ease-press active:scale-[0.97]">
              <Inbox size={16} /> {requestCount === 0 ? "No requests yet" : `${requestCount} request${requestCount > 1 ? "s" : ""}`}
              {requestCount > 0 && <ChevronRight size={16} className="text-ink-3" />}
            </Link>
          ) : (
            <JoinButton threadId={wyd.id} status={requestStatus} compact preview={preview} />
          )}
        </div>
      </div>
    </article>
  );
}
