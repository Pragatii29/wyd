import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, ShieldX } from "lucide-react";
import { getSession, homeFor } from "@/lib/profile";
import { PushToggle } from "@/components/PushToggle";
import { ProfileCard } from "@/components/ProfileCard";
import { SignOutButton } from "@/components/SignOutButton";
import { btn, page } from "@/lib/ui";
import { Logo } from "@/components/Logo";

export default async function PendingPage() {
  const { user, profile } = await getSession();
  if (!user) redirect("/");
  if (homeFor(profile) !== "/pending") redirect(homeFor(profile));
  const p = profile!;

  const rejected = p.status === "rejected";
  const suspended = p.status === "suspended";

  return (
    <main className={`${page} flex min-h-dvh flex-col pb-10 pt-8`}>
      <Logo className="mb-10 h-7 w-auto text-ink" spark />
      <div className="flex flex-col gap-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-sunk text-ink">
          {rejected || suspended ? <ShieldX size={24} /> : <Clock size={24} />}
        </span>
        <h1 className="font-display text-title">
          {suspended ? "Your account is paused" : rejected ? "We couldn't verify your profile" : "We're checking your profile"}
        </h1>
        {rejected || suspended ? (
          <>
            {p.rejection_reason && (
              <p className="rounded-card bg-surface p-4 text-body text-ink shadow-card">{p.rejection_reason}</p>
            )}
            <p className="text-body text-ink-2">
              {rejected
                ? "You can fix your details and send them again. A person will take another look."
                : "Reach out to the WYD? team if you think this is a mistake."}
            </p>
            {rejected && (
              <Link href="/onboarding" className={btn.primary}>
                Edit and resubmit
              </Link>
            )}
          </>
        ) : (
          <>
            <p className="text-body text-ink-2">
              Thanks, {p.name.split(" ")[0]}. A real person on our team looks at your photo and details to keep WYD? friendly.
              Until then you can&apos;t see plans, post or chat. Refresh this page to check.
            </p>
            <p className="font-mono text-meta text-ink-2">
              Manual checks reduce fake profiles but can&apos;t guarantee anyone&apos;s identity. Meet in public places.
            </p>
          </>
        )}
      </div>
      {!rejected && !suspended && (
        <div className="mt-10 flex flex-col gap-3">
          <h2 className="text-h2">Your profile</h2>
          <p className="font-mono text-meta text-ink-2">This is how verified people will see you once you&apos;re approved.</p>
          <ProfileCard profile={p} />
        </div>
      )}
      <div className="flex flex-col gap-4 pt-10">
        {!rejected && !suspended && <PushToggle />}
        <SignOutButton />
      </div>
    </main>
  );
}
