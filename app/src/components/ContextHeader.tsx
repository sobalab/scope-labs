import type { Submission } from '../data/submissions';
import { suggestedTimeMinutes } from '../data/submissions';
import { StatusBadge } from './primitives/StatusBadge';
import { ProfileLinks } from './ProfileLinks';
import { ThemeToggle } from './ThemeToggle';
import { CandidateNav } from './CandidateNav';
import { lifecycleMeta } from '../lib/lifecycle';
import { timeSince, formatDateTime, formatDuration } from '../lib/format';

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-faint">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

interface ContextHeaderProps {
  submission: Submission;
  onBack?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  submissions: Submission[];
  onSelect: (id: string) => void;
}

// Full-width frosted header spanning both columns — the top of the split
// primitive. Floats over the gradient ground, so it takes a light frost with a
// hairline underline (system treatment for glass chrome). Identity leads; the
// status and timestamps sit right, timestamps in mono as data readouts.
export function ContextHeader({
  submission,
  onBack,
  theme,
  onToggleTheme,
  submissions,
  onSelect,
}: ContextHeaderProps) {
  const meta = lifecycleMeta[submission.status];
  return (
    <header
      className="relative z-30 rounded-b-3xl border border-t-0 px-8 pb-6 pt-6"
      style={{
        background: 'var(--glass-light-bg)',
        backdropFilter: 'var(--blur-strong)',
        WebkitBackdropFilter: 'var(--blur-strong)',
        borderColor: 'var(--glass-light-border)',
        boxShadow: 'var(--shadow-glass)',
      }}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2 text-[12px] font-medium text-muted transition duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-ink active:scale-[0.97]"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:-translate-x-[2px]">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Review queue
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          <CandidateNav
            submissions={submissions}
            activeId={submission.id}
            onSelect={onSelect}
          />
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
      <div key={submission.id} className="fade-in flex items-start gap-4">
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
        {/* Everything textual shares this column, so when the meta block wraps
            below on narrow widths it stays aligned under the name, not the avatar. */}
        <div className="flex min-w-0 flex-1 flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <h1 className="text-[24px] font-medium leading-[1.1] tracking-[-0.01em] text-ink">
              {submission.candidate.name}
            </h1>
            <p className="pt-[3px] text-[13.5px] leading-[1.35] text-muted">
              {submission.role} · {submission.challengeTitle}
            </p>
            <div className="pt-4">
              <ProfileLinks
                name={submission.candidate.name}
                links={submission.candidate.links}
              />
            </div>
          </div>
          <div className="flex flex-col items-start gap-[7px] lg:items-end">
            <StatusBadge label={meta.label} tone={meta.tone} />
          <div className="flex items-center gap-[6px] lg:justify-end">
            <ClockIcon />
            <span className="text-[13px] font-medium text-ink">
              {formatDuration(submission.timeSpentMinutes)}
            </span>
            <span className="text-[12px] text-muted">worked</span>
            <span
              className={
                submission.timeSpentMinutes > suggestedTimeMinutes
                  ? 'text-[11px] text-warn'
                  : 'text-[11px] text-faint'
              }
            >
              {submission.timeSpentMinutes > suggestedTimeMinutes ? 'over' : 'within'}{' '}
              the {formatDuration(suggestedTimeMinutes)} guide
            </span>
          </div>
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
      </div>
    </header>
  );
}
