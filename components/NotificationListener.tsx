"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Toast = { threadId: string; title: string; body: string };

// Subscribes to this user's new notification rows (Supabase Realtime) and shows an in-app toast.
// Closed-app delivery is handled by Web Push in public/sw.js.
export function NotificationListener({ userId }: { userId: string }) {
  const router = useRouter();
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as { thread_id: string; title: string; body: string };
          setToast({ threadId: n.thread_id, title: n.title, body: n.body });
          router.refresh();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  return (
    <div className="fixed inset-x-0 top-[calc(12px+env(safe-area-inset-top))] z-50 mx-auto w-[calc(100%-32px)] max-w-[448px]" role="status">
      <button
        onClick={() => {
          setToast(null);
          router.push(`/wyd/${toast.threadId}`);
        }}
        className="animate-toast-in flex w-full items-center gap-3 rounded-pill bg-night px-4 py-3 text-left text-bone shadow-float focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <span className="size-2 shrink-0 rounded-full bg-candle" aria-hidden />
        <span className="min-w-0">
          <span className="block text-label">{toast.title}</span>
          <span className="block truncate text-body">{toast.body}</span>
        </span>
      </button>
    </div>
  );
}
