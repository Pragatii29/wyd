import "server-only";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";

type Limited = "threads" | "requests" | "messages" | "reports";
const USER_COLUMN: Record<Limited, string> = {
  threads: "author_id",
  requests: "requester_id",
  messages: "sender_id",
  reports: "reporter_id",
};

// Simple rate limit: true if the user already made `max` rows in the last `minutes`.
export async function overLimit(table: Limited, userId: string, max: number, minutes: number) {
  if (!hasServiceRole()) return false;
  const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();
  const { count } = await createAdminClient()
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(USER_COLUMN[table], userId)
    .gt("created_at", since);
  return (count ?? 0) >= max;
}
