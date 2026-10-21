import { page } from "@/lib/ui";

export default function Loading() {
  return (
    <main className={`${page} pt-6`} aria-busy="true" aria-label="Loading">
      <div className="h-9 w-32 animate-pulse rounded-sm bg-sunk" />
      <ul className="mt-6 flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="size-10 animate-pulse rounded-full bg-sunk" />
              <div className="h-4 w-24 animate-pulse rounded-sm bg-sunk" />
            </div>
            <div className="h-5 w-full animate-pulse rounded-sm bg-sunk" />
            <div className="h-5 w-2/3 animate-pulse rounded-sm bg-sunk" />
          </li>
        ))}
      </ul>
    </main>
  );
}
