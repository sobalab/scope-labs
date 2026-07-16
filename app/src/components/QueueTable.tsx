import { useState } from 'react';
import type { Lifecycle, Submission } from '../data/submissions';
import { rolePosting } from '../data/submissions';
import { StatusBadge } from './primitives/StatusBadge';
import { ThemeToggle } from './ThemeToggle';
import { ReviewerMenu } from './ReviewerMenu';
import { lifecycleMeta } from '../lib/lifecycle';
import { timeSince } from '../lib/format';

const FILTER_ORDER: Lifecycle[] = [
  'needs-review',
  'in-review',
  'awaiting-candidate',
  'advanced',
  'rejected',
];

interface QueueTableProps {
  submissions: Submission[];
  onOpen: (id: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  // When the current reviewer last opened each candidate, by id.
  lastOpened: Record<string, string>;
}

// A table is right for the queue (rows to scan) and deliberately wrong for the
// individual submission (evidence to read). This is thin, by design: it exists
// to give the showcase an entry context, not to be a second product.
export function QueueTable({
  submissions,
  onOpen,
  theme,
  onToggleTheme,
  lastOpened,
}: QueueTableProps) {
  const open = submissions.filter((s) => !lifecycleMeta[s.status].terminal).length;
  const [filter, setFilter] = useState<Lifecycle | 'all'>('all');

  const count = (status: Lifecycle) =>
    submissions.filter((s) => s.status === status).length;
  const present = FILTER_ORDER.filter((st) => count(st) > 0);
  const rows =
    filter === 'all' ? submissions : submissions.filter((s) => s.status === filter);

  return (
    <div className="app-bg fade-in min-h-screen">
      <div className="mx-auto max-w-[1240px] px-8 py-12">
        <header className="mb-6 flex items-start justify-between gap-4">
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

        <div
          className="mb-4 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by status"
        >
          <FilterPill
            label="All"
            n={submissions.length}
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          {present.map((st) => (
            <FilterPill
              key={st}
              label={lifecycleMeta[st].label}
              n={count(st)}
              active={filter === st}
              onClick={() => setFilter(st)}
            />
          ))}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        <table className="w-full min-w-[780px] table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[24%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[14%]" />
          </colgroup>
          <thead>
            <tr className="text-[12px] uppercase tracking-[0.06em] text-faint">
              <th className="px-6 py-3 font-medium">Candidate</th>
              <th className="px-6 py-3 font-medium">Challenge</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Last reviewed</th>
              <th className="px-6 py-3 text-right font-medium">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const meta = lifecycleMeta[s.status];
              return (
                <tr
                  key={s.id}
                  onClick={() => onOpen(s.id)}
                  className="group cursor-pointer border-t border-border transition-colors hover:bg-surface-sunk active:bg-[var(--pill-neutral)]"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-normal text-white transition-transform duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:scale-110"
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
                  <td className="px-6 py-4 text-[12px]">
                    {lastOpened[s.id] ? (
                      <span className="text-muted">{timeSince(lastOpened[s.id])}</span>
                    ) : (
                      <span className="text-faint">Not opened</span>
                    )}
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

function FilterPill({
  label,
  n,
  active,
  onClick,
}: {
  label: string;
  n: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'inline-flex items-center gap-[7px] rounded-full border px-[14px] py-[7px] text-[13px] transition duration-[var(--dur-fast)] ease-[var(--ease-out)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-line',
        active
          ? 'border-ink bg-ink text-[var(--surface)]'
          : 'border-border-strong bg-surface text-muted hover:text-ink',
      ].join(' ')}
    >
      {label}
      <span className={active ? 'text-white/60' : 'text-faint'}>{n}</span>
    </button>
  );
}
