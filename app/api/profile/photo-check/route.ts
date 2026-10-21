import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkPhoto } from "@/lib/ai";

// Runs the AI photo pre-check on the signed-in user's saved photo and stores it on their profile.
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("photo_url")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  // Only fetch photos from this user's own folder in our avatars bucket.
  const allowedPrefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.id}/`;
  if (!profile.photo_url.startsWith(allowedPrefix)) {
    return NextResponse.json({ error: "Unexpected photo location." }, { status: 400 });
  }

  let result: Awaited<ReturnType<typeof checkPhoto>>;
  try {
    const img = await fetch(profile.photo_url);
    if (!img.ok) throw new Error(`photo fetch ${img.status}`);
    const data = Buffer.from(await img.arrayBuffer()).toString("base64");
    const mimeType = img.headers.get("content-type") ?? "image/jpeg";
    result = await checkPhoto({ mimeType, data });
  } catch (err) {
    console.warn("[photo-check] could not load photo:", err);
    result = { skipped: true, path: "fallback" };
  }

  // photo_check can only be written by the service role (profiles_guard trigger).
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { error } = await createAdminClient()
      .from("profiles")
      .update({ photo_check: result })
      .eq("id", user.id);
    if (error) console.warn("[photo-check] save failed:", error.message);
  } else {
    console.warn("[photo-check] SUPABASE_SERVICE_ROLE_KEY missing, result not saved");
  }

  return NextResponse.json(result);
}
