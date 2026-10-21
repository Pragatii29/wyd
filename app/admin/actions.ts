"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAdminEmail } from "@/lib/profile";

const decisionSchema = z.object({
  id: z.uuid(),
  status: z.enum(["approved", "rejected"]),
});

export async function decideProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) throw new Error("Not allowed");

  const { id, status } = decisionSchema.parse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  const { error } = await createAdminClient().from("profiles").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}
