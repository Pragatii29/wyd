"use client";

import { useSyncExternalStore, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { btn } from "@/lib/ui";

function readPermission(): NotificationPermission | "unsupported" {
  return typeof Notification === "undefined" ? "unsupported" : Notification.permission;
}

// Asks for browser notification permission once, only when the user taps the button.
export function NotificationOptIn() {
  const initial = useSyncExternalStore(() => () => {}, readPermission, () => "default" as const);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported" | null>(null);
  const current = permission ?? initial;

  if (current === "unsupported" || current === "denied") return null;
  if (current === "granted") {
    return (
      <p className="flex items-center justify-center gap-2 text-label text-success">
        <BellRing size={18} /> Alerts are on
      </p>
    );
  }
  return (
    <button className={btn.primary} onClick={async () => setPermission(await Notification.requestPermission())}>
      <Bell size={18} /> Turn on alerts for plans near you
    </button>
  );
}
