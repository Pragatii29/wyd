// Shared class strings for DESIGN.md components.
// Glass + button box: solid pill buttons with a stitched edge, frosted pill fields, stitched chips and cards (see DESIGN.md §15–16).
const base =
  "inline-flex items-center justify-center gap-2 rounded-pill text-label transition duration-fast ease-press active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:bg-sunk disabled:text-ink-3";

export const btn = {
  primary: `${base} stitch h-14 w-full bg-ink px-6 text-on-ink text-wyd font-medium shadow-glow hover:opacity-90`,
  // Cream pill for the espresso brand screens (intro, empty states).
  brand: `${base} stitch h-14 w-full bg-on-brand px-6 text-brand text-wyd font-medium shadow-float hover:opacity-90`,
  secondary: `${base} stitch h-14 w-full border border-line bg-surface px-6 text-ink hover:bg-sunk`,
  danger: `${base} stitch h-14 w-full border border-danger bg-surface px-6 text-danger hover:bg-sunk`,
  ghost: `${base} min-h-11 px-2 text-coral-text hover:underline`,
  small: `${base} stitch h-10 border border-line bg-surface px-4 text-ink hover:bg-sunk`,
  smallPrimary: `${base} stitch h-10 bg-ink px-4 text-on-ink hover:opacity-90`,
  smallAccent: `${base} stitch h-10 bg-ink px-4 text-on-ink hover:opacity-90`,
};

export const input =
  "h-14 w-full rounded-field border border-line bg-surface px-5 text-body text-ink placeholder:text-ink-3 transition duration-base ease-out hover:border-ink-3 focus:border-ink-2 focus:outline-none focus:ring-2 focus:ring-ink/10 aria-[invalid=true]:border-danger aria-[invalid=true]:ring-danger";

export const chip = (selected: boolean) =>
  `stitch inline-flex h-9 items-center gap-1 rounded-pill px-4 text-label transition duration-base ease-press active:scale-[0.97] ${
    selected ? "bg-ink text-on-ink" : "border border-line bg-surface text-ink hover:bg-sunk"
  }`;

export const label = "text-label text-ink";
export const meta = "font-mono text-meta text-ink-2";
// Small label above a section, e.g. "Step 1 of 3".
export const eyebrow = "text-eyebrow text-ink-2";
export const card = "stitch stitch-loose rounded-card border border-line bg-surface p-5";
export const page = "mx-auto w-full max-w-[480px] px-5";

export const tagLabel = (tag: string) => {
  const s = tag.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

// "18m", "2h", "3d" for dense rows.
export function timeShort(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  return hrs < 24 ? `${hrs}h` : `${Math.round(hrs / 24)}d`;
}

export function timeAgo(iso: string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return `${Math.round(hrs / 24)} d ago`;
}
