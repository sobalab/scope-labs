import type { LinkHealth } from '../../data/submissions';
import { healthMeta } from '../../lib/lifecycle';

interface LinkHealthIndicatorProps {
  health: LinkHealth;
  // When true, render just the dot with an accessible label (compact rows).
  compact?: boolean;
}

const dot: Record<LinkHealth, string> = {
  checking: 'bg-faint',
  live: 'bg-ok',
  unreachable: 'bg-danger',
};

const text: Record<LinkHealth, string> = {
  checking: 'text-muted',
  live: 'text-ok',
  unreachable: 'text-danger',
};

// Surfaces link rot before the reviewer clicks. Driven by a fixture field that
// stands in for a pre-checked crawl. "checking" pulses; the others are static.
export function LinkHealthIndicator({ health, compact }: LinkHealthIndicatorProps) {
  const meta = healthMeta[health];
  const pulse = health === 'checking' ? 'animate-pulse' : '';
  if (compact) {
    return (
      <span
        className={`inline-block h-[7px] w-[7px] rounded-full ${dot[health]} ${pulse}`}
        role="img"
        aria-label={meta.label}
      />
    );
  }
  return (
    <span className={`inline-flex items-center gap-[6px] text-[12px] font-medium ${text[health]}`}>
      <span className={`h-[7px] w-[7px] rounded-full ${dot[health]} ${pulse}`} />
      {meta.label}
    </span>
  );
}
