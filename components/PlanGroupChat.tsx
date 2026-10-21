"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Users } from "lucide-react";
import { groupChatForPlan } from "@/app/actions/social";
import { btn } from "@/lib/ui";

// One button that turns a plan's requests into its group chat:
// accepts everyone still waiting (if any), then creates the group or adds the newcomers to it.
export function PlanGroupChat({
  threadId,
  waiting,
  accepted,
  group,
  className = btn.primary,
}: {
  threadId: string;
  waiting: number;
  // Requester ids already accepted.
  accepted: string[];
  group?: { id: string; members: string[] } | null;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const missing = accepted.filter((id) => !group?.members.includes(id)).length;
  const toAdd = waiting + missing;
  if (waiting + accepted.length === 0) return null;

  // Everyone's already in: just open it.
  if (group && toAdd === 0) {
    return (
      <Link href={`/chats/${group.id}`} className={className}>
        <Users size={18} /> Open group chat ({group.members.length})
      </Link>
    );
  }

  const label =
    waiting > 0
      ? `Accept ${waiting === 1 ? "" : "all "}${waiting} + group chat`
      : group
        ? `Add ${missing} to the group chat`
        : `Group chat with ${accepted.length === 1 ? "them" : `all ${accepted.length}`}`;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <button
        type="button"
        className={className}
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError("");
            const res = await groupChatForPlan(threadId, { acceptAll: waiting > 0 });
            if (!res.ok) return setError(res.error);
            router.push(`/chats/${res.chatId}`);
          })
        }
      >
        {pending ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} />} {label}
      </button>
      {error && <p className="font-mono text-meta text-danger">{error}</p>}
    </div>
  );
}
