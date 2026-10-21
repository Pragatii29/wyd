"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { requestToJoin } from "@/app/actions/social";
import { btn } from "@/lib/ui";

const STATUS_LABEL = {
  pending: "Requested",
  accepted: "You're in! Watch your chats",
  declined: "Not this time",
};

export function JoinButton({ threadId, status }: { threadId: string; status: "pending" | "accepted" | "declined" | null }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [optimistic, setOptimistic] = useState(status);

  if (optimistic) {
    return (
      <button disabled className={`${btn.primary} ${optimistic === "accepted" ? "disabled:bg-success/15 disabled:text-success" : ""}`}>
        {optimistic !== "declined" && <Check size={18} />} {STATUS_LABEL[optimistic]}
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <button
        className={btn.primary}
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError("");
            const res = await requestToJoin(threadId);
            if (res.ok) {
              setOptimistic("pending");
              router.refresh();
            } else setError(res.error);
          })
        }
      >
        {pending && <Loader2 className="animate-spin" size={18} />}
        Ask to join
      </button>
      {error && <p className="font-mono text-meta text-danger">{error}</p>}
    </div>
  );
}
