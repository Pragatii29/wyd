// Frosted pill on the dark hero.
const GLASS = "border border-on-brand/25 bg-on-brand/10 text-on-brand backdrop-blur-xl";

// A slow, endless strip of example plans on the dark hero: shows what WYD? is for before anyone reads a word.
const PLANS = [
  { text: "Chai at a tapri, 5pm?", tone: GLASS },
  { text: "Sunset walk at Cubbon Park", tone: "bg-on-brand text-brand" },
  { text: "Need 2 more for box cricket", tone: GLASS },
  { text: "Trying that new café in Indiranagar", tone: GLASS },
  { text: "Stand-up show tonight, 1 extra ticket", tone: "bg-on-brand text-brand" },
  { text: "Board games + coffee, HSR", tone: GLASS },
  { text: "Nandi Hills sunrise ride", tone: GLASS },
];

export function PlanTicker() {
  const row = [...PLANS, ...PLANS];
  return (
    <div className="relative overflow-hidden py-2" aria-hidden>
      <div className="animate-marquee flex w-max gap-3">
        {row.map((p, i) => (
          <span
            key={i}
            className={`shrink-0 rounded-pill px-5 py-3 text-label ${p.tone}`}
          >
            {p.text}
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-brand to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-brand to-transparent" />
    </div>
  );
}
