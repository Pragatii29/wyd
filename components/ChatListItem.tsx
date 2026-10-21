"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { meta, timeAgo } from "@/lib/ui";

// Unread = newest message from someone else is newer than when this device last opened the chat.
export function seenKey(chatId: string) {
  return `wyd:seen:${chatId}`;
}

function readSeen(chatId: string) {
  try {
    return localStorage.getItem(seenKey(chatId)) ?? "";
  } catch {
    return "";
  }
}

export function ChatListItem(c: {
  id: string;
  isGroup: boolean;
  title: string;
  people: string;
  photo: string | null;
  lastText: string;
  lastAt: string;
  lastFromOther: boolean;
}) {
  const seen = useSyncExternalStore(() => () => {}, () => readSeen(c.id), () => c.lastAt);
  const unread = c.lastFromOther && seen < c.lastAt;
  return (
    <Link href={`/chats/${c.id}`} className="flex items-center gap-3 rounded-card bg-surface p-4 shadow-card focus-visible:outline-2 focus-visible:outline-ink">
      {c.isGroup ? (
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-candle text-ink">
          <Users size={22} />
        </span>
      ) : (
        <Avatar src={c.photo} name={c.people || "?"} size={48} />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-label">{c.title}</span>
        <span className={`${meta} block truncate`}>{c.people || "Just you so far"}</span>
        <span className={`block truncate text-body ${unread ? "text-ink" : "text-ink-2"}`}>{c.lastText}</span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-2">
        <span className={meta}>{timeAgo(c.lastAt)}</span>
        {unread && <span className="size-2.5 rounded-full bg-coral" aria-label="Unread" />}
      </span>
    </Link>
  );
}
