// Shared class strings for DESIGN.md components.
// Flat surfaces, pill buttons with a springy press, sand-filled fields (see DESIGN.md §5).
const base =
  "inline-flex items-center justify-center gap-2 rounded-pill text-label transition duration-fast ease-press active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:bg-sunk disabled:text-ink-3";

export const btn = {
  primary: `${base} h-14 w-full bg-ink px-6 text-on-ink hover:opacity-90`,
  secondary: `${base} h-14 w-full border border-line bg-surface px-6 text-ink hover:bg-sunk`,
  danger: `${base} h-14 w-full border border-danger bg-surface px-6 text-danger hover:bg-sunk`,
  ghost: `${base} min-h-11 px-2 text-coral-text hover:underline`,
  small: `${base} h-10 border border-line bg-surface px-4 text-ink hover:bg-sunk`,
  smallPrimary: `${base} h-10 bg-ink px-4 text-on-ink hover:opacity-90`,
};

export const input =
  "h-13 w-full rounded-field border-2 border-transparent bg-sunk px-4 text-body text-ink placeholder:text-ink-3 transition duration-base ease-out hover:border-line focus:border-ink focus:bg-surface focus:outline-none aria-[invalid=true]:border-danger";

export const chip = (selected: boolean) =>
  `inline-flex h-9 items-center gap-1 rounded-pill px-4 text-label transition duration-base ease-press active:scale-[0.97] ${
    selected ? "bg-ink text-on-ink" : "border border-line bg-surface text-ink hover:bg-sunk"
  }`;

export const label = "text-label text-ink";
export const meta = "font-mono text-meta text-ink-2";
// Small mono label above a section, e.g. "01 — The basics".
export const eyebrow = "font-mono text-eyebrow text-ink-2";
export const card = "rounded-card border border-line bg-surface p-5";
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
