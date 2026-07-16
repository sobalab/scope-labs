import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface CodeViewerProps {
  path: string;
  content: string;
  lang: string;
  repoUrl?: string;
  onClose: () => void;
}

const OpenIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 3h7v7M13 3L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// A read-only code view inside the tool, so the reviewer reads a file without
// leaving for the repo host. The repo link is kept as an escape hatch. This is
// a viewer, not an editor: no diff, no edit, just the file.
export function CodeViewer({ path, content, lang, repoUrl, onClose }: CodeViewerProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    cardRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const lines = content.replace(/\n$/, '').split('\n');

  return createPortal(
    <div
      className="fade-in fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(20,30,45,.55)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${path} source`}
    >
      <div
        ref={cardRef}
        tabIndex={-1}
        className="pop-in flex max-h-[85vh] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="truncate text-[13px] font-medium text-ink">{path}</span>
            <span className="shrink-0 rounded-full bg-surface-sunk px-[10px] py-[3px] text-[10px] uppercase tracking-[0.06em] text-muted">
              {lang}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            {repoUrl && (
              <a
                href={`${repoUrl}/blob/main/${path}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${path} in the repository, opens in a new tab`}
                className="inline-flex items-center gap-[6px] text-[12px] font-medium text-accent-text transition duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-accent active:scale-95"
              >
                <OpenIcon />
                Open in repo
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-[13px] font-medium text-muted transition duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-ink active:scale-95"
            >
              Close
            </button>
          </div>
        </div>

        <div className="code-scroll min-h-0 flex-1 overflow-auto bg-surface-sunk">
          <div className="min-w-full font-mono text-[12.5px] leading-[1.7]">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span
                  className="sticky left-0 w-[44px] shrink-0 select-none bg-surface-sunk py-0 pr-3 text-right text-faint"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <code className="whitespace-pre pr-5 text-body">{line || ' '}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
