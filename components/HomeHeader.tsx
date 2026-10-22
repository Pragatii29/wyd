import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { RefreshButton } from "@/components/RefreshButton";
import { ThemeIconButton } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

// Sticky home header: your photo, the wordmark, refresh, then the For you / Requests tabs.
export function HomeHeader({
  photo,
  name,
  onRequests,
  waiting,
  base = "/feed",
}: {
  photo: string;
  name: string;
  onRequests: boolean;
  waiting: number;
  base?: string;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/75 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-5">
        <Link href="/profile" aria-label="Your profile" className="rounded-full focus-visible:outline-2 focus-visible:outline-ink">
          <Avatar src={photo} name={name} size={40} />
        </Link>
        <Link href="/feed" aria-label="WYD? home" className="text-ink">
          <Logo className="h-7 w-auto" spark />
        </Link>
        <div className="flex items-center">
          <ThemeIconButton />
          <RefreshButton />
        </div>
      </div>
      <nav className="grid grid-cols-2" aria-label="Home tabs">
        {[
          { href: base, label: "For you", active: !onRequests },
          { href: `${base}?tab=requests`, label: "Requests", active: onRequests, count: waiting },
        ].map((t) => (
          <Link
            key={t.label}
            href={t.href}
            aria-current={t.active ? "page" : undefined}
            className={`relative flex h-12 items-center justify-center gap-2 text-label transition duration-base ease-out ${t.active ? "text-ink" : "text-ink-2"}`}
          >
            {t.label}
            {!!t.count && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-pill bg-coral px-1.5 font-mono text-meta text-on-coral">{t.count}</span>
            )}
            {t.active && <span className="absolute bottom-0 h-1 w-16 rounded-pill bg-coral" aria-hidden />}
          </Link>
        ))}
      </nav>
    </header>
  );
}
