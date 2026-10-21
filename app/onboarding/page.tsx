import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/profile";
import { OnboardingForm } from "@/components/OnboardingForm";

export default async function OnboardingPage() {
  const { user, profile } = await getSession();
  if (!user) redirect("/");
  if (profile) redirect(homeFor(profile));

  return (
    <main className="mx-auto max-w-[480px] px-4 pb-16 pt-10">
      <h1 className="font-display text-title">Let&apos;s set up your profile</h1>
      <p className="mt-2 text-body text-ink-2">
        Real people only. We check every profile before you can post or join plans.
      </p>
      <OnboardingForm userId={user.id} />
    </main>
  );
}
