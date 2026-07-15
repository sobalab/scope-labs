import { useEffect, useRef, useState } from 'react';
import type { Submission } from '../data/submissions';
import { StatusBadge } from './primitives/StatusBadge';
import { lifecycleMeta } from '../lib/lifecycle';

interface CandidateNavProps {
  submissions: Submission[];
  activeId: string;
  onSelect: (id: string) => void;
}

const Chevron = ({ dir }: { dir: 'left' | 'right' | 'down' }) => {
  const d =
    dir === 'left' ? 'M10 3L5 8l5 5' : dir === 'right' ? 'M6 3l5 5-5 5' : 'M4 6l4 4 4-4';
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

function MiniAvatar({ initials }: { initials: string }) {
  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-medium text-white"
      style={{ background: 'linear-gradient(150deg, #5a7183, #3f5666)' }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

// Move between candidates without returning to the queue: prev/next step through
// the queue order, and the middle opens a jump-to-any menu.
export function CandidateNav({ submissions, activeId, onSelect }: CandidateNavProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const index = submissions.findIndex((s) => s.id === activeId);
  const prev = index > 0 ? submissions[index - 1] : null;
  const next = index < submissions.length - 1 ? submissions[index + 1] : null;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Element)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center rounded-full border border-border-strong bg-surface">
        <button
          type="button"
          disabled={!prev}
          onClick={() => prev && onSelect(prev.id)}
          aria-label={prev ? `Previous candidate, ${prev.candidate.name}` : 'Previous candidate'}
          className="flex h-9 w-9 items-center justify-center rounded-l-full text-muted transition-colors hover:text-ink disabled:cursor-default disabled:text-faint/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-line"
        >
          <Chevron dir="left" />
        </button>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-[6px] border-x border-border px-3 py-[6px] text-[13px] font-medium text-ink transition-colors hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-line"
        >
          {index + 1} of {submissions.length}
          <span className="text-muted">
            <Chevron dir="down" />
          </span>
        </button>
        <button
          type="button"
          disabled={!next}
          onClick={() => next && onSelect(next.id)}
          aria-label={next ? `Next candidate, ${next.candidate.name}` : 'Next candidate'}
          className="flex h-9 w-9 items-center justify-center rounded-r-full text-muted transition-colors hover:text-ink disabled:cursor-default disabled:text-faint/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-line"
        >
          <Chevron dir="right" />
        </button>
      </div>

      {open && (
        <div
          role="menu"
          className="rise scroll-region absolute right-0 top-full z-40 mt-2 max-h-[60vh] w-[300px] overflow-auto rounded-2xl border border-border bg-surface p-2 shadow-[var(--shadow-float)]"
        >
          {submissions.map((s) => {
            const meta = lifecycleMeta[s.status];
            const current = s.id === activeId;
            return (
              <button
                key={s.id}
                type="button"
                role="menuitem"
                onClick={() => go(s.id)}
                aria-current={current}
                className={[
                  'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors',
                  current ? 'bg-accent-soft' : 'hover:bg-surface-sunk',
                ].join(' ')}
              >
                <MiniAvatar initials={s.candidate.initials} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {s.candidate.name}
                  </p>
                  <p className="truncate text-[11px] text-muted">{s.challengeTitle}</p>
                </div>
                <StatusBadge label={meta.label} tone={meta.tone} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
