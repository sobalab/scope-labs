import { Button } from './Button';

export type EmptyType = 'loom' | 'demo' | 'description' | 'gallery' | 'readme';

interface EmptyStateProps {
  type: EmptyType;
  // The request CTA. Omitted where a request makes no sense.
  action?: { label: string; onClick: () => void };
  // A gap that reflects on the candidate (missing approach, missing README)
  // reads as signal, not a neutral absence. Everywhere else stays neutral.
  signal?: boolean;
}

// Nudges, not errors — the system phrases missing states as gentle suggestions.
// One component absorbs every "missing" case; copy and CTA differ by prop.
const copy: Record<EmptyType, { title: string; detail: string }> = {
  description: {
    title: 'No written approach yet',
    detail:
      'A short note on their thinking would help place this submission. The absence is worth weighing.',
  },
  readme: {
    title: 'No README in the repo',
    detail: 'For this role, a missing README is itself a signal.',
  },
  demo: {
    title: 'No demo deployed',
    detail: 'Nothing to preview here. You can ask for a deployed link.',
  },
  loom: {
    title: 'No walkthrough',
    detail: 'The candidate did not record one.',
  },
  gallery: {
    title: 'No screenshots',
    detail: 'No images were attached to this submission.',
  },
};

export function EmptyState({ type, action, signal = false }: EmptyStateProps) {
  const { title, detail } = copy[type];
  return (
    <div
      className={[
        'flex flex-col items-start gap-3 rounded-xl border border-dashed px-4 py-6',
        signal ? 'border-warn/40' : 'border-border-strong bg-surface-sunk',
      ].join(' ')}
      style={signal ? { background: 'var(--warn-soft)' } : undefined}
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
        <p className="max-w-[46ch] text-[13px] leading-[1.5] text-muted">{detail}</p>
      </div>
      {action && (
        <Button variant="soft" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
