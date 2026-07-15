interface ChipProps {
  label: string;
}

// Tech-stack chip. Mono, because it carries a framework or language name and
// the mono is doing real work here, not decoration.
export function Chip({ label }: ChipProps) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-surface-sunk px-[10px] py-[5px] font-mono text-[12px] leading-none text-body">
      {label}
    </span>
  );
}
