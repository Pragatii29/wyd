import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/profile";
import { ProfileForm } from "@/components/ProfileForm";
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
    <main className={`${page} pb-16 pt-10`}>
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
      <ProfileForm
        userId={user.id}
        initial={profile}
        initialPhone={priv?.phone ?? ""}
        submitLabel={profile ? "Resubmit for review" : "Create my profile"}
        next="/profile?welcome=1"
        wizard
      />
    </main>
  );
}
