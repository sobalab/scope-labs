import type { Tone } from '../../lib/lifecycle';

// Mono, uppercase status pill — the system's Badge. Near-monochrome; tone shifts
// the fill, never loud. "ink" is the one solid, decisive pill (advanced).
const toneClasses: Record<Tone, string> = {
  neutral: 'bg-pill-neutral text-muted',
  accent: 'bg-accent-soft text-accent-text',
  ink: 'bg-ink text-[var(--surface)]',
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
};

interface StatusBadgeProps {
  label: string;
  tone?: Tone;
}

export function StatusBadge({ label, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-[11px] py-[5px] font-sans text-[11px] font-normal uppercase leading-none tracking-[0.04em] ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
