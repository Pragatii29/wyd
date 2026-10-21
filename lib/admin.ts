import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/profile";

export const ADMIN_COOKIE = "wyd_admin";

// Sign-in has no email any more, so the admin unlocks /admin with ADMIN_PASSCODE (server only).
// The cookie holds a hash of the passcode and the server secret, never the passcode itself.
export function adminToken() {
  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode) return null;
  return createHash("sha256").update(`${passcode}:${process.env.WYD_SERVER_SECRET ?? ""}`).digest("hex");
}

export function passcodeMatches(attempt: string) {
  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode) return false;
  const a = createHash("sha256").update(attempt).digest();
  const b = createHash("sha256").update(passcode).digest();
  return timingSafeEqual(a, b);
}

// Admin = unlocked with the passcode on this device, or signed in with an ADMIN_EMAILS address.
export async function isAdmin() {
  const token = adminToken();
  const cookie = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (token && cookie && cookie.length === token.length && timingSafeEqual(Buffer.from(cookie), Buffer.from(token))) return true;
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  return isAdminEmail(user?.email);
}
