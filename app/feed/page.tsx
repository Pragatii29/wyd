import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getSession, homeFor } from "@/lib/profile";
import { SignOutButton } from "@/components/SignOutButton";

// Placeholder until step 4 builds the feed.
export default async function FeedPage() {
  const { user, profile } = await getSession();
  if (!user) redirect("/");
  if (homeFor(profile) !== "/feed") redirect(homeFor(profile));

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-between px-4 pb-10 pt-16">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-title">You&apos;re verified, {profile!.name.split(" ")[0]}</h1>
        <p className="text-body text-ink-2">No plans nearby yet. Be the first — drop a WYD.</p>
      </div>
      <SignOutButton />
      <Link
        href="/wyd/new"
        className="fixed bottom-[calc(24px+env(safe-area-inset-bottom))] right-4 inline-flex h-14 items-center gap-2 rounded-pill bg-coral px-6 text-label text-ink shadow-float transition duration-fast ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <Plus size={20} /> Drop a WYD
      </Link>
    </main>
  );
}
