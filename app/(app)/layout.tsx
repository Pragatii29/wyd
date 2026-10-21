import { requireApproved } from "@/lib/profile";
import { TabBar } from "@/components/TabBar";
import { NotificationListener } from "@/components/NotificationListener";

// Everything inside the app needs an approved profile.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireApproved();
  const { count } = await supabase
    .from("requests")
    .select("id, threads!inner(author_id)", { count: "exact", head: true })
    .eq("status", "pending")
    .eq("threads.author_id", user.id);

  return (
    <div className="min-h-dvh pb-[calc(96px+env(safe-area-inset-bottom))]">
      {children}
      <NotificationListener userId={user.id} />
      <TabBar pendingRequests={count ?? 0} />
    </div>
  );
}
