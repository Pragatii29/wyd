"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { removePushSubscription, savePushSubscription } from "@/app/actions/social";
import { btn, meta } from "@/lib/ui";

type State = "loading" | "unsupported" | "denied" | "off" | "on";

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

// Asks for notification permission only when tapped, then registers a Web Push subscription.
export function PushToggle({ compact }: { compact?: boolean }) {
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || typeof Notification === "undefined") {
        return setState("unsupported");
      }
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      setState(sub && Notification.permission === "granted" ? "on" : "off");
    })();
  }, []);

  async function turnOn() {
    setBusy(true);
    setError("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return setState(permission === "denied" ? "denied" : "off");
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!key) throw new Error("Push isn't configured on this server yet.");
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub =
        (await reg.pushManager.getSubscription()) ??
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) }));
      const res = await savePushSubscription(sub.toJSON());
      if (!res.ok) throw new Error(res.error);
      setState("on");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't turn on alerts.");
    } finally {
      setBusy(false);
    }
  }

  async function turnOff() {
    setBusy(true);
    const reg = await navigator.serviceWorker.getRegistration("/sw.js");
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      await removePushSubscription(sub.endpoint);
      await sub.unsubscribe();
    }
    setState("off");
    setBusy(false);
  }

  if (state === "loading") return null;
  if (state === "unsupported") {
    return <p className={meta}>This browser can&apos;t do push alerts. You&apos;ll still see new plans in the bell while the app is open.</p>;
  }
  if (state === "denied") {
    return (
      <p className={`${meta} flex items-start gap-2`}>
        <BellOff size={14} className="mt-0.5 shrink-0" /> Alerts are blocked in your browser settings. New plans still show in the bell while the app is open.
      </p>
    );
  }
  if (state === "on") {
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-label text-success">
          <BellRing size={18} /> Alerts are on
        </span>
        <button onClick={turnOff} disabled={busy} className={compact ? btn.ghost : btn.small}>
          Turn off
        </button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <button onClick={turnOn} disabled={busy} className={compact ? btn.small : btn.primary}>
        {busy ? <Loader2 className="animate-spin" size={18} /> : <Bell size={18} />}
        Get alerts for plans near you
      </button>
      <p className={meta}>We&apos;ll ping you when someone in your city posts a plan you might like. No names on your lock screen.</p>
      {error && <p className="font-mono text-meta text-danger">{error}</p>}
    </div>
  );
}
