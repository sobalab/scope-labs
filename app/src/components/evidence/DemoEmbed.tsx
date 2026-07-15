import type { Submission } from '../../data/submissions';
import { EmptyState } from '../primitives/EmptyState';
import { Skeleton } from '../primitives/Skeleton';
import { LinkHealthIndicator } from '../primitives/LinkHealthIndicator';
import { Button } from '../primitives/Button';

interface DemoEmbedProps {
  demo: Submission['demo'];
  onRequest: () => void;
  onRetry: () => void;
}

const OpenIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function DemoEmbed({ demo, onRequest, onRetry }: DemoEmbedProps) {
  if (demo.state === 'loading') {
    return <Skeleton className="aspect-[16/10] w-full" />;
  }

  if (demo.state === 'empty') {
    return (
      <EmptyState
        type="demo"
        action={{ label: 'Request a live demo', onClick: onRequest }}
      />
    );
  }

  if (demo.state === 'error') {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-danger/25 bg-danger-soft/40 px-4 py-6">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-[14px] font-medium text-ink">
            Demo unreachable
          </p>
          <p className="max-w-[46ch] text-[13px] leading-[1.5] text-muted">
            The deployed URL did not respond on the last check. It may have spun
            down since submission.
          </p>
          {demo.url && (
            <p className="pt-1 font-sans text-[12px] text-faint">{demo.url}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <LinkHealthIndicator health={demo.health ?? 'unreachable'} />
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Re-request working link
          </Button>
        </div>
      </div>
    );
  }

  // populated — a faux browser frame standing in for the live embed.
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface-sunk">
      <div className="flex items-center gap-3 border-b border-border bg-surface px-3 py-2">
        <div className="flex gap-[6px]" aria-hidden="true">
          <span className="h-[9px] w-[9px] rounded-full bg-border-strong" />
          <span className="h-[9px] w-[9px] rounded-full bg-border-strong" />
          <span className="h-[9px] w-[9px] rounded-full bg-border-strong" />
        </div>
        <div className="flex-1 truncate rounded-md bg-surface-sunk px-3 py-[5px] font-sans text-[11px] text-muted">
          {demo.url}
        </div>
        <LinkHealthIndicator health={demo.health ?? 'live'} compact />
        <a
          href={demo.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-[6px] rounded-md px-2 py-[5px] text-[12px] font-medium text-accent transition-colors hover:bg-accent-soft"
        >
          <OpenIcon />
          Open
        </a>
      </div>
      {/* Mock rendered app — the live iframe would mount here. */}
      <div className="relative aspect-[16/10] w-full bg-surface">
        <div className="absolute inset-0 flex flex-col gap-3 p-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 rounded bg-accent-soft" />
            <div className="flex gap-2">
              <div className="h-8 w-16 rounded bg-border/70" />
              <div className="h-8 w-16 rounded bg-border/70" />
            </div>
          </div>
          <div className="grid flex-1 grid-cols-3 gap-3">
            <div className="col-span-2 rounded-lg border border-border bg-surface-sunk" />
            <div className="space-y-3">
              <div className="h-1/3 rounded-lg border border-border bg-surface-sunk" />
              <div className="h-1/3 rounded-lg border border-accent-line bg-accent-soft" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
