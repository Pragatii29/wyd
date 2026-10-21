import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireApproved } from "@/lib/profile";
import { ProfileForm } from "@/components/ProfileForm";
import { page } from "@/lib/ui";

export default async function EditProfilePage() {
  const { user, profile } = await requireApproved();
  return (
    <main className={`${page} pb-10 pt-6`}>
      <Link href="/profile" className="inline-flex size-11 items-center justify-center rounded-full text-ink" aria-label="Back to profile">
        <ArrowLeft size={22} />
      </Link>
      <h1 className="mt-2 font-display text-title">Edit profile</h1>
      <ProfileForm userId={user.id} initial={profile} submitLabel="Save changes" next="/profile" />
    </main>
  );
}
