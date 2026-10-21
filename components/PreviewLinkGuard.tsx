"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Preview only: links in the shared components point at the real (signed-in) pages.
// Catch those clicks before React/Next handle them and open the matching preview screen instead,
// so tapping around never drops you on the sign-in page.
export function mapToPreview(href: string) {
  const url = new URL(href, window.location.origin);
  const p = url.pathname;
  if (p === "/feed") return url.searchParams.get("tab") === "requests" ? "/preview?screen=requests" : "/preview?screen=home";
  if (p === "/requests" || p === "/wyds") return "/preview?screen=requests";
  if (p.startsWith("/requests/")) return "/preview?screen=request";
  if (p === "/wyd/new") return "/preview?screen=post";
  if (p.startsWith("/wyd/")) return "/preview?screen=home";
  if (p === "/notifications") return "/preview?screen=alerts";
  if (p === "/chats") return "/preview?screen=chats";
  if (p.startsWith("/chats/")) return "/preview?screen=chat";
  if (p.startsWith("/profile/")) return `/preview?screen=profile&who=${p.split("/")[2]}`;
  if (p.startsWith("/profile")) return "/preview?screen=profile";
  return null;
}

export function PreviewLinkGuard() {
  const router = useRouter();
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const a = (e.target as HTMLElement).closest("a");
      const href = a?.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("/preview")) return;
      const target = mapToPreview(href);
      if (!target) return;
      e.preventDefault();
      e.stopPropagation();
      router.push(target);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);
  return null;
}
