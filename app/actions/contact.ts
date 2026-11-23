"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { emailReady, sendMail } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().min(1, "Add your name").max(80),
  email: z.email("Enter a valid email address").trim().max(200),
  message: z.string().trim().min(1, "Write your question").max(2000, "Keep it under 2000 characters"),
  // Honeypot: real people never see or fill this field.
  website: z.string().max(0).optional(),
});

export type ContactResult =
  | { ok: true; emailed: boolean }
  | { ok: false; errors: Partial<Record<"name" | "email" | "message" | "form", string>> };

// Saves the message (RLS: insert-only), then emails the owner and sends the person an auto-reply.
// The row is saved even if email isn't set up or fails, so no question is ever lost.
export async function submitContact(input: { name: string; email: string; message: string; website?: string }): Promise<ContactResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0] ?? "form")] ??= issue.message;
    if (errors.website) return { ok: true, emailed: false }; // bot: pretend it worked, save nothing
    return { ok: false, errors };
  }
  const { name, email, message } = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({ name, email, message });
  if (error) return { ok: false, errors: { form: "We couldn't send your message. Please try again." } };

  if (!emailReady()) return { ok: true, emailed: false };
  const owner = process.env.CONTACT_OWNER_EMAIL || process.env.GMAIL_USER!;
  try {
    await Promise.all([
      sendMail(
        owner,
        `New WYD? question from ${name}`,
        `${name} <${email}> sent a question through the WYD? contact form:\n\n${message}\n\nReply to this email to answer them.`,
        email,
      ),
      sendMail(
        email,
        "We got your message — WYD?",
        `Hi ${name.split(" ")[0]},\n\nThanks for reaching out to WYD?. We've received your question and will get back to you soon.\n\nYour message:\n"${message}"\n\n— The WYD? team`,
      ),
    ]);
    return { ok: true, emailed: true };
  } catch (e) {
    console.error("contact email failed", e);
    return { ok: true, emailed: false };
  }
}
