import { AUDIENCES, type Audience } from "@/lib/audience";

export function AudienceChip({ audience }: { audience: Audience }) {
  const a = AUDIENCES.find((x) => x.value === audience)!;
  const Icon = a.icon;
  return (
    <span className="inline-flex h-8 items-center gap-1 rounded-pill bg-sunk px-3 text-label text-ink">
      <Icon size={14} aria-hidden /> {a.label}
    </span>
  );
}
