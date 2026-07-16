import { useEffect, useRef, useState } from 'react';
import { currentReviewer, reviewers } from '../data/submissions';

function Avatar({ initials, size = 28 }: { initials: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-medium text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.36),
        background: 'linear-gradient(150deg, #5a7183, #3f5666)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.3)',
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

// The signed-in reviewer's profile, with the rest of the review panel behind a
// popover — several people share this queue, so it is clear who else is on it.
export function ReviewerMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const others = reviewers.filter((r) => r.name !== currentReviewer.name);

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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Signed in as ${currentReviewer.name}. ${others.length} others reviewing`}
        className="flex items-center gap-2 rounded-full border border-border-strong bg-surface py-1 pl-1 pr-3 transition-colors hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-line"
      >
        <Avatar initials={currentReviewer.initials} />
        <span className="text-[13px] font-medium text-ink">{currentReviewer.name}</span>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="text-muted">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="menu-in absolute right-0 top-full z-40 mt-2 w-[248px] rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-float)]"
          style={{ transformOrigin: 'top right' }}
        >
          <div className="flex items-center gap-3 px-1 pb-3">
            <Avatar initials={currentReviewer.initials} size={34} />
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium text-ink">
                {currentReviewer.name}
              </p>
              <p className="text-[11px] text-muted">Signed in</p>
            </div>
          </div>
          <div className="border-t border-border pt-2">
            <p className="px-1 pb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-faint">
              Also reviewing this role
            </p>
            {others.map((r) => (
              <div key={r.name} className="flex items-center gap-[10px] rounded-lg px-1 py-[6px]">
                <Avatar initials={r.initials} size={24} />
                <span className="text-[13px] text-body">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
