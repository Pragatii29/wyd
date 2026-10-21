import { LogOut } from "lucide-react";

// Signs out and returns to the welcome page. A plain form POST to /auth/signout,
// so it works even if the page's JavaScript hasn't loaded yet.
export function SignOutButton({ compact }: { compact?: boolean }) {
  return (
    <form action="/auth/signout" method="post" className={compact ? "contents" : "w-full"}>
      <button
        type="submit"
        className={
          compact
            ? "inline-flex min-h-11 items-center gap-1 px-2 text-label text-ink-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"
            : "inline-flex h-13 w-full items-center justify-center gap-2 rounded-pill border border-danger bg-surface text-label text-danger transition duration-fast ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        }
      >
        <LogOut size={16} /> Sign out
      </button>
    </form>
  );
}
