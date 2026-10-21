import Image from "next/image";
import { BadgeCheck, Clock, MapPin, PenLine, Sparkles } from "lucide-react";
import { InterestChip } from "@/components/InterestChip";
import { ageFrom, type Profile } from "@/lib/profile";

// Photo-first profile in the style of a dating/networking "request" screen:
// name + age + verified tick, area, a big photo, then a Bio card with interests.
export function ProfileCard({
  profile,
  sharedWith = [],
  action,
}: {
  profile: Profile;
  sharedWith?: string[];
  action?: React.ReactNode;
}) {
  const verified = profile.status === "approved";
  const shared = profile.interests.filter((t) => sharedWith.includes(t));
  return (
    <article className="flex flex-col gap-4">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-x-2 text-title font-bold text-ink">
            <span className="truncate">{profile.name}</span>
            <span className="font-normal">{ageFrom(profile.dob)}</span>
            {verified && <BadgeCheck size={26} className="text-success" aria-label="Verified" />}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-body text-ink-2">
            <MapPin size={16} aria-hidden /> {[profile.area, profile.city].filter(Boolean).join(", ")}
          </p>
        </div>
        {action}
      </header>

      {!verified && (
        <p className="flex items-center gap-2 self-start rounded-pill bg-sunk px-3 py-1 text-label text-ink-2">
          <Clock size={16} /> {profile.status === "pending" ? "Under review" : "Not verified"}
        </p>
      )}

      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sheet bg-sunk">
        <Image src={profile.photo_url} alt={`Photo of ${profile.name}`} fill sizes="(max-width: 480px) 100vw, 448px" className="object-cover" priority />
      </div>

      {shared.length > 0 && (
        <p className="flex items-center gap-2 rounded-card bg-candle px-4 py-3 text-label text-on-light">
          <Sparkles size={16} /> You&apos;re both into {shared.slice(0, 3).map((t) => t.replace(/_/g, " ")).join(", ")}
        </p>
      )}

      <section className="flex flex-col gap-5 rounded-sheet border border-line bg-surface p-6">
        {profile.bio && (
          <div className="flex flex-col gap-3">
            <PenLine size={24} className="text-coral-text" aria-hidden />
            <h2 className="font-display text-h2">Bio</h2>
            <p className="whitespace-pre-line text-body text-ink">{profile.bio}</p>
          </div>
        )}
        {profile.interests.length > 0 && (
          <>
            {profile.bio && <hr className="border-line" />}
            <div className="flex flex-col gap-3">
              <h2 className="font-display text-h2">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((t) => (
                  <InterestChip key={t} tag={t} highlight={sharedWith.includes(t)} />
                ))}
              </div>
            </div>
          </>
        )}
      </section>
    </article>
  );
}
