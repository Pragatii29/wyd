// Shared class strings for DESIGN.md components.
const base =
  "inline-flex items-center justify-center gap-2 rounded-pill text-label transition duration-fast ease-out active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:pointer-events-none disabled:bg-sunk disabled:text-ink-3";

export const btn = {
  primary: `${base} h-13 w-full bg-ink px-6 text-bone hover:brightness-110`,
  secondary: `${base} h-13 w-full border border-line bg-surface px-6 text-ink hover:brightness-95`,
  danger: `${base} h-13 w-full border border-danger bg-surface px-6 text-danger hover:brightness-95`,
  ghost: `${base} px-2 text-coral-text hover:underline`,
};

export const input =
  "h-12 w-full rounded-sm border border-line bg-surface px-4 text-body text-ink placeholder:text-ink-3 focus:border-2 focus:border-ink focus:outline-none aria-[invalid=true]:border-danger";

export const chip = (selected: boolean) =>
  `inline-flex h-8 items-center gap-1 rounded-pill px-3 text-label transition duration-base ease-out ${
    selected ? "bg-ink text-bone" : "bg-sunk text-ink"
  }`;

export const label = "text-label text-ink";
export const meta = "font-mono text-meta text-ink-2";
export const card = "rounded-card bg-surface p-4 shadow-card";

export const tagLabel = (tag: string) => {
  const s = tag.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};
