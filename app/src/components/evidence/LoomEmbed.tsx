import type { Submission } from '../../data/submissions';
import { EmptyState } from '../primitives/EmptyState';
import { Skeleton } from '../primitives/Skeleton';
import { Button } from '../primitives/Button';
import { MockAppScreen } from './MockAppScreen';

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
            <p className="pt-1 font-sans text-[12px] text-faint">{loom.url}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onRetry}>
          Re-request walkthrough
        </Button>
      </div>
    );
  }

  // populated — a poster still of the walkthrough (the candidate's app on
  // screen), with a play affordance and a fixed dark scrim behind the runtime.
  return (
    <a
      href={loom.url}
      target="_blank"
      rel="noreferrer"
      className="group relative block aspect-[16/9] w-full overflow-hidden rounded-xl border border-border bg-surface-sunk"
    >
      <MockAppScreen
        seed={loom.url ?? 'loom'}
        title="Console"
        className="absolute inset-0 transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] group-hover:scale-[1.03]"
      />
      <div
        className="absolute inset-0 transition-colors"
        style={{ background: 'rgba(20,30,45,.34)' }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-transform group-hover:scale-105"
          style={{ background: 'rgba(20,30,45,.72)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </div>
      <span
        className="absolute bottom-3 left-3 rounded-md px-2 py-1 text-[11px] font-medium text-white"
        style={{ background: 'rgba(20,30,45,.72)' }}
      >
        Walkthrough, 4:12
      </span>
    </a>
  );
}
