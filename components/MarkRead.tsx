"use client";

import { useEffect } from "react";
import { markNotificationsRead } from "@/app/actions/social";

// Opening the notifications list marks everything as read.
export function MarkRead() {
  useEffect(() => {
    markNotificationsRead();
  }, []);
  return null;
}
