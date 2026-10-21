import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSession, homeFor } from "@/lib/profile";
import { NewWydForm } from "@/components/NewWydForm";

export default async function NewWydPage() {
  const { user, profile } = await getSession();
  if (!user) redirect("/");
  if (homeFor(profile) !== "/feed") redirect(homeFor(profile));

  return (
    <main className="mx-auto max-w-[480px] px-4 pb-16 pt-6">
      <Link href="/feed" className="inline-flex size-11 items-center justify-center rounded-full text-ink" aria-label="Back to feed">
        <ArrowLeft size={22} />
      </Link>
      <h1 className="mt-2 font-display text-title">WYD?</h1>
      <p className="mt-2 text-body text-ink-2">Share a plan. People nearby who like the same things get a heads up.</p>
      <NewWydForm area={profile!.area} />
    </main>
  );
}
