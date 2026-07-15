import type { Submission } from '../data/submissions';
import { StatusBadge } from './primitives/StatusBadge';
import { lifecycleMeta } from '../lib/lifecycle';
import { timeSince, formatDateTime } from '../lib/format';

interface ContextHeaderProps {
  submission: Submission;
  onBack?: () => void;
}

// Full-width context row spanning both columns. Identity, role, challenge,
// status, and time-since-submitted. This is the top of the split primitive.
export function ContextHeader({ submission, onBack }: ContextHeaderProps) {
  const meta = lifecycleMeta[submission.status];
  return (
    <header className="bg-surface px-32 pb-32 pt-24">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-16 inline-flex items-center gap-8 text-[13px] font-medium text-muted transition-colors hover:text-ink"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Review queue
        </button>
      )}
      <div className="flex flex-wrap items-start justify-between gap-24">
        <div className="flex items-start gap-16">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-mono text-[15px] font-medium text-accent"
            aria-hidden="true"
          >
            {submission.candidate.initials}
          </div>
          <div className="space-y-4">
            <h1 className="text-[26px] font-medium leading-[1.1] tracking-[-0.01em] text-ink">
              {submission.candidate.name}
            </h1>
            <p className="text-[14px] text-muted">
              {submission.role}
            </p>
            <p className="pt-4 text-[14px] text-body">
              Challenge: <span className="text-ink">{submission.challengeTitle}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-8 sm:items-end">
          <StatusBadge label={meta.label} tone={meta.tone} />
          <p className="text-[13px] text-muted">
            Submitted {timeSince(submission.submittedAt)}
          </p>
          {submission.decidedBy && submission.decidedAt && (
            <p className="text-[13px] text-muted">
              {meta.label} by {submission.decidedBy} on {formatDateTime(submission.decidedAt)}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
