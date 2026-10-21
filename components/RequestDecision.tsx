"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle } from "lucide-react";
import { answerRequest, startChat } from "@/app/actions/social";
import { btn } from "@/lib/ui";

// Floating Pass / Accept for one request. Accepting asks the poster to confirm before a chat opens.
export function RequestDecision({
  requestId,
  threadId,
  requesterId,
  firstName,
  planText,
  status: initialStatus,
  chatId,
}: {
  requestId: string;
  threadId: string;
  requesterId: string;
  firstName: string;
  planText: string;
  status: "pending" | "accepted" | "declined";
  chatId: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function decide(next: "accepted" | "declined") {
    start(async () => {
      setError("");
      const res = await answerRequest(requestId, next);
      if (!res.ok) return setError(res.error);
      setStatus(next);
      if (next === "accepted") setConfirming(true);
      else {
        router.push("/feed?tab=requests");
        router.refresh();
      }
    });
  }

  function openChat() {
    start(async () => {
      setError("");
      const res = await startChat(threadId, [requesterId]);
      if (!res.ok) return setError(res.error);
      router.push(`/chats/${res.chatId}`);
    });
  }

  return (
    <>
      {confirming && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-night/40" onClick={() => setConfirming(false)}>
          <div
            role="dialog"
            aria-label="Start a chat"
            onClick={(e) => e.stopPropagation()}
            className="animate-toast-in w-full max-w-[480px] rounded-t-sheet bg-canvas p-6 pb-[calc(24px+env(safe-area-inset-bottom))] shadow-float"
          >
            <h2 className="text-h2">You accepted {firstName}!</h2>
            <p className="mt-2 text-body text-ink-2">
              Start a chat to fix the time and place for “{planText}”. Only you and {firstName} can read it.
            </p>
            <div className="mt-6 flex gap-2">
              <button className={btn.secondary} onClick={() => setConfirming(false)}>
                Not now
              </button>
              <button className={btn.primary} disabled={pending} onClick={openChat}>
                {pending && <Loader2 size={16} className="animate-spin" />} Start chat
              </button>
            </div>
            {error && <p className="mt-2 font-mono text-meta text-danger">{error}</p>}
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 flex justify-center px-4">
        {status === "pending" ? (
          <div className="flex gap-2 rounded-pill bg-surface/90 p-1.5 shadow-float backdrop-blur">
            <button
              disabled={pending}
              onClick={() => decide("declined")}
              className="h-14 rounded-pill bg-ink px-8 text-wyd text-bone transition duration-fast ease-out active:scale-[0.97] disabled:opacity-60"
            >
              Pass
            </button>
            <button
              disabled={pending}
              onClick={() => decide("accepted")}
              className="flex h-14 items-center gap-2 rounded-pill bg-coral px-8 text-wyd text-ink transition duration-fast ease-out active:scale-[0.97] disabled:opacity-60"
            >
              {pending && <Loader2 size={18} className="animate-spin" />} Accept
            </button>
          </div>
        ) : status === "accepted" ? (
          chatId ? (
            <Link href={`/chats/${chatId}`} className={`${btn.primary} max-w-xs shadow-float`}>
              <MessageCircle size={18} /> Open chat with {firstName}
            </Link>
          ) : (
            <button onClick={() => setConfirming(true)} className={`${btn.primary} max-w-xs shadow-float`}>
              <MessageCircle size={18} /> Start chat with {firstName}
            </button>
          )
        ) : (
          <p className="rounded-pill bg-surface px-5 py-3 text-label text-ink-2 shadow-float">You passed on this request</p>
        )}
      </div>
      {error && !confirming && <p className="px-4 pt-2 font-mono text-meta text-danger">{error}</p>}
    </>
  );
}
