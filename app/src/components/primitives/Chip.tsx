interface ChipProps {
  label: string;
}

// The system's Tag: a soft-cornered metadata chip, quieter than a Badge.
// Sans, muted, hairline border on white. The mono is reserved for genuine data
// readouts (commit counts, percentages), not names.
export function Chip({ label }: ChipProps) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-surface px-[9px] py-[4px] font-sans text-[12px] leading-none text-muted">
      {label}
    </span>
  );
}
