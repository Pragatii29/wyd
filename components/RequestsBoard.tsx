"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2, MessageCircle, Users, X } from "lucide-react";
import { answerRequest, startChat } from "@/app/actions/social";
import { Avatar } from "@/components/Avatar";
import { InterestChip } from "@/components/InterestChip";
import { btn, card, meta, timeAgo } from "@/lib/ui";

type Requester = {
  id: string;
  name: string;
  dob: string;
  gender: "female" | "male";
  photo_url: string;
  area: string;
  city: string;
  interests: string[];
  social_url: string;
  bio: string | null;
};

export type BoardWyd = {
  id: string;
  body: string;
  status: string;
  created_at: string;
  chats: { id: string; is_group: boolean; members: string[] }[];
  requests: { id: string; status: "pending" | "accepted" | "declined"; created_at: string; requester: Requester; shared: string[] }[];
};

function age(dob: string) {
  const d = new Date(dob);
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  if (now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate())) a--;
  return a;
}

const short = (r: Requester) => `${r.name.split(" ")[0]}, ${age(r.dob)}${r.gender === "female" ? "F" : "M"}`;

// Requests grouped by WYD. The poster accepts/declines, then picks accepted people for a 1:1 or group chat.
export function RequestsBoard({ wyds }: { wyds: BoardWyd[] }) {
  return (
    <ul className="mt-6 flex flex-col gap-6">
      {wyds.map((w) => (
        <WydGroup key={w.id} wyd={w} />
      ))}
    </ul>
  );
}

function WydGroup({ wyd }: { wyd: BoardWyd }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const accepted = wyd.requests.filter((r) => r.status === "accepted");
  const waiting = wyd.requests.filter((r) => r.status === "pending").length;

  function answer(id: string, status: "accepted" | "declined") {
    start(async () => {
      setError("");
      const res = await answerRequest(id, status);
      if (!res.ok) setError(res.error);
      router.refresh();
    });
  }

  function openChat() {
    start(async () => {
      setError("");
      const res = await startChat(wyd.id, picked);
      if (!res.ok) return setError(res.error);
      router.push(`/chats/${res.chatId}`);
    });
  }

  const pickedPeople = accepted.filter((r) => picked.includes(r.requester.id));

  return (
    <li id={`wyd-${wyd.id}`} className="scroll-mt-6">
      <Link href={`/wyd/${wyd.id}`} className="block rounded-card border border-line bg-surface p-4">
        <span className="line-clamp-2 font-display text-h2">{wyd.body}</span>
        <span className="mt-1 block font-mono text-meta text-ink-2">
          {timeAgo(wyd.created_at)} · {wyd.requests.length} request{wyd.requests.length === 1 ? "" : "s"}
          {waiting > 0 && ` · ${waiting} waiting`}
          {wyd.status !== "live" && ` · ${wyd.status}`}
        </span>
      </Link>

      {wyd.requests.length === 0 ? (
        <p className={`${meta} mt-3 px-1`}>No requests yet. We notified people in your city who might like it.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {wyd.requests.map((r) => {
            const isOpen = open === r.id;
            const isPicked = picked.includes(r.requester.id);
            return (
              <li key={r.id} className={`${card} flex flex-col gap-3`}>
                <div className="flex items-center gap-3">
                  {r.status === "accepted" && (
                    <input
                      type="checkbox"
                      aria-label={`Select ${r.requester.name} for a chat`}
                      checked={isPicked}
                      onChange={() => setPicked((p) => (isPicked ? p.filter((x) => x !== r.requester.id) : [...p, r.requester.id]))}
                      className="size-5 accent-ink"
                    />
                  )}
                  <button onClick={() => setOpen(isOpen ? null : r.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={isOpen}>
                    <Avatar src={r.requester.photo_url} name={r.requester.name} size={48} />
                    <span className="min-w-0">
                      <span className="block text-label">{short(r.requester)}</span>
                      <span className={`${meta} block truncate`}>
                        {r.shared.length ? `Both into ${r.shared.slice(0, 2).join(", ").replace(/_/g, " ")}` : r.requester.area || r.requester.city} ·{" "}
                        {timeAgo(r.created_at)}
                      </span>
                    </span>
                  </button>
                  {r.status === "accepted" && <span className="rounded-pill bg-success/15 px-3 py-1 text-label text-success">Accepted</span>}
                  {r.status === "declined" && <span className="rounded-pill bg-sunk px-3 py-1 text-label text-ink-2">Declined</span>}
                </div>

                {isOpen && (
                  <div className="animate-fade-in flex flex-col gap-3">
                    {r.requester.bio && <p className="line-clamp-4 text-body text-ink-2">{r.requester.bio}</p>}
                    <div className="flex flex-wrap gap-2">
                      {r.requester.interests.slice(0, 8).map((t) => (
                        <InterestChip key={t} tag={t} highlight={r.shared.includes(t)} />
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <Link href={`/profile/${r.requester.id}`} className={`${btn.ghost} px-0`}>
                        View profile
                      </Link>
                      <a href={r.requester.social_url} target="_blank" rel="noreferrer noopener" className={`${btn.ghost} px-0`}>
                        <ExternalLink size={14} /> Social
                      </a>
                    </div>
                  </div>
                )}

                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button className={btn.secondary} disabled={pending} onClick={() => answer(r.id, "declined")}>
                      <X size={16} /> Decline
                    </button>
                    <button className={btn.primary} disabled={pending} onClick={() => answer(r.id, "accepted")}>
                      <Check size={16} /> Accept
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {accepted.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {!confirming ? (
            <button className={btn.primary} disabled={picked.length === 0 || pending} onClick={() => setConfirming(true)}>
              {picked.length > 1 ? <Users size={18} /> : <MessageCircle size={18} />}
              {picked.length === 0
                ? "Tick accepted people to start a chat"
                : picked.length === 1
                  ? "Start a 1:1 chat"
                  : `Start a group chat with ${picked.length}`}
            </button>
          ) : (
            <div className="animate-fade-in flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
              <p className="text-body">
                Start a {picked.length > 1 ? "group" : "1:1"} chat with{" "}
                <strong>{pickedPeople.map((r) => r.requester.name.split(" ")[0]).join(", ")}</strong> about this plan? Only you and them can read it.
              </p>
              <div className="flex gap-2">
                <button className={btn.secondary} onClick={() => setConfirming(false)}>
                  Cancel
                </button>
                <button className={btn.primary} disabled={pending} onClick={openChat}>
                  {pending && <Loader2 size={16} className="animate-spin" />} Open chat
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {wyd.chats.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {wyd.chats.map((c) => (
            <Link key={c.id} href={`/chats/${c.id}`} className={`${btn.ghost} justify-start`}>
              <MessageCircle size={16} /> {c.is_group ? `Group chat (${c.members.length})` : "1:1 chat"}
            </Link>
          ))}
        </div>
      )}
      {error && <p className="mt-2 font-mono text-meta text-danger">{error}</p>}
    </li>
  );
}
