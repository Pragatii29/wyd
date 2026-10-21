import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/profile";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeIconButton } from "@/components/ThemeToggle";
import { page } from "@/lib/ui";

// Sign-up in three steps: basics (name, phone, LinkedIn) → about + JPG photo → create profile.
// Also used to fix and resubmit a rejected profile.
export default async function OnboardingPage() {
  const { supabase, user, profile } = await getSession();
  if (!user) redirect("/");
  if (profile && profile.status !== "rejected") redirect(homeFor(profile));

  const { data: priv } = profile
    ? await supabase.from("profile_private").select("phone").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <main className={`${page} pb-16 pt-4`}>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-meta text-ink-2">{user.email ? `Signed in as ${user.email}` : "Test account on this device"}</span>
        <div className="flex items-center">
          <ThemeIconButton />
          <SignOutButton compact />
        </div>
      </div>
      <h1 className="font-display text-title">{profile ? "Update your profile" : "Welcome to WYD?"}</h1>
      <p className="mt-2 text-body text-ink-2">
        Real people only. A person on our team checks every profile before you can post or join plans.
      </p>
      {profile?.rejection_reason && (
        <p className="mt-4 rounded-card border border-danger bg-surface p-4 text-body text-ink">
          <span className="text-label text-danger">Why we couldn&apos;t verify you: </span>
          {profile.rejection_reason}
        </p>
      )}
      <OnboardingWizard
        userId={user.id}
        initial={profile}
        initialPhone={priv?.phone ?? ""}
        submitLabel={profile ? "Resubmit for review" : "Create my profile"}
        next="/profile?welcome=1"
      />
    </main>
  );
}
