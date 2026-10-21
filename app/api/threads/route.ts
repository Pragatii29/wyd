import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { screenWyd } from "@/lib/ai";

const bodySchema = z.object({
  body: z.string().trim().min(1, "Write your plan first.").max(280, "Keep it under 280 characters."),
  audience: z.enum(["all", "women", "men"]),
});

// Drop a WYD: approved users only, screened by the AI (or fallback) before it is saved.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (profile?.status !== "approved") {
    return NextResponse.json({ error: "You can post once your profile is verified." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid post." }, { status: 400 });
  }

  // Threads can only be inserted with the service role (RLS), after screening.
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: "Posting isn't set up yet: add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart." },
      { status: 503 },
    );
  }

  const screen = await screenWyd(parsed.data.body);
  if (screen.verdict === "unsafe") {
    return NextResponse.json({ error: screen.reason, verdict: "unsafe" }, { status: 422 });
  }

  const { data: thread, error } = await createAdminClient()
    .from("threads")
    .insert({
      author_id: user.id,
      body: parsed.data.body,
      audience: parsed.data.audience,
      tags: screen.tags,
      city: profile.city,
      area: profile.area,
      lat: profile.lat,
      lng: profile.lng,
      status: screen.verdict === "safe" ? "live" : "review",
      moderation_reason: screen.verdict === "review" ? `${screen.reason} (${screen.path})` : null,
    })
    .select("id, status")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: thread.id, status: thread.status, tags: screen.tags });
}
