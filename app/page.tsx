import { createClient } from "@/lib/supabase/server";
import { SignInForm } from "@/components/SignInForm";
import { SignOutButton } from "@/components/SignOutButton";

export default async function Landing({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

      <div className="flex flex-col gap-3">
        {user ? (
          <>
            <p className="text-body">
              You&apos;re signed in as <strong>{user.email}</strong>.
            </p>
            <SignOutButton />
          </>
        ) : (
          <SignInForm initialError={error === "signin"} />
        )}
      </div>
    </main>
  );
}
