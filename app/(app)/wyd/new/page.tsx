import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireApproved } from "@/lib/profile";
import { Composer } from "@/components/Composer";
import { page } from "@/lib/ui";

export default async function NewWydPage() {
  const { profile } = await requireApproved();
  return (
    <main className={`${page} pt-6`}>
      <Link href="/feed" className="inline-flex size-11 items-center justify-center rounded-full text-ink" aria-label="Back to feed">
        <ArrowLeft size={22} />
      </Link>
      <h1 className="mt-2 font-display text-title">Drop a WYD</h1>
      <p className="mt-2 text-body text-ink-2">Share a plan. People in your city who like the same things get a heads up.</p>
      <Composer city={profile.city} area={profile.area} />
    </main>
  );
}
