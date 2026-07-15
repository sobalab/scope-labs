interface RatingControlProps {
  value: number | null;
  max: number;
  onChange?: (value: number) => void;
  // Terminal submissions render the score read-only.
  locked?: boolean;
  label: string;
}

// The system's segmented scale: a hairline-bordered row of numbered cells, the
// chosen value filled with the accent. Reads as a discrete pick, and the number
// stays visible so the score is legible without a separate readout. Locked
// state shows the recorded value without interaction.
export function RatingControl({
  value,
  max,
  onChange,
  locked = false,
  label,
}: RatingControlProps) {
  return (
    <div
      className="flex overflow-hidden rounded-md border border-border-strong"
      role="radiogroup"
      aria-label={label}
    >
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const selected = value === n;
        const interactive = !locked && onChange;
        return (
          <button
            key={n}
            type="button"
            disabled={locked}
            role="radio"
            aria-checked={selected}
            aria-label={`${n} of ${max}`}
            onClick={interactive ? () => onChange(n) : undefined}
            className={[
              'flex-1 border-r border-border py-[7px] text-center font-sans text-[12px] leading-none transition-colors last:border-r-0',
              selected
                ? 'bg-accent text-[var(--accent-ink)]'
                : 'text-faint',
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
  );
}
