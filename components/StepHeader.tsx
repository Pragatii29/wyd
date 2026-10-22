import { eyebrow } from "@/lib/ui";

// "01 / 03" + a segmented bar + the step title. Shared by all three sign-up steps.
export function StepHeader({ step, total = 3, title, blurb }: { step: number; total?: number; title: string; blurb?: string }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className={eyebrow}>
          {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <div className="flex flex-1 gap-1.5" aria-hidden>
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-pill transition duration-slow ease-spring ${i < step ? "bg-coral shadow-glow" : "bg-line"}`} />
          ))}
        </div>
      </div>
      <div>
        <h2 className="font-display text-title text-ink">{title}</h2>
        {blurb && <p className="mt-1 text-body text-ink-2">{blurb}</p>}
      </div>
    </div>
  );
}
