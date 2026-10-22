import { requireApproved } from "@/lib/profile";
import { BottomNav } from "@/components/BottomNav";
import { NotificationListener } from "@/components/NotificationListener";

// Everything inside the app needs an approved profile.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user, profile } = await requireApproved();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return (
    <div className="min-h-dvh pb-[calc(100px+env(safe-area-inset-bottom))]">
      {children}
      <NotificationListener userId={user.id} />
      <BottomNav unreadAlerts={count ?? 0} photo={profile.photo_url} name={profile.name.split(" ")[0]} />
    </div>
  );
}
