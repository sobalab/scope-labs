interface RatingControlProps {
  value: number | null;
  max: number;
  onChange?: (value: number) => void;
  // Terminal submissions render the score read-only.
  locked?: boolean;
  label: string;
}

// A 1..max segmented rating. Filled segments use the accent; this is part of
// the decision surface, which is the one place the accent is allowed to carry
// meaning. Locked state shows the recorded score without interaction.
export function RatingControl({
  value,
  max,
  onChange,
  locked = false,
  label,
}: RatingControlProps) {
  return (
    <div
      className="flex gap-[6px]"
      role="radiogroup"
      aria-label={label}
    >
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1;
        const filled = value != null && n <= value;
        const interactive = !locked && onChange;
        return (
          <button
            key={n}
            type="button"
            disabled={locked}
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} of ${max}`}
            onClick={interactive ? () => onChange(n) : undefined}
            className={[
              'h-8 flex-1 rounded-[5px] border transition-colors',
              filled
                ? 'border-accent bg-accent'
                : 'border-border bg-surface-sunk',
              locked
                ? 'cursor-default'
                : 'cursor-pointer hover:border-accent-line',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}
