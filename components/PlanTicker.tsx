// A slow, endless strip of example plans: shows what WYD? is for before anyone reads a word.
const PLANS = [
  { text: "Chai at a tapri, 5pm?", tone: "bg-candle text-on-light" },
  { text: "Sunset walk at Cubbon Park", tone: "bg-coral text-on-light" },
  { text: "Need 2 more for box cricket", tone: "bg-night text-bone" },
  { text: "Trying that new café in Indiranagar", tone: "bg-bone text-on-light border border-line" },
  { text: "Stand-up show tonight, 1 extra ticket", tone: "bg-candle text-on-light" },
  { text: "Board games + coffee, HSR", tone: "bg-coral text-on-light" },
  { text: "Nandi Hills sunrise ride", tone: "bg-night text-bone" },
];

export function PlanTicker() {
  const row = [...PLANS, ...PLANS];
  return (
    <div className="relative overflow-hidden py-2" aria-hidden>
      <div className="animate-marquee flex w-max gap-3">
        {row.map((p, i) => (
          <span
            key={i}
            className={`shrink-0 rounded-pill px-5 py-3 text-label ${p.tone} ${i % 2 ? "-rotate-1" : "rotate-1"}`}
          >
            {p.text}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-canvas to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-canvas to-transparent" />
    </div>
  );
}
