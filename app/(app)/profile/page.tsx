import Link from "next/link";
import { ArrowRight, PartyPopper, Pencil, Shield } from "lucide-react";
import { isAdminEmail, requireApproved } from "@/lib/profile";
import { ProfileCard } from "@/components/ProfileCard";
import { PushToggle } from "@/components/PushToggle";
import { CitySwitcher } from "@/components/CitySwitcher";
import { BlockedList } from "@/components/BlockedList";
import { SignOutButton } from "@/components/SignOutButton";
import { btn, card, meta, page } from "@/lib/ui";

export default async function MyProfilePage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const { welcome } = await searchParams;
  const { supabase, user, profile } = await requireApproved();
  const { data: blocks } = await supabase
    .from("blocks")
    .select("blocked_id, profile:profiles!blocks_blocked_id_fkey(name)")
    .eq("blocker_id", user.id);

  return (
    <main className={`${page} pt-6`}>
      {welcome && (
        <section className="animate-fade-in mb-6 flex flex-col gap-3 rounded-sheet bg-night p-6 text-bone">
          <PartyPopper size={28} className="text-candle" aria-hidden />
          <h1 className="font-display text-title">You&apos;re in, {profile.name.split(" ")[0]}!</h1>
          <p className="text-body">This is your profile. It&apos;s how people near {profile.area || profile.city} will see you when you post or ask to join a plan.</p>
          <Link href="/feed" className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-pill bg-bone px-6 text-label text-ink transition duration-fast ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone">
            See plans near you <ArrowRight size={18} />
          </Link>
        </section>
      )}
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
