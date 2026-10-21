import Image from "next/image";
import { BadgeCheck, Clock, MapPin } from "lucide-react";
import { InterestChip } from "@/components/InterestChip";
import { ageFrom, type Profile } from "@/lib/profile";
import { card } from "@/lib/ui";

// Photo-first profile card: big 4:5 photo with name and age, then verification, place, About and interests.
export function ProfileCard({ profile, sharedWith = [] }: { profile: Profile; sharedWith?: string[] }) {
  const verified = profile.status === "approved";
  return (
    <article className={`${card} flex flex-col gap-4 p-3`}>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-card bg-sunk">
        <Image src={profile.photo_url} alt={`Photo of ${profile.name}`} fill sizes="(max-width: 480px) 100vw, 456px" className="object-cover" priority />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night/70 to-transparent p-4 pt-16">
          <p className="font-display text-title text-bone">
            {profile.name.split(" ")[0]}, {ageFrom(profile.dob)}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 px-1 pb-1">
        <div className="flex flex-wrap items-center gap-2">
          {verified ? (
            <span className="inline-flex items-center gap-1 rounded-pill bg-success/15 px-3 py-1 text-label text-success">
              <BadgeCheck size={16} /> Verified by our team
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-pill bg-sunk px-3 py-1 text-label text-ink-2">
              <Clock size={16} /> Not verified yet
            </span>
          )}
          <span className="inline-flex items-center gap-1 font-mono text-meta text-ink-2">
            <MapPin size={12} /> {[profile.area, profile.city].filter(Boolean).join(", ")}
          </span>
        </div>
        {profile.bio && <p className="whitespace-pre-line text-body text-ink-2">{profile.bio}</p>}
        {profile.interests.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-label">Into</h2>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((t) => (
                <InterestChip key={t} tag={t} highlight={sharedWith.includes(t)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
