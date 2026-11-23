import "server-only";
import nodemailer from "nodemailer";

// Contact-form email through Gmail with an app password (no domain needed).
// Server only: GMAIL_USER / GMAIL_APP_PASSWORD never reach the browser.
// Google shows app passwords as "abcd efgh ijkl mnop": tolerate the spaces (and stray quotes) people
// paste along with it.
const clean = (v: string | undefined) => (v ?? "").trim().replace(/^["']|["']$/g, "");
const user = () => clean(process.env.GMAIL_USER);
const pass = () => clean(process.env.GMAIL_APP_PASSWORD).replace(/\s+/g, "");

export function emailReady() {
  return !!user() && !!pass();
}

function transport() {
  return nodemailer.createTransport({ service: "gmail", auth: { user: user(), pass: pass() } });
}

// Resolves with Gmail's answer (which recipients it accepted), so callers can log delivery.
export async function sendMail(to: string, subject: string, text: string, replyTo?: string) {
  return transport().sendMail({
    from: `"WYD?" <${user()}>`,
    to,
    subject,
    text,
    ...(replyTo ? { replyTo } : {}),
  });
}
