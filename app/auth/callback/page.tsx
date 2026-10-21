"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Finishes magic link sign in. Handles both link styles:
// #access_token=… (implicit, works on any browser) and ?code=… (PKCE, same browser only).
export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      const linkError = hash.get("error_description") ?? url.searchParams.get("error_description");
      if (linkError) return setError(linkError.replace(/\+/g, " "));

      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) return setError("Open the link in the same browser you asked for it from, or request a new one.");
      } else if (hash.get("access_token") && hash.get("refresh_token")) {
        const { error } = await supabase.auth.setSession({
          access_token: hash.get("access_token")!,
          refresh_token: hash.get("refresh_token")!,
        });
        if (error) return setError(error.message);
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) return setError("This sign in link has expired or was already used.");
      router.replace("/");
      router.refresh();
    })();
  }, [router]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-center gap-4 bg-night px-4 text-bone">
      {error ? (
        <>
          <h1 className="font-display text-title">That link didn&apos;t work</h1>
          <p className="text-body">{error}</p>
          <Link href="/" className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-pill bg-bone px-6 text-label text-on-light transition duration-fast ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone">
            Get a new link
          </Link>
        </>
      ) : (
        <p className="flex items-center gap-2 text-body">
          <Loader2 className="animate-spin" size={20} /> Signing you in…
        </p>
      )}
    </main>
  );
}
