"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { unblockUser } from "@/app/actions/social";
import { btn, meta } from "@/lib/ui";

export function BlockedList({ people }: { people: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (!people.length) return <p className={meta}>Nobody. You can block someone from their profile, plan or a chat.</p>;
  return (
    <ul className="flex flex-col gap-1">
      {people.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-2">
          <span className="text-body">{p.name}</span>
          <button
            className={`${btn.ghost}`}
            disabled={pending}
            onClick={() =>
              start(async () => {
                await unblockUser(p.id);
                router.refresh();
              })
            }
          >
            Unblock
          </button>
        </li>
      ))}
    </ul>
  );
}
