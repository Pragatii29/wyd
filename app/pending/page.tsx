import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/profile";
import { NotificationOptIn } from "@/components/NotificationOptIn";
import { SignOutButton } from "@/components/SignOutButton";

export default async function PendingPage() {
  const { user, profile } = await getSession();
  if (!user) redirect("/");
  if (homeFor(profile) !== "/pending") redirect(homeFor(profile));

  const blocked = profile!.status === "rejected" || profile!.status === "suspended";

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-between px-4 pb-10 pt-16">
      <div className="flex flex-col gap-3">
        <h1 className="font-display text-title">
          {blocked ? "We couldn't verify your profile" : "We're checking your profile"}
        </h1>
        <p className="text-body text-ink-2">
          {blocked
            ? "Sorry, your profile didn't pass our checks, so you can't use WYD? right now."
            : `Thanks, ${profile!.name.split(" ")[0]}. A real person reviews every profile to keep WYD? safe. This usually takes a few minutes. Refresh this page to check.`}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {!blocked && <NotificationOptIn />}
        <SignOutButton />
      </div>
    </main>
  );
}
