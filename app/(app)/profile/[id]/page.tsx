import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireApproved } from "@/lib/profile";
import { getBlockedIds } from "@/lib/blocks";
import { ProfileCard } from "@/components/ProfileCard";
import { SafetyMenu } from "@/components/SafetyMenu";
import { btn, page } from "@/lib/ui";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user, profile: me } = await requireApproved();
  if (id === user.id) redirect("/profile");

  // RLS: only approved profiles are readable by others.
  const { data: profile } = /^[0-9a-f-]{36}$/i.test(id)
    ? await supabase.from("profiles").select("*").eq("id", id).maybeSingle()
    : { data: null };
  const blocked = profile ? (await getBlockedIds(user.id)).has(profile.id) : false;

  if (!profile || blocked) {
    return (
      <main className={`${page} flex flex-col gap-4 pt-16`}>
        <h1 className="font-display text-title">Profile not available</h1>
        <Link href="/feed" className={btn.primary}>
          Back to feed
        </Link>
      </main>
    );
  }

  // ProfileCard never renders the social link, birthday or email.
  return (
    <main className={`${page} pt-4`}>
      <Link href="/feed" className="mb-2 inline-flex size-11 items-center justify-center rounded-full text-ink" aria-label="Back">
        <ArrowLeft size={22} />
      </Link>
      <ProfileCard
        profile={profile}
        sharedWith={me.interests}
        action={<SafetyMenu target={{ type: "profile", id: profile.id }} userId={profile.id} userName={profile.name.split(" ")[0]} />}
      />
    </main>
  );
}
