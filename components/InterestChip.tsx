import { TAGS } from "@/lib/tags";
import { tagLabel } from "@/lib/ui";

// Colourful but token-based tints. Solid candle keeps dark text in both themes;
// the translucent tints sit on the page surface, so they use the theme's ink.
const TINTS = ["bg-candle text-on-light", "bg-coral/25 text-ink", "bg-success/15 text-ink", "bg-sunk text-ink"];

export function InterestChip({ tag, highlight }: { tag: string; highlight?: boolean }) {
  const tint = highlight ? "bg-ink text-on-ink" : TINTS[Math.max(0, TAGS.indexOf(tag as never)) % TINTS.length];
  return <span className={`inline-flex h-8 items-center rounded-pill px-3 text-label ${tint}`}>{tagLabel(tag)}</span>;
}
