"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, House, LayoutList, MessageCircle, Plus } from "lucide-react";
import { SewingButton } from "@/components/SewingButton";

// Icon-only bottom bar (Home · My WYDs · Notifications · Chats · Profile) plus a floating "+" to drop a WYD.
export function BottomNav({
  unreadAlerts,
  photo,
  name,
  compose,
  current,
}: {
  unreadAlerts: number;
  photo: string;
  name: string;
  compose?: boolean;
  current?: "/feed" | "/wyds" | "/notifications" | "/chats" | "/profile";
}) {
  const realPath = usePathname();
  const path = current ?? realPath;
  const items = [
    { href: "/feed", label: "Home", icon: House, active: path === "/feed" },
    { href: "/wyds", label: "My WYDs", icon: LayoutList, active: path === "/wyds" },
    { href: "/notifications", label: "Notifications", icon: Bell, active: path === "/notifications", dot: unreadAlerts > 0 },
    { href: "/chats", label: "Chats", icon: MessageCircle, active: path.startsWith("/chats") },
  ];
  const showFab = compose ?? path === "/feed";

  return (
    <>
      {showFab && (
        <Link
          href="/wyd/new"
          aria-label="Drop a WYD"
          className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] right-[max(16px,calc(50%-224px))] z-30 flex size-16 items-center justify-center rounded-full transition duration-fast ease-out hover:-rotate-12 active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {/* A big cocoa sewing button with a cream "+" stitched in the middle. */}
          <SewingButton colour={1} holes={0} size={64} className="absolute inset-0" />
          <Plus size={24} strokeWidth={3} className="relative text-candle" />
        </Link>
      )}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(12px+env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto flex h-16 max-w-[448px] items-center justify-around rounded-pill border border-line bg-sheet/80 px-3 shadow-float backdrop-blur-2xl">
          {items.map(({ href, label, icon: Icon, active, dot }) => (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? "page" : undefined}
              className={`relative flex size-12 items-center justify-center rounded-full transition duration-fast ease-out focus-visible:outline-2 focus-visible:outline-ink ${active ? "text-ink" : "text-ink-2"}`}
            >
              <Icon size={26} strokeWidth={active ? 2.75 : 1.75} fill={active && href === "/feed" ? "currentColor" : "none"} />
              {dot && <span className="absolute right-2.5 top-2.5 size-2.5 rounded-full bg-coral ring-2 ring-sheet" aria-label="Unread" />}
              {active && <span className="absolute bottom-0.5 size-1 rounded-full bg-ink" aria-hidden />}
            </Link>
          ))}
          <Link
            href="/profile"
            aria-label="Profile"
            aria-current={path.startsWith("/profile") ? "page" : undefined}
            className={`relative size-9 overflow-hidden rounded-full bg-sunk focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
              path.startsWith("/profile") ? "ring-2 ring-ink ring-offset-2 ring-offset-sheet" : ""
            }`}
          >
            <Image src={photo} alt={`Your profile, ${name}`} fill sizes="36px" className="object-cover" />
          </Link>
        </div>
      </nav>
    </>
  );
}
