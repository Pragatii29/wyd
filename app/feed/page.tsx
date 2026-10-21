import { redirect } from "next/navigation";
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
    </main>
  );
}
