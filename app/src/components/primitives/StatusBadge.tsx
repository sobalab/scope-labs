import type { Tone } from '../../lib/lifecycle';

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-surface-sunk text-muted border-border',
  accent: 'bg-accent-soft text-accent border-accent-line',
  ok: 'bg-ok-soft text-ok border-transparent',
  warn: 'bg-warn-soft text-warn border-transparent',
  danger: 'bg-danger-soft text-danger border-transparent',
};

const dotClasses: Record<Tone, string> = {
  neutral: 'bg-faint',
  accent: 'bg-accent',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
};

interface StatusBadgeProps {
  label: string;
  tone?: Tone;
  dot?: boolean;
}

export function StatusBadge({ label, tone = 'neutral', dot = true }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-[6px] rounded-full border px-[10px] py-[3px] text-[12px] font-medium leading-none ${toneClasses[tone]}`}
    >
      {dot && <span className={`h-[6px] w-[6px] rounded-full ${dotClasses[tone]}`} />}
      {label}
    </span>
  );
}
