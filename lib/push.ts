import "server-only";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export function pushConfigured() {
  return !!(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);
}

// Sends a Web Push to every saved subscription of these users. Payload stays free of personal
// details because it can show on a lock screen.
export async function sendPush(userIds: string[], payload: { title: string; body: string; url: string }) {
  if (!pushConfigured() || userIds.length === 0) return { sent: 0 };
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );

  const admin = createAdminClient();
  const { data: subs } = await admin.from("push_subscriptions").select("*").in("user_id", userIds);
  let sent = 0;
  await Promise.all(
    (subs ?? []).map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
          { TTL: 60 * 60 },
        );
        sent++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        // Subscription expired or was revoked: forget it.
        if (status === 404 || status === 410) await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
        else console.warn("[push] send failed", status ?? err);
      }
    }),
  );
  console.log(`[push] sent ${sent}/${subs?.length ?? 0}`);
  return { sent };
}
