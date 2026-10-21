"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteWyd } from "@/app/actions/wyd";
import { btn } from "@/lib/ui";

export function DeleteWydButton({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col gap-1">
      <button
        className={btn.danger}
        disabled={pending}
        onClick={() => {
          if (!confirming) return setConfirming(true);
          start(async () => {
            const res = await deleteWyd(threadId);
            if (res.ok) {
              router.push("/feed");
              router.refresh();
            } else setError(res.error.includes("foreign key") ? "This WYD has a chat, so it can't be deleted." : res.error);
          });
        }}
      >
        <Trash2 size={16} /> {confirming ? "Tap again to delete" : "Delete this WYD"}
      </button>
      {error && <p className="font-mono text-meta text-danger">{error}</p>}
    </div>
  );
}
