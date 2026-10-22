import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/profile";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeIconButton } from "@/components/ThemeToggle";
import { eyebrow } from "@/lib/ui";
import { Logo } from "@/components/Logo";

// Sign-up in three steps: basics (name, phone, optional social link) → about + JPG photo → create profile.
// Also used to fix and resubmit a rejected profile.
export default async function OnboardingPage() {
  const { supabase, user, profile } = await getSession();
  if (!user) redirect("/");
  if (profile && profile.status !== "rejected") redirect(homeFor(profile));

  const { data: priv } = profile
    ? await supabase.from("profile_private").select("phone, selfie_path").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col">
      <div className="flex items-center justify-between px-5 pt-4">
        <Logo className="h-7 w-auto" spark />
        <div className="flex items-center">
          <ThemeIconButton />
          <SignOutButton compact />
        </div>
      </div>
      <section className="px-5 pt-6">
        <p className={eyebrow}>{user.email ? `Signed in as ${user.email}` : "Test account on this device"}</p>
        <h1 className="mt-2 font-display text-display">{profile ? "Update your profile" : "Almost there."}</h1>
        <p className="mt-2 text-body text-ink-2">{profile ? "Fix the details below and resubmit." : "Two quick steps and you're in."}</p>
        {profile?.rejection_reason && (
          <p className="mt-4 rounded-card border border-danger bg-surface p-4 text-body text-ink">
            <span className="text-label text-danger">Why we couldn&apos;t verify you: </span>
            {profile.rejection_reason}
          </p>
        )}
      </section>
      <div className="mt-6 flex-1 rounded-t-sheet bg-surface shadow-float px-5 pb-12 pt-1">
        <OnboardingWizard
          userId={user.id}
          initial={profile}
          initialPhone={priv?.phone ?? ""}
          hasSelfie={!!priv?.selfie_path}
          submitLabel={profile ? "Resubmit for review" : "Create my profile"}
          next="/profile?welcome=1"
        />
      </div>
    </main>
  );
}
