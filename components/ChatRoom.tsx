"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowUp, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/app/actions/social";
import { SafetyMenu } from "@/components/SafetyMenu";
import { Avatar } from "@/components/Avatar";
import { seenKey } from "@/components/ChatListItem";
import { meta } from "@/lib/ui";

type Message = { id: string; body: string; sender_id: string; created_at: string };
type Member = { id: string; name: string; photo: string };

function clock(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function ChatRoom({
  chatId,
  me,
  isGroup,
  members,
  blocked,
  initial,
}: {
  chatId: string;
  me: string;
  isGroup: boolean;
  members: Member[];
  blocked: string[];
  initial: Message[];
}) {
  const [messages, setMessages] = useState(initial);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const bottom = useRef<HTMLDivElement>(null);
  const byId = new Map(members.map((m) => [m.id, m]));
  const others = members.filter((m) => m.id !== me);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${chatId}` }, (payload) => {
        const m = payload.new as Message;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
    try {
      localStorage.setItem(seenKey(chatId), new Date().toISOString());
    } catch {}
  }, [messages, chatId]);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    start(async () => {
      setError("");
      const res = await sendMessage(chatId, body);
      if (res.ok) setText("");
      else setError(res.error);
    });
  }

  // Messages from people you've blocked are hidden.
  const visible = messages.filter((m) => !blocked.includes(m.sender_id));

  return (
    <>
      <div className="mt-2 flex flex-wrap items-center gap-2 pb-2">
        {others.map((m) => (
          <span key={m.id} className="flex shrink-0 items-center gap-1 rounded-pill bg-surface py-1 pl-1 pr-1 shadow-card">
            <Link href={`/profile/${m.id}`} className="flex items-center gap-2 pr-1">
              <Avatar src={m.photo} name={m.name} size={32} />
              <span className="text-label">{m.name.split(" ")[0]}</span>
            </Link>
            <SafetyMenu target={{ type: "profile", id: m.id }} userId={m.id} userName={m.name.split(" ")[0]} afterBlock="/chats" />
          </span>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto py-2" aria-live="polite">
        {visible.length === 0 && (
          <p className={`${meta} mt-8 text-center`}>Say hi, then agree on a public place and time together.</p>
        )}
        <ul className="flex flex-col gap-2">
          {visible.map((m, i) => {
            const mine = m.sender_id === me;
            const showName = isGroup && !mine && visible[i - 1]?.sender_id !== m.sender_id;
            return (
              <li key={m.id} className={`group flex flex-col ${mine ? "items-end" : "items-start"}`}>
                {showName && <span className={`${meta} mb-1 px-2`}>{byId.get(m.sender_id)?.name.split(" ")[0] ?? "Someone"}</span>}
                <div className={`flex items-end gap-1 ${mine ? "flex-row-reverse" : ""}`}>
                  <p
                    className={`max-w-[78vw] whitespace-pre-wrap break-words rounded-[20px] px-3.5 py-2.5 text-body sm:max-w-[360px] ${
                      mine ? "bg-ink text-on-ink" : "bg-surface text-ink shadow-card"
                    }`}
                  >
                    {m.body}
                  </p>
                  {!mine && <SafetyMenu target={{ type: "message", id: m.id }} />}
                </div>
                <time className={`${meta} mt-0.5 px-2`} dateTime={m.created_at}>
                  {clock(m.created_at)}
                </time>
              </li>
            );
          })}
        </ul>
        <div ref={bottom} />
      </div>

      <form onSubmit={send} className="flex items-end gap-2 pb-2 pt-2">
        <label htmlFor="message" className="sr-only">
          Message
        </label>
        <textarea
          id="message"
          rows={1}
          maxLength={1000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(e);
            }
          }}
          placeholder="Message"
          className="min-h-12 flex-1 resize-none rounded-[24px] border border-line bg-surface px-4 py-3 text-body text-ink placeholder:text-ink-3 focus:border-2 focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          aria-label="Send"
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-ink text-on-ink transition duration-fast ease-out active:scale-[0.97] disabled:bg-sunk disabled:shadow-none disabled:text-ink-3"
        >
          {pending ? <Loader2 size={20} className="animate-spin" /> : <ArrowUp size={20} />}
        </button>
      </form>
      {error && <p className="pb-2 font-mono text-meta text-danger">{error}</p>}
    </>
  );
}
