import type { Lifecycle } from '../../data/submissions';
import { lifecycleMeta } from '../../lib/lifecycle';
import { formatDateTime } from '../../lib/format';
import { Button } from '../primitives/Button';
import { StatusBadge } from '../primitives/StatusBadge';

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
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
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

  // Terminal — read-only decision stamp, no re-scoring. The spectrum above
  // already shows the recorded scores.
  if (meta.terminal) {
    return (
      <div className="rounded-xl border border-border bg-surface-sunk px-4 py-4">
        <div className="flex items-center gap-3">
          <StatusBadge label={meta.label} tone={meta.tone} />
          {decidedBy && decidedAt && (
            <span className="font-sans text-[11px] text-muted">
              by {decidedBy} · {formatDateTime(decidedAt)}
            </span>
          )}
        </div>
        <p className="pt-3 text-[12px] leading-[1.5] text-faint">
          This decision is recorded and the scorecard is locked. Re-open from the
          queue to change it.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {status === 'awaiting-candidate' && (
        <div
          className="rounded-xl border border-warn/30 px-3 py-3"
          style={{ background: 'var(--warn-soft)' }}
        >
          <p className="text-[13px] font-medium text-ink">Parked on the candidate</p>
          <p className="pt-1 text-[12px] leading-[1.5] text-muted">
            A missing artifact was requested. The submission re-queues when they
            respond, rather than counting the gap against them.
          </p>
          <button
            type="button"
            onClick={onResume}
            className="mt-2 font-sans text-[11px] uppercase tracking-[0.06em] text-accent-text transition-colors hover:text-ink"
          >
            Return to review
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="eyebrow">Recommendation</span>
      </div>
      <Button variant="primary" size="lg" block onClick={onAdvance}>
        <CheckIcon />
        Advance
      </Button>
      <div className="flex gap-3">
        <Button variant="danger" block onClick={onReject}>
          Reject
        </Button>
        <Button variant="soft" block onClick={onRequestMore}>
          Request more
        </Button>
      </div>
    </div>
  );
}
