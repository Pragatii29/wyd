"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Inbox, MessageCircle, Plus, UserRound } from "lucide-react";

const TABS = [
  { href: "/feed", label: "Feed", icon: House },
  { href: "/requests", label: "Requests", icon: Inbox },
  { href: "/wyd/new", label: "Drop a WYD", icon: Plus, accent: true },
  { href: "/chats", label: "Chats", icon: MessageCircle },
  { href: "/profile", label: "Profile", icon: UserRound },
];

export function TabBar({ pendingRequests }: { pendingRequests: number }) {
  const path = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-[calc(12px+env(safe-area-inset-bottom))] z-30 mx-auto flex w-[calc(100%-32px)] max-w-[448px] items-center justify-between rounded-pill bg-surface px-2 py-1 shadow-float"
    >
      {TABS.map(({ href, label, icon: Icon, accent }) => {
        const active = path === href || (href !== "/feed" && path.startsWith(href) && href !== "/wyd/new");
        if (accent) {
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="flex size-12 items-center justify-center rounded-full bg-coral text-ink shadow-float transition duration-fast ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <Icon size={24} />
            </Link>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-12 min-w-14 flex-col items-center justify-center gap-0.5 rounded-pill font-mono text-meta transition duration-base ease-out focus-visible:outline-2 focus-visible:outline-ink ${
              active ? "text-ink" : "text-ink-2"
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            {label}
            {href === "/requests" && pendingRequests > 0 && (
              <span className="absolute right-3 top-1 size-2 rounded-full bg-coral" aria-label={`${pendingRequests} new`} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
