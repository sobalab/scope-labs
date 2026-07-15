import type { Submission } from '../data/submissions';
import { StatusBadge } from './primitives/StatusBadge';
import { lifecycleMeta } from '../lib/lifecycle';
import { timeSince, formatDateTime } from '../lib/format';

interface ContextHeaderProps {
  submission: Submission;
  onBack?: () => void;
}

// Full-width frosted header spanning both columns — the top of the split
// primitive. Floats over the gradient ground, so it takes a light frost with a
// hairline underline (system treatment for glass chrome). Identity leads; the
// status and timestamps sit right, timestamps in mono as data readouts.
export function ContextHeader({ submission, onBack }: ContextHeaderProps) {
  const meta = lifecycleMeta[submission.status];
  return (
    <header
      className="border-b border-border px-8 pb-6 pt-6"
      style={{
        background: 'var(--glass-light-bg)',
        backdropFilter: 'var(--blur-soft)',
        WebkitBackdropFilter: 'var(--blur-soft)',
      }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mb-5 inline-flex items-center gap-2 text-[12px] font-medium text-muted transition-colors hover:text-ink"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Review queue
        </button>
      )}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-sans text-[15px] font-normal text-white"
            style={{
              background: 'linear-gradient(150deg, #5a7183, #3f5666)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.35)',
            }}
            aria-hidden="true"
          >
            {submission.candidate.initials}
          </div>
          <div className="min-w-0">
            <h1 className="text-[24px] font-medium leading-[1.1] tracking-[-0.01em] text-ink">
              {submission.candidate.name}
            </h1>
            <p className="pt-[3px] text-[13.5px] leading-[1.35] text-muted">
              {submission.role} · {submission.challengeTitle}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-[7px] sm:items-end">
          <StatusBadge label={meta.label} tone={meta.tone} />
          <p className="font-sans text-[11px] text-muted">
            submitted {timeSince(submission.submittedAt)}
          </p>
          {submission.decidedBy && submission.decidedAt && (
            <p className="font-sans text-[11px] text-muted">
              {meta.label.toLowerCase()} by {submission.decidedBy} · {formatDateTime(submission.decidedAt)}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
