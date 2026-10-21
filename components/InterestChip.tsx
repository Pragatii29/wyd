import { TAGS } from "@/lib/tags";
import { tagLabel } from "@/lib/ui";

// Colourful but token-based tints; ink text keeps contrast on every tint.
const TINTS = ["bg-candle", "bg-coral/25", "bg-success/15", "bg-sunk"];

export function InterestChip({ tag, highlight }: { tag: string; highlight?: boolean }) {
  const tint = highlight ? "bg-ink text-bone" : `${TINTS[Math.max(0, TAGS.indexOf(tag as never)) % TINTS.length]} text-ink`;
  return <span className={`inline-flex h-8 items-center rounded-pill px-3 text-label ${tint}`}>{tagLabel(tag)}</span>;
}
