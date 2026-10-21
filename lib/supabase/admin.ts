import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export function hasServiceRole() {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}

// Service role client: bypasses RLS. Server only, never import from client components.
// Callers check hasServiceRole() first and show a clear message when the key is missing.
export function createAdminClient() {
  if (!hasServiceRole()) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set in .env.local");
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
