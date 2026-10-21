import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Keeps the Supabase session cookie fresh on every request.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  const { error } = await supabase.auth.getUser();
  // The browser holds a sign-in for an account that no longer exists: clear it so pages don't loop.
  if (error && (error.code === "user_not_found" || error.code === "session_not_found")) {
    await supabase.auth.signOut({ scope: "local" });
  }
  return response;
}

export const config = {
  // Skip static files (photos, icons, the service worker): they don't need a sign-in check.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|demo/|sw\\.js|icon\\.svg|.*\\.(?:png|jpe?g|svg|webp|ico|js|css|txt|xml)$).*)"],
};
