"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Flag, MoreHorizontal } from "lucide-react";
import { blockUser, report } from "@/app/actions/social";
import { btn, input, meta } from "@/lib/ui";

// Report a WYD, profile or message, and/or block the person behind it.
export function SafetyMenu({
  target,
  userId,
  userName,
  afterBlock = "/feed",
}: {
  target?: { type: "profile" | "thread" | "message"; id: string };
  userId?: string;
  userName?: string;
  afterBlock?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState<"menu" | "report" | "block" | null>(null);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const noun = target?.type === "thread" ? "WYD" : target?.type ?? "profile";

  if (done) return <p className="font-mono text-meta text-success">{done}</p>;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(open ? null : "menu")}
        aria-label="Safety options"
        aria-expanded={!!open}
        className="inline-flex size-11 items-center justify-center rounded-full text-ink-2 focus-visible:outline-2 focus-visible:outline-ink"
      >
        <MoreHorizontal size={20} />
      </button>
      {open && (
        <div className="animate-fade-in absolute right-0 top-12 z-20 flex w-72 flex-col gap-2 rounded-card bg-surface p-3 shadow-float">
          {open === "menu" && (
            <>
              {target && (
                <button onClick={() => setOpen("report")} className={`${btn.small} justify-start border-0 text-danger`}>
                  <Flag size={16} /> Report this {noun}
                </button>
              )}
              {userId && (
                <button onClick={() => setOpen("block")} className={`${btn.small} justify-start border-0 text-danger`}>
                  <Ban size={16} /> Block {userName ?? "this person"}
                </button>
              )}
            </>
          )}
          {open === "report" && target && (
            <>
              <label htmlFor="report-reason" className="text-label">
                What&apos;s wrong?
              </label>
              <textarea id="report-reason" rows={3} className={`${input} h-auto py-2`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional details for our team" />
              <button
                className={btn.danger}
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await report({ target_type: target.type, target_id: target.id, reason });
                    if (res.ok) setDone("Thanks. Our team will take a look.");
                    else setError(res.error);
                  })
                }
              >
                Send report
              </button>
            </>
          )}
          {open === "block" && userId && (
            <>
              <p className="text-body">
                Block {userName ?? "this person"}? You won&apos;t see each other&apos;s plans, requests or messages. They aren&apos;t told.
              </p>
              <button
                className={btn.danger}
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await blockUser(userId);
                    if (res.ok) {
                      setDone("Blocked.");
                      router.push(afterBlock);
                      router.refresh();
                    } else setError(res.error);
                  })
                }
              >
                Block
              </button>
            </>
          )}
          {error && <p className={`${meta} text-danger`}>{error}</p>}
        </div>
      )}
    </div>
  );
}
