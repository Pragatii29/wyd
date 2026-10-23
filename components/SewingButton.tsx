// A glossy sewing button (the button-box reference): a raised rim, a recessed centre, thread holes,
// and a highlight. `sewn` stitches a thread cross through the holes — the "picked" state.
// Pure SVG, so it scales cleanly and needs no images.

export type ButtonShape = "round" | "flower" | "heart" | "star";

// Colours from the reference: pinks, cocoa browns, cream, caramel and mustard.
export const BUTTON_COLOURS = [
  { base: "#F2A9C0", rim: "#E58AA8", thread: "#FFF6F1" }, // candy pink
  { base: "#7A4E3D", rim: "#5E3A2D", thread: "#F3E3CF" }, // cocoa
  { base: "#F3E7D6", rim: "#E0CDB4", thread: "#7A4E3D" }, // cream
  { base: "#E46F9C", rim: "#CF5687", thread: "#FFF0C9" }, // hot pink
  { base: "#D7B07A", rim: "#BF955F", thread: "#FFF6F1" }, // caramel
  { base: "#F8D5E0", rim: "#EEB9CB", thread: "#7A4E3D" }, // blush
  { base: "#4F3128", rim: "#3A231C", thread: "#F2A9C0" }, // dark chocolate
  { base: "#E7B43F", rim: "#CF9B27", thread: "#FFF6F1" }, // mustard
] as const;

const SHAPES: Record<ButtonShape, string> = {
  round: "M50 4a46 46 0 1 1 0 92a46 46 0 1 1 0-92z",
  // Five rounded petals.
  flower:
    "M50 6c9 0 15 8 14 16c7-6 18-5 22 4c4 9-1 17-9 20c8 3 13 12 8 20c-5 9-15 9-21 3c1 9-5 17-15 17s-16-8-15-17c-6 6-16 6-21-3c-5-8 0-17 8-20c-8-3-13-11-9-20c4-9 15-10 22-4c-1-8 5-16 15-16z",
  heart: "M50 90C22 70 6 54 6 33C6 18 17 8 30 8c9 0 16 5 20 12c4-7 11-12 20-12c13 0 24 10 24 25c0 21-16 37-44 57z",
  // Soft five-point star.
  star: "M50 5c3 0 5 2 6 5l9 19 21 3c6 1 8 8 4 12L74 59l4 21c1 6-5 10-10 7L50 77 32 87c-5 3-11-1-10-7l4-21L10 44c-4-4-2-11 4-12l21-3 9-19c1-3 3-5 6-5z",
};

export function SewingButton({
  shape = "round",
  colour = 0,
  holes = 4,
  sewn = false,
  size = 64,
  className = "",
}: {
  shape?: ButtonShape;
  colour?: number;
  // 0 = no holes (when an icon sits in the centre).
  holes?: 0 | 2 | 4;
  sewn?: boolean;
  size?: number;
  className?: string;
}) {
  const c = BUTTON_COLOURS[colour % BUTTON_COLOURS.length];
  const holeAt = holes === 4 ? [[42, 42], [58, 42], [42, 58], [58, 58]] : holes === 2 ? [[42, 50], [58, 50]] : [];
  const centreY = shape === "heart" ? 46 : shape === "star" ? 54 : 50;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden>
      <g transform={`translate(0 ${centreY - 50})`}>
        {/* soft drop shadow */}
        <path d={SHAPES[shape]} fill="rgba(40,22,16,0.22)" transform="translate(0 3)" />
        {/* rim */}
        <path d={SHAPES[shape]} fill={c.rim} />
        {/* raised face, slightly inset */}
        <path d={SHAPES[shape]} fill={c.base} transform="translate(6 6) scale(0.88)" />
        {/* recessed centre */}
        <circle cx="50" cy="50" r="19" fill={c.rim} opacity="0.55" />
        <circle cx="50" cy="51" r="17" fill={c.base} />
        {/* holes */}
        {holeAt.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="4.2" fill="rgba(40,22,16,0.55)" />
        ))}
        {/* thread: a stitched cross through the holes */}
        {sewn &&
          holes > 0 &&
          (holes === 4 ? (
            <g stroke={c.thread} strokeWidth="3.6" strokeLinecap="round">
              <path d="M42 42L58 58" />
              <path d="M58 42L42 58" />
            </g>
          ) : (
            <path d="M42 50H58" stroke={c.thread} strokeWidth="3.6" strokeLinecap="round" />
          ))}
        {/* glossy highlight */}
        <path d={SHAPES[shape]} fill="url(#sewing-gloss)" transform="translate(6 6) scale(0.88)" />
      </g>
      <defs>
        <linearGradient id="sewing-gloss" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// A fixed shape/colour for each position, so a grid of buttons looks hand-picked, not random.
export function buttonLook(i: number): { shape: ButtonShape; colour: number; holes: 2 | 4 } {
  const shape: ButtonShape = i % 9 === 4 ? "flower" : i % 9 === 7 ? "heart" : i % 11 === 2 ? "star" : "round";
  return { shape, colour: (i * 3) % BUTTON_COLOURS.length, holes: i % 5 === 3 ? 2 : 4 };
}
