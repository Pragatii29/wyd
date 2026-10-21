import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/profile";
import { SignInForm } from "@/components/SignInForm";

export default async function Landing({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { user, profile } = await getSession();
  if (user) redirect(homeFor(profile));

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col justify-between bg-night px-4 py-10 text-bone">
      <p className="font-display text-title">WYD?</p>

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-display">
          Got a plan? Find someone who&apos;s up for it.
        </h1>
        <p className="text-body text-bone">
          Chai, a walk at Cubbon Park, a new café. Verified people nearby, in minutes.
        </p>
      </div>

      <SignInForm initialError={error === "signin"} />
    </main>
  );
}
