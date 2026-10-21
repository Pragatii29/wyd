"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MessageCircle, Users } from "lucide-react";
import { answerRequest, groupChatForPlan, startChat } from "@/app/actions/social";
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
  group = null,
  othersAccepted = 0,
  preview,
}: {
  requestId: string;
  threadId: string;
  requesterId: string;
  firstName: string;
  planText: string;
  status: "pending" | "accepted" | "declined";
  chatId: string | null;
  // This plan's group chat, if the poster has made one.
  group?: { id: string; members: string[] } | null;
  // How many other people are already accepted for this plan.
  othersAccepted?: number;
  preview?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function decide(next: "accepted" | "declined") {
    start(async () => {
      setError("");
      const res = preview ? { ok: true as const } : await answerRequest(requestId, next);
      if (!res.ok) return setError(res.error);
      setStatus(next);
      if (next === "accepted") setConfirming(true);
      else {
        router.push(preview ? "/preview?screen=requests" : "/feed?tab=requests");
        router.refresh();
      }
    });
  }

  const inGroup = !!group?.members.includes(requesterId);
  // A group makes sense once someone else is accepted too, or one already exists.
  const canGroup = othersAccepted > 0 || !!group;
  const groupLabel = inGroup ? "Open the group chat" : group ? `Add ${firstName} to the group chat` : `Group chat with all ${othersAccepted + 1} accepted`;

  function openGroup() {
    start(async () => {
      setError("");
      if (preview) return router.push("/preview?screen=chat");
      if (inGroup) return router.push(`/chats/${group!.id}`);
      const res = await groupChatForPlan(threadId);
      if (!res.ok) return setError(res.error);
      router.push(`/chats/${res.chatId}`);
    });
  }

  function openChat() {
    start(async () => {
      setError("");
      if (preview) return router.push("/preview?screen=chat");
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
              {canGroup
                ? `Chat with ${firstName} alone, or bring everyone you've accepted for “${planText}” into one group chat.`
                : `Start a chat to fix the time and place for “${planText}”. Only you and ${firstName} can read it.`}
            </p>
            <div className="mt-6 flex flex-col gap-2">
              {canGroup && (
                <button className={btn.primary} disabled={pending} onClick={openGroup}>
                  {pending ? <Loader2 size={16} className="animate-spin" /> : <Users size={18} />} {groupLabel}
                </button>
              )}
              <button className={canGroup ? btn.secondary : btn.primary} disabled={pending} onClick={chatId ? () => router.push(`/chats/${chatId}`) : openChat}>
                {pending && !canGroup ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={18} />}{" "}
                {chatId ? `Open 1:1 chat with ${firstName}` : canGroup ? `1:1 chat with ${firstName}` : "Start chat"}
              </button>
              <button className={btn.ghost} onClick={() => setConfirming(false)}>
                Not now
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
              className="h-14 rounded-pill bg-ink px-8 text-wyd text-on-ink transition duration-fast ease-out active:scale-[0.97] disabled:opacity-60"
            >
              Pass
            </button>
            <button
              disabled={pending}
              onClick={() => decide("accepted")}
              className="flex h-14 items-center gap-2 rounded-pill bg-coral px-8 text-wyd text-on-coral transition duration-fast ease-out active:scale-[0.97] disabled:opacity-60"
            >
              {pending && <Loader2 size={18} className="animate-spin" />} Accept
            </button>
          </div>
        ) : status === "accepted" && canGroup ? (
          <button onClick={() => setConfirming(true)} className={`${btn.primary} max-w-xs shadow-float`}>
            <MessageCircle size={18} /> Chat with {firstName}
          </button>
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
