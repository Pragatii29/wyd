import { useId } from "react";

// The four-point sparkle cut into the D (centre 82,24).
const SPARKLE = "M82 13.5 Q83.6 22.4 92.5 24 Q83.6 25.6 82 34.5 Q80.4 25.6 71.5 24 Q80.4 22.4 82 13.5 Z";

// WYD wordmark: bubbly letters drawn as thick rounded strokes so W and Y melt together,
// with a sparkle punched through the D (the page shows through it). Colour = currentColor.
// `spark` fills the sparkle with the rose → gold shimmer instead of leaving it see-through; `twinkle` animates it.
export function Logo({
  className = "h-7 w-auto",
  spark = false,
  twinkle = false,
  title = "WYD?",
}: {
  className?: string;
  spark?: boolean;
  twinkle?: boolean;
  title?: string;
}) {
  const id = useId();
  const mask = `${id}-m`;
  const shine = `${id}-s`;
  return (
    <svg viewBox="0 0 104 48" className={className} role="img" aria-label={title} fill="none">
      <defs>
        <linearGradient id={shine} x1="72" y1="14" x2="92" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF3D9A" />
          <stop offset="0.5" stopColor="#FFA37A" />
          <stop offset="1" stopColor="#F7CF7A" />
        </linearGradient>
      </defs>
      <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="104" height="48">
        <rect width="104" height="48" fill="#fff" />
        <path d={SPARKLE} fill="#000" className={twinkle ? "animate-twinkle" : undefined} />
      </mask>
      <g mask={`url(#${mask})`}>
        {/* W + Y as one rounded stroke so they join like the inspo */}
        <path
          d="M8.5 10 L15 37 L22.5 17.5 L30 37 L36.5 10 M44 10 L51.5 23.5 L59 10 M51.5 23.5 V37.5"
          stroke="currentColor"
          strokeWidth="13"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* D */}
        <path
          d="M69 7 H80 A17 17 0 0 1 80 41 H69 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
        />
      </g>
      {spark && <path d={SPARKLE} fill={`url(#${shine})`} className={twinkle ? "animate-twinkle" : undefined} />}
    </svg>
  );
}

// Glitter positions: a fixed pseudo-random scatter, so server and browser render the same thing.
const GLITTER_COLOURS = ["#FFFFFF", "#FFD9E8", "#F7CF7A", "#FF7AB8", "#C9B5FF", "#9FF3E6"];
const GLITTER = Array.from({ length: 46 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return {
    left: `${(r(1) * 100).toFixed(2)}%`,
    top: `${(r(2) * 100).toFixed(2)}%`,
    size: 1 + Math.round(r(3) * 2.4),
    colour: GLITTER_COLOURS[Math.floor(r(4) * GLITTER_COLOURS.length)],
    d: `${(2.2 + r(5) * 3).toFixed(2)}s`,
    delay: `${(-r(6) * 5).toFixed(2)}s`,
  };
});

// A few bigger four-point stars with a soft halo.
const STARS = [
  { left: "12%", top: "16%", size: 14, delay: "0s" },
  { left: "86%", top: "28%", size: 10, delay: "-1.2s" },
  { left: "72%", top: "70%", size: 16, delay: "-2.4s" },
  { left: "22%", top: "82%", size: 9, delay: "-0.6s" },
  { left: "50%", top: "6%", size: 8, delay: "-1.8s" },
];

// The nebula backdrop from the inspo boards: rose/gold/magenta clouds through a fine screen grid,
// faint diagonal light streaks, twinkling glitter and a few sparkles. Put it inside a
// `relative overflow-hidden` box on a --brand background.
export function Nebula({ className = "", streaks = true }: { className?: string; streaks?: boolean }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="nebula-glow">
        <div className="nebula-clouds" />
      </div>
      {streaks && <div className="nebula-streaks" />}
      {GLITTER.map((g, i) => (
        <span
          key={i}
          className="glitter"
          style={{
            left: g.left,
            top: g.top,
            width: g.size,
            height: g.size,
            background: g.colour,
            boxShadow: `0 0 ${g.size * 3}px ${g.colour}`,
            ["--d" as string]: g.d,
            ["--delay" as string]: g.delay,
          }}
        />
      ))}
      {STARS.map((st, i) => (
        <svg
          key={i}
          viewBox="71.5 13.5 21 21"
          width={st.size}
          height={st.size}
          className="glitter"
          style={{ left: st.left, top: st.top, filter: "drop-shadow(0 0 6px #FFD9E8)", ["--d" as string]: "4s", ["--delay" as string]: st.delay }}
        >
          <path d={SPARKLE} fill="#FFF6F9" />
        </svg>
      ))}
    </div>
  );
}
