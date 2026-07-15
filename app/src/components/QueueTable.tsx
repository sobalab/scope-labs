import type { Submission } from '../data/submissions';
import { rolePosting } from '../data/submissions';
import { StatusBadge } from './primitives/StatusBadge';
import { ThemeToggle } from './ThemeToggle';
import { ReviewerMenu } from './ReviewerMenu';
import { lifecycleMeta } from '../lib/lifecycle';
import { timeSince } from '../lib/format';

interface QueueTableProps {
  submissions: Submission[];
  onOpen: (id: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

// A table is right for the queue (rows to scan) and deliberately wrong for the
// individual submission (evidence to read). This is thin, by design: it exists
// to give the showcase an entry context, not to be a second product.
export function QueueTable({
  submissions,
  onOpen,
  theme,
  onToggleTheme,
}: QueueTableProps) {
  const open = submissions.filter((s) => !lifecycleMeta[s.status].terminal).length;
  return (
    <div className="app-bg min-h-screen">
      <div className="mx-auto max-w-[1240px] px-8 py-12">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[30px] font-medium leading-[1.05] tracking-[-0.015em] text-ink">
              {rolePosting}
            </h1>
            <p className="pt-2 text-[14px] text-muted">
              Review queue. {submissions.length} candidates, {open} still open.
              Pick one to evaluate.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <ReviewerMenu />
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </header>

        <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[640px] table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[38%]" />
            <col className="w-[30%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="text-[12px] uppercase tracking-[0.06em] text-faint">
              <th className="px-6 py-3 font-medium">Candidate</th>
              <th className="px-6 py-3 font-medium">Challenge</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 text-right font-medium">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => {
              const meta = lifecycleMeta[s.status];
              return (
                <tr
                  key={s.id}
                  onClick={() => onOpen(s.id)}
                  className="cursor-pointer border-t border-border transition-colors hover:bg-surface-sunk"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-normal text-white"
                        style={{
                          background: 'linear-gradient(150deg, #5a7183, #3f5666)',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,.35)',
                        }}
                      >
                        {s.candidate.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-medium text-ink">
                          {s.candidate.name}
                        </p>
                        <p className="text-[12px] leading-[1.3] text-muted">{s.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-body">
                    <span className="line-clamp-2">{s.challengeTitle}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge label={meta.label} tone={meta.tone} />
                  </td>
                  <td className="px-6 py-4 text-right font-sans text-[12px] text-muted">
                    {timeSince(s.submittedAt)}
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
