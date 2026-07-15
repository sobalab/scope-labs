import { useState } from 'react';

interface RatingControlProps {
  value: number | null;
  max: number;
  onChange?: (value: number) => void;
  // Terminal submissions render the score read-only.
  locked?: boolean;
  label: string;
  // What each score means for this criterion, indexed 0..max-1. Surfaced on
  // hover / focus so the reviewer scores against a shared anchor.
  descriptions?: string[];
}

// The system's segmented scale: a hairline-bordered row of numbered cells, the
// chosen value filled with the accent. Hovering or focusing a cell shows the
// rubric anchor for that score, so the number is never scored on gut feel.
export function RatingControl({
  value,
  max,
  onChange,
  locked = false,
  label,
  descriptions,
}: RatingControlProps) {
  const [active, setActive] = useState<number | null>(null);
  const showTip = descriptions && active != null;

  return (
    <div className="relative" onMouseLeave={() => setActive(null)}>
      {showTip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-[212px] rounded-lg px-3 py-[9px] text-[11.5px] leading-[1.4] text-white shadow-lg"
          style={{ background: 'rgba(20,30,45,.94)' }}
        >
          <span className="font-medium">
            {active + 1} of {max}
          </span>
          <span className="mt-[3px] block text-white/85">{descriptions![active]}</span>
        </div>
      )}
      <div
        className="flex overflow-hidden rounded-md border border-border-strong"
        role="radiogroup"
        aria-label={label}
      >
        {Array.from({ length: max }, (_, i) => {
          const n = i + 1;
          const selected = value === n;
          const interactive = !locked && onChange;
          const anchor = descriptions?.[i];
          return (
            <button
              key={n}
              type="button"
              disabled={locked}
              role="radio"
              aria-checked={selected}
              aria-label={anchor ? `${n} of ${max}: ${anchor}` : `${n} of ${max}`}
              onClick={interactive ? () => onChange(n) : undefined}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className={[
                'flex-1 border-r border-border py-[7px] text-center font-sans text-[12px] leading-none transition-colors last:border-r-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-line',
                selected ? 'bg-accent text-[var(--accent-ink)]' : 'text-faint',
                locked
                  ? 'cursor-default'
                  : 'cursor-pointer hover:bg-accent-soft hover:text-accent-text',
              ].join(' ')}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}
