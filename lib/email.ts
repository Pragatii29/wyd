import "server-only";
import nodemailer from "nodemailer";

// Contact-form email through Gmail with an app password (no domain needed).
// Server only: GMAIL_USER / GMAIL_APP_PASSWORD never reach the browser.
export function emailReady() {
  return !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD;
}

function transport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

export async function sendMail(to: string, subject: string, text: string, replyTo?: string) {
  await transport().sendMail({
    from: `"WYD?" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    ...(replyTo ? { replyTo } : {}),
  });
}
