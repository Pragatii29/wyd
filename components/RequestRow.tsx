import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { ageOn } from "@/lib/time";
import { timeAgo } from "@/lib/ui";

export type IncomingRequest = {
  id: string;
  status: "pending" | "accepted" | "declined";
  created_at: string;
  thread: { body: string };
  requester: { name: string; dob: string; gender: "female" | "male"; photo_url: string };
};

// One row in the Requests tab: who wants to join which plan, with a dot while it's waiting.
export function RequestRow({ r, href }: { r: IncomingRequest; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 border-b border-line px-4 py-4 transition duration-base ease-out hover:bg-surface">
      <Avatar src={r.requester.photo_url} name={r.requester.name} size={48} />
      <span className="min-w-0 flex-1">
        <span className="block text-body">
          <span className="text-label">
            {r.requester.name.split(" ")[0]}, {ageOn(r.requester.dob)}
            {r.requester.gender === "female" ? "F" : "M"}
          </span>{" "}
          wants to join
        </span>
        <span className="block truncate text-body text-ink-2">“{r.thread.body}”</span>
        <span className="font-mono text-meta text-ink-2">{timeAgo(r.created_at)}</span>
      </span>
      {r.status === "pending" ? (
        <span className="size-2.5 shrink-0 rounded-full bg-coral" aria-label="New" />
      ) : (
        <span className={`shrink-0 rounded-pill px-2.5 py-0.5 text-label ${r.status === "accepted" ? "bg-success/15 text-success" : "bg-sunk text-ink-2"}`}>
          {r.status === "accepted" ? "Accepted" : "Passed"}
        </span>
      )}
      <ChevronRight size={18} className="shrink-0 text-ink-3" aria-hidden />
    </Link>
  );
}
