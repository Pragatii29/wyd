"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { requestToJoin } from "@/app/actions/social";
import { btn } from "@/lib/ui";

const STATUS_LABEL = {
  pending: "Requested",
  accepted: "You're in! Check your chats",
  declined: "Not this time",
};

export function JoinButton({
  threadId,
  status,
  compact,
  preview,
}: {
  threadId: string;
  status: "pending" | "accepted" | "declined" | null;
  compact?: boolean;
  preview?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [optimistic, setOptimistic] = useState(status);
  const size = compact ? "w-auto self-start" : "";

  if (optimistic) {
    return (
      <button disabled className={`${compact ? btn.smallPrimary : btn.primary} ${size} ${optimistic === "accepted" ? "disabled:bg-success/15 disabled:text-success" : ""}`}>
        {optimistic !== "declined" && <Check size={16} />} {STATUS_LABEL[optimistic]}
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <button
        className={`${compact ? btn.smallPrimary : btn.primary} ${size}`}
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError("");
            if (preview) return setOptimistic("pending");
            const res = await requestToJoin(threadId);
            if (res.ok) {
              setOptimistic("pending");
              router.refresh();
            } else setError(res.error);
          })
        }
      >
        {pending && <Loader2 className="animate-spin" size={16} />}
        Ask to join
      </button>
      {error && <p className="font-mono text-meta text-danger">{error}</p>}
    </div>
  );
}
