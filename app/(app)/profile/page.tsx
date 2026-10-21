import Link from "next/link";
import { Pencil, Shield } from "lucide-react";
import { isAdminEmail, requireApproved } from "@/lib/profile";
import { ProfileCard } from "@/components/ProfileCard";
import { PushToggle } from "@/components/PushToggle";
import { CitySwitcher } from "@/components/CitySwitcher";
import { BlockedList } from "@/components/BlockedList";
import { SignOutButton } from "@/components/SignOutButton";
import { btn, card, meta, page } from "@/lib/ui";

export default async function MyProfilePage() {
  const { supabase, user, profile } = await requireApproved();
  const { data: blocks } = await supabase
    .from("blocks")
    .select("blocked_id, profile:profiles!blocks_blocked_id_fkey(name)")
    .eq("blocker_id", user.id);

  return (
    <main className={`${page} pt-6`}>
      <ProfileCard
        profile={profile}
        action={
          <Link href="/profile/edit" className={`${btn.small} w-auto shrink-0`}>
            <Pencil size={16} /> Edit
          </Link>
        }
      />
      <p className={`${meta} mt-3`}>This is how other verified people see you. Your phone, birthday, email and social link stay private.</p>

      <section className={`${card} mt-6 flex flex-col gap-4`}>
        <h2 className="text-h2">Settings</h2>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-label">Active city</p>
            <p className={meta}>You only see and get alerts for plans here.</p>
          </div>
          <CitySwitcher city={profile.city} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-label">Alerts</p>
          <PushToggle compact />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-label">Blocked people</p>
          <BlockedList people={(blocks ?? []).map((b) => ({ id: b.blocked_id, name: b.profile?.name ?? "Someone" }))} />
        </div>
        <Link href="/privacy" className={`${btn.ghost} justify-start px-0`}>
          <Shield size={16} /> Privacy notice
        </Link>
        {isAdminEmail(user.email) && (
          <Link href="/admin" className={btn.secondary}>
            Open admin
          </Link>
        )}
        <SignOutButton />
      </section>
    </main>
  );
}
