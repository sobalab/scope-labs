import type { Submission } from '../../data/submissions';
import { EmptyState } from '../primitives/EmptyState';
import { Skeleton } from '../primitives/Skeleton';

interface LoomEmbedProps {
  loom: Submission['loom'];
  onRequest: () => void;
  onRetry: () => void;
}

export function LoomEmbed({ loom, onRequest, onRetry }: LoomEmbedProps) {
  if (loom.state === 'loading') {
    return <Skeleton className="aspect-[16/9] w-full" />;
  }

  if (loom.state === 'empty') {
    return (
      <EmptyState
        type="loom"
        action={{ label: 'Nudge for a walkthrough', onClick: onRequest }}
      />
    );
  }

  if (loom.state === 'error') {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-danger/25 bg-danger-soft/40 px-4 py-6">
        <div className="space-y-1">
          <p className="text-[14px] font-medium text-ink">Video removed or private</p>
          <p className="max-w-[46ch] text-[13px] leading-[1.5] text-muted">
            The walkthrough no longer resolves. It was likely deleted or set to
            private after submission.
          </p>
          {loom.url && (
            <p className="pt-1 font-mono text-[12px] text-faint">{loom.url}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-border-strong bg-surface px-3 py-[7px] text-[13px] font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Re-request walkthrough
        </button>
      </div>
    );
  }

  // populated — faux player poster with a play affordance.
  return (
    <a
      href={loom.url}
      target="_blank"
      rel="noreferrer"
      className="group relative block aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-surface-sunk"
    >
      <div className="absolute inset-0 flex flex-col gap-3 p-6 opacity-60">
        <div className="h-8 w-1/4 rounded bg-accent-soft" />
        <div className="flex-1 rounded-lg border border-border bg-surface" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-ink shadow-lg transition-transform group-hover:scale-105">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      <span className="absolute bottom-3 left-3 rounded-md bg-ink/75 px-2 py-1 text-[11px] font-medium text-white">
        Walkthrough, 4:12
      </span>
    </a>
  );
}
