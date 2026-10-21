import { notFound } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { page } from "@/lib/ui";

// Local click-through of the 3-step sign-up without an account. Development only: 404 on the live site.
export default function PreviewSignup() {
  if (process.env.NODE_ENV !== "development") notFound();
  return (
    <main className={`${page} pb-16 pt-10`}>
      <p className="mb-4 inline-flex rounded-pill bg-candle px-3 py-1 text-label text-on-light">Preview · nothing is saved</p>
      <h1 className="font-display text-title">Welcome to WYD?</h1>
      <p className="mt-2 text-body text-ink-2">Two quick steps and you&apos;re in.</p>
      <ProfileForm userId="preview" initial={null} submitLabel="Create my profile" next="/pending" wizard preview />
    </main>
  );
}
