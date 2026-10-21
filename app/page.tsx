import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, homeFor } from "@/lib/profile";
import { SignInForm } from "@/components/SignInForm";
import { ThemeIconButton } from "@/components/ThemeToggle";

const EXAMPLES = [
  "New to Bangalore, 22F. Anyone up for exploring cafes today?",
  "Anyone up for watching a movie tonight?",
  "Looking for people to play cricket this evening.",
];

export default async function Landing({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { user, profile } = await getSession();
  if (user) redirect(homeFor(profile));

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col gap-10 bg-night px-4 py-10 text-bone">
      <div className="flex items-center justify-between">
        <p className="font-display text-title">WYD?</p>
        <ThemeIconButton className="text-bone" />
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-display">Got a plan? Find someone who&apos;s up for it.</h1>
        <p className="text-body text-bone">
          Post what you&apos;re doing. Verified people in your city who like the same things get a heads up and ask to join.
        </p>
      </div>

      <ul className="flex flex-col gap-2" aria-label="Example plans">
        {EXAMPLES.map((e, i) => (
          <li
            key={e}
            className={`rounded-card px-4 py-3 text-wyd ${i === 1 ? "self-end bg-coral text-on-light" : i === 2 ? "bg-candle text-on-light" : "bg-bone text-on-light"}`}
          >
            {e}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-3">
        <SignInForm initialError={error === "signin"} />
        <p className="text-center font-mono text-meta text-bone">
          No passwords. We email you a sign in link. <Link href="/privacy" className="underline">Privacy</Link>
        </p>
      </div>
    </main>
  );
}
