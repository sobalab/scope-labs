import type { Submission } from '../../data/submissions';
import { SectionCard } from '../primitives/SectionCard';
import { EmptyState } from '../primitives/EmptyState';
import { Skeleton } from '../primitives/Skeleton';
import { LinkHealthIndicator } from '../primitives/LinkHealthIndicator';
import { Button } from '../primitives/Button';
import { timeSince } from '../../lib/format';

interface RepoSummaryProps {
  repo: Submission['repo'];
  onRequestReadme: () => void;
  onRequestAccess: () => void;
}

// Language bar shades. The dominant language takes the accent; the rest are
// stepped neutrals. No dividers, no gradient flood, just one segmented bar.
const LANG_SHADES = [
  'var(--accent)',
  'var(--border-strong)',
  'var(--faint)',
  'var(--muted)',
];

function LanguageBar({ languages }: { languages: { name: string; pct: number }[] }) {
  return (
    <div className="space-y-3">
      <div className="flex h-[10px] w-full overflow-hidden rounded-full">
        {languages.map((lang, i) => (
          <div
            key={lang.name}
            style={{ width: `${lang.pct}%`, background: LANG_SHADES[i] ?? 'var(--border)' }}
            title={`${lang.name} ${lang.pct}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {languages.map((lang, i) => (
          <span key={lang.name} className="inline-flex items-center gap-[6px] text-[12px]">
            <span
              className="h-[8px] w-[8px] rounded-full"
              style={{ background: LANG_SHADES[i] ?? 'var(--border)' }}
            />
            <span className="text-body">{lang.name}</span>
            <span className="font-sans text-faint">{lang.pct}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const GitHubMark = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

export function RepoSummary({ repo, onRequestReadme, onRequestAccess }: RepoSummaryProps) {
  if (repo.state === 'loading') {
    return (
      <SectionCard title="Repository">
        <div className="space-y-4">
          <Skeleton className="h-[10px] w-full" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[60%]" />
          </div>
        </div>
      </SectionCard>
    );
  }

  if (repo.state === 'error') {
    return (
      <SectionCard title="Repository" variant="alert">
        <div className="flex flex-col items-start gap-4">
          <div className="space-y-1">
            <p className="text-[14px] font-medium text-ink">Repository private or 404</p>
            <p className="max-w-[50ch] text-[13px] leading-[1.5] text-muted">
              The repository did not resolve on the last check. Access may have
              been revoked, or the repo was made private after submission.
            </p>
            {repo.url && (
              <p className="pt-1 font-sans text-[12px] text-faint">{repo.url}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <LinkHealthIndicator health={repo.health ?? 'unreachable'} />
            <Button variant="ghost" size="sm" onClick={onRequestAccess}>
              Request access
            </Button>
          </div>
        </div>
      </SectionCard>
    );
  }

  // Header aside: repo link + health, shown for populated and empty (reachable).
  const repoLink = repo.url && (
    <a
      href={repo.url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 font-sans text-[12px] text-muted transition-colors hover:text-accent"
    >
      <GitHubMark />
      {repo.url.replace('https://github.com/', '')}
      {repo.health && <LinkHealthIndicator health={repo.health} compact />}
    </a>
  );

  if (repo.state === 'empty') {
    return (
      <SectionCard title="Repository" aside={repoLink}>
        <div className="space-y-6">
          {repo.languages && repo.languages.length > 0 && (
            <LanguageBar languages={repo.languages} />
          )}
          <EmptyState
            type="readme"
            signal
            action={{ label: 'Request a README', onClick: onRequestReadme }}
          />
        </div>
      </SectionCard>
    );
  }

  // populated
  return (
    <SectionCard title="Repository" aside={repoLink}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-[12px] text-muted">
          {repo.commits != null && (
            <span>
              <span className="text-ink">{repo.commits}</span> commits
            </span>
          )}
          {repo.lastCommit && (
            <span>
              last commit <span className="text-ink">{timeSince(repo.lastCommit)}</span>
            </span>
          )}
        </div>

        {repo.languages && repo.languages.length > 0 && (
          <LanguageBar languages={repo.languages} />
        )}

        {repo.readme && (
          <div className="rounded-lg border border-border bg-surface-sunk">
            <div className="flex items-center gap-2 border-b border-border px-4 py-2 font-sans text-[11px] uppercase tracking-[0.06em] text-faint">
              README.md
            </div>
            <pre className="scroll-region max-h-[280px] overflow-auto whitespace-pre-wrap px-4 py-4 font-mono text-[12px] leading-[1.6] text-body">
              {repo.readme}
            </pre>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
