import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../primitives/Button';

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

type LoadStatus = 'loading' | 'error' | 'loaded';

// Files that have loaded at least once this session, so a simulated transient
// failure never repeats for the same file after it has come back.
const loadedOnce = new Set<string>();

// A deterministic ~1-in-3 of files simulate a flaky first fetch, so the retry
// path is actually reachable in the prototype. A retry always succeeds.
function isFlaky(path: string): boolean {
  let h = 0;
  for (let i = 0; i < path.length; i++) h = (h * 31 + path.charCodeAt(i)) | 0;
  return Math.abs(h) % 3 === 0;
}

// Skeleton stand-in for the code while it "loads" — the shape (numbered lines of
// varying length) is known, so skeletons beat a spinner.
const SKELETON_WIDTHS = ['58%', '44%', '76%', '34%', '68%', '50%', '40%', '62%', '28%', '54%', '72%', '38%'];

function LoadingLines() {
  return (
    <div className="min-w-full animate-pulse py-1" aria-hidden="true">
      {SKELETON_WIDTHS.map((w, i) => (
        <div key={i} className="flex items-center">
          <span className="w-[44px] shrink-0 py-[5px] pr-3 text-right font-mono text-[12.5px] leading-[1.7] text-faint/40">
            {i + 1}
          </span>
          <span className="my-[5px] h-[10px] rounded bg-[var(--pill-neutral)]" style={{ width: w }} />
        </div>
      ))}
    </div>
  );
}

// A read-only code view inside the tool, so the reviewer reads a file without
// leaving for the repo host. The repo link is kept as an escape hatch. This is
// a viewer, not an editor: no diff, no edit, just the file. If the fetch fails,
// it offers a retry rather than a dead pane.
export function CodeViewer({ path, content, lang, repoUrl, onClose }: CodeViewerProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    cardRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Simulate fetching the file. Most resolve; a flaky one fails its first
  // attempt so the reviewer can exercise Retry, which then succeeds.
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    const fails = attempt === 0 && isFlaky(path) && !loadedOnce.has(path);
    const t = setTimeout(() => {
      if (cancelled) return;
      if (fails) {
        setStatus('error');
      } else {
        loadedOnce.add(path);
        setStatus('loaded');
      }
    }, 420);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [path, attempt]);

  const lines = content.replace(/\n$/, '').split('\n');
  const filename = path.split('/').pop() ?? path;

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
          {status === 'loading' && <LoadingLines />}

          {status === 'error' && (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-danger/70">
                <path d="M12 8v5M12 16.5v.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              <div className="space-y-1">
                <p className="text-[14px] font-medium text-ink">Couldn't load {filename}</p>
                <p className="mx-auto max-w-[42ch] text-[13px] leading-[1.5] text-muted">
                  The file didn't come back this time. This can happen with a slow
                  or interrupted connection.
                </p>
              </div>
              <div className="flex items-center gap-4 pt-1">
                <Button variant="primary" size="sm" onClick={() => setAttempt((a) => a + 1)}>
                  Retry
                </Button>
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
              </div>
            </div>
          )}

          {status === 'loaded' && (
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
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
