import { useId } from "react";
import { SewingButton, type ButtonShape } from "@/components/SewingButton";

// The four-point sparkle cut into the D (centre 82,24).
const SPARKLE = "M82 13.5 Q83.6 22.4 92.5 24 Q83.6 25.6 82 34.5 Q80.4 25.6 71.5 24 Q80.4 22.4 82 13.5 Z";

// WYD? wordmark: bubbly letters drawn as thick rounded strokes so W and Y melt together,
// with a sparkle punched through the D (the page shows through it). Colour = currentColor.
// `spark` fills the sparkle with a blush → sand tint instead of leaving it see-through; `twinkle` animates it.
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
    <svg viewBox="0 0 132 48" className={className} role="img" aria-label={title} fill="none">
      <defs>
        <linearGradient id={shine} x1="72" y1="14" x2="92" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E3A9A6" />
          <stop offset="1" stopColor="#EBCFAE" />
        </linearGradient>
      </defs>
      <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="132" height="48">
        <rect width="132" height="48" fill="#fff" />
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
        {/* ? in the same rounded stroke, a touch lighter so it reads as punctuation */}
        <path
          d="M107 15 C107 9.5 111.5 6.5 116 6.5 C121 6.5 124.5 10 124.5 14.5 C124.5 19 121.5 21 118.5 22.5 C116.5 23.5 115.5 25 115.5 28"
          stroke="currentColor"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="115.5" cy="39" r="5.5" fill="currentColor" />
      </g>
      {spark && <path d={SPARKLE} fill={`url(#${shine})`} className={twinkle ? "animate-twinkle" : undefined} />}
    </svg>
  );
}

// The hazy backdrop from the luxury references: big soft blush, sand and cocoa light drifting
// slowly, an optional glossy blush sphere, a fine film grain and a few floating sewing buttons. Put it inside a
// `relative overflow-hidden` box on a --brand background.
// A few sewing buttons drifting near the edges (the button-box theme), kept clear of the centre text.
const FLOATERS: { left: string; top: string; size: number; shape: ButtonShape; colour: number; r: string; d: string; delay: string }[] = [
  { left: "6%", top: "9%", size: 46, shape: "round", colour: 0, r: "-14deg", d: "7s", delay: "0s" },
  { left: "78%", top: "14%", size: 38, shape: "flower", colour: 2, r: "10deg", d: "8s", delay: "-2s" },
  { left: "-3%", top: "62%", size: 54, shape: "round", colour: 1, r: "8deg", d: "9s", delay: "-4s" },
  { left: "84%", top: "70%", size: 42, shape: "heart", colour: 3, r: "-8deg", d: "7.5s", delay: "-1s" },
  { left: "14%", top: "84%", size: 30, shape: "star", colour: 7, r: "16deg", d: "6.5s", delay: "-3s" },
];

export function Haze({ className = "", sphere = true, buttons = true }: { className?: string; sphere?: boolean; buttons?: boolean }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="haze-orb -right-24 -top-24 size-80" style={{ background: "var(--haze-1)" }} />
      <div className="haze-orb -left-28 top-1/3 size-72" style={{ background: "var(--haze-2)", animationDelay: "-12s" }} />
      <div className="haze-orb -bottom-24 right-0 size-72" style={{ background: "var(--haze-3)", animationDelay: "-20s" }} />
      {sphere && <div className="haze-sphere -right-20 top-[58%] size-40 opacity-70" />}
      <div className="haze-grain" />
      {buttons &&
        FLOATERS.map((f, i) => (
          <span
            key={i}
            className="animate-bob absolute opacity-90 drop-shadow-[0_10px_18px_rgba(0,0,0,0.25)]"
            style={{ left: f.left, top: f.top, ["--r" as string]: f.r, ["--d" as string]: f.d, ["--delay" as string]: f.delay }}
          >
            <SewingButton shape={f.shape} colour={f.colour} size={f.size} holes={f.shape === "heart" ? 2 : 4} />
          </span>
        ))}
    </div>
  );
}
