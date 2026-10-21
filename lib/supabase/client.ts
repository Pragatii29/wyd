import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Implicit flow: the magic link carries the session itself, so it works even when opened
    // in a different browser or device (e.g. a phone's mail app) than the one that asked for it.
    { auth: { flowType: "implicit" } },
  );
}
