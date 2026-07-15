import type { Lifecycle } from '../../data/submissions';
import { lifecycleMeta } from '../../lib/lifecycle';
import { formatDateTime } from '../../lib/format';

interface DecisionActionsProps {
  status: Lifecycle;
  decidedBy?: string;
  decidedAt?: string;
  onAdvance: () => void;
  onReject: () => void;
  onRequestMore: () => void;
  onResume: () => void;
}

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function DecisionActions({
  status,
  decidedBy,
  decidedAt,
  onAdvance,
  onReject,
  onRequestMore,
  onResume,
}: DecisionActionsProps) {
  const meta = lifecycleMeta[status];

  // Terminal — read-only decision stamp, no re-scoring.
  if (meta.terminal) {
    const tone = status === 'advanced' ? 'text-ok' : 'text-danger';
    return (
      <div className="rounded-lg border border-border bg-surface-sunk px-16 py-16">
        <p className={`flex items-center gap-8 text-[14px] font-medium ${tone}`}>
          {status === 'advanced' && <CheckIcon />}
          {meta.label}
        </p>
        {decidedBy && decidedAt && (
          <p className="pt-4 text-[12px] text-muted">
            by {decidedBy} on {formatDateTime(decidedAt)}
          </p>
        )}
        <p className="pt-12 text-[12px] leading-[1.5] text-faint">
          This decision is recorded. The scorecard is locked. Re-open from the
          queue to change it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {status === 'awaiting-candidate' && (
        <div className="rounded-lg border border-warn/30 bg-warn-soft/40 px-12 py-12">
          <p className="text-[13px] font-medium text-ink">Parked on the candidate</p>
          <p className="pt-4 text-[12px] leading-[1.5] text-muted">
            A missing artifact was requested. The submission re-queues when they
            respond, rather than being penalized for the gap.
          </p>
          <button
            type="button"
            onClick={onResume}
            className="mt-8 text-[12px] font-medium text-accent transition-colors hover:text-accent-hover"
          >
            Return to review
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={onAdvance}
        className="flex w-full items-center justify-center gap-8 rounded-lg bg-accent px-16 py-12 text-[14px] font-medium text-accent-ink transition-colors hover:bg-accent-hover"
      >
        <CheckIcon />
        Advance
      </button>
      <div className="flex gap-12">
        <button
          type="button"
          onClick={onReject}
          className="flex-1 rounded-lg border border-border-strong bg-surface px-16 py-12 text-[14px] font-medium text-ink transition-colors hover:border-danger hover:text-danger"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={onRequestMore}
          className="flex-1 rounded-lg border border-border-strong bg-surface px-16 py-12 text-[14px] font-medium text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Request more
        </button>
      </div>
    </div>
  );
}
