export type EmptyType = 'loom' | 'demo' | 'description' | 'gallery' | 'readme';

interface EmptyStateProps {
  type: EmptyType;
  // The request CTA. Omitted where a request makes no sense.
  action?: { label: string; onClick: () => void };
  // A gap that reflects on the candidate (missing approach, missing README)
  // reads as signal, not a neutral absence. Everywhere else stays neutral.
  signal?: boolean;
}

const copy: Record<EmptyType, { title: string; detail: string }> = {
  description: {
    title: 'No approach written',
    detail: 'This candidate did not explain their reasoning. Treat the absence as a gap.',
  },
  readme: {
    title: 'README missing',
    detail: 'The repository has no README. For this role that is itself a signal.',
  },
  demo: {
    title: 'No demo deployed',
    detail: 'The candidate did not include a live demo.',
  },
  loom: {
    title: 'No walkthrough',
    detail: 'The candidate did not record a video walkthrough.',
  },
  gallery: {
    title: 'No screenshots',
    detail: 'The candidate did not attach any images.',
  },
};

// One component absorbs every "missing" case. Copy and CTA differ by prop.
// Neutral and actionable, never editorializing about the candidate.
export function EmptyState({ type, action, signal = false }: EmptyStateProps) {
  const { title, detail } = copy[type];
  return (
    <div
      className={[
        'flex flex-col items-start gap-3 rounded-lg border border-dashed px-4 py-6',
        signal ? 'border-warn/40 bg-warn-soft/30' : 'border-border bg-surface-sunk',
      ].join(' ')}
    >
      <div className="space-y-1">
        <p className="flex items-center gap-2 text-[14px] font-medium text-ink">
          {signal && (
            <span
              className="h-[7px] w-[7px] rounded-full bg-warn"
              role="img"
              aria-label="Gap"
            />
          )}
          {title}
        </p>
        <p className="max-w-[42ch] text-[13px] leading-[1.5] text-muted">{detail}</p>
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="rounded-md border border-border-strong bg-surface px-3 py-[7px] text-[13px] font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
