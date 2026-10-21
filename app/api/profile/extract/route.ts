import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { extractProfile } from "@/lib/ai";

const bodySchema = z.object({ bio: z.string().trim().min(1).max(1000) });

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Tell us a little about yourself first." }, { status: 400 });
  }

  return NextResponse.json(await extractProfile(parsed.data.bio));
}
