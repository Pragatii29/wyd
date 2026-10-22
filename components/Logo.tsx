import { useId } from "react";

// The four-point sparkle cut into the D (centre 82,24).
const SPARKLE = "M82 13.5 Q83.6 22.4 92.5 24 Q83.6 25.6 82 34.5 Q80.4 25.6 71.5 24 Q80.4 22.4 82 13.5 Z";

// WYD wordmark: bubbly letters drawn as thick rounded strokes so W and Y melt together,
// with a sparkle punched through the D (the page shows through it). Colour = currentColor.
// `spark` fills the sparkle with the accent instead of leaving it see-through; `twinkle` animates it.
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
  const mask = useId();
  return (
    <svg viewBox="0 0 104 48" className={className} role="img" aria-label={title} fill="none">
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
      {spark && <path d={SPARKLE} fill="var(--coral)" className={twinkle ? "animate-twinkle" : undefined} />}
    </svg>
  );
}

// The halftone glow from the brand inspo. Place inside a `relative overflow-hidden` box.
export function Halftone({ className = "" }: { className?: string }) {
  return (
    <div className={`halftone ${className}`} aria-hidden>
      <div className="halftone-glow" />
    </div>
  );
}
