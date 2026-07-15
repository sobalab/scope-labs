import type { Submission } from '../../data/submissions';
import { CandidateApproach } from './CandidateApproach';
import { MediaShowcase } from './MediaShowcase';
import { RepoSummary } from './RepoSummary';
import { TechStack } from './TechStack';

interface EvidencePaneProps {
  submission: Submission;
  onRequest: (what: string) => void;
  onBulkReRequest: () => void;
}

// Left column, scroll region. Order is deliberate: the written approach leads
// (fastest read on understanding), then the best-available media, then repo
// signal, then the stack. Blocks are separated by whitespace, not rules.
export function EvidencePane({
  submission,
  onRequest,
  onBulkReRequest,
}: EvidencePaneProps) {
  // How many external artifacts are broken at once. Two or more rotted links is
  // the "strong entry, submitted weeks ago, everything spun down" case, where
  // re-requesting each one by one is busywork.
  const rotted = (['demo', 'loom', 'repo', 'gallery'] as const).filter(
    (k) => submission[k].state === 'error',
  ).length;

  return (
    <>
      {rotted >= 2 && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-danger/25 bg-danger-soft/50 px-6 py-4">
          <div>
            <p className="text-[14px] font-medium text-ink">
              {rotted} links stopped resolving
            </p>
            <p className="pt-1 text-[13px] leading-[1.5] text-muted">
              Strong entries can rot after weeks in the queue. Ask for fresh
              links in one message instead of chasing each artifact.
            </p>
          </div>
          <button
            type="button"
            onClick={onBulkReRequest}
            className="shrink-0 rounded-lg bg-accent px-4 py-2 text-[13px] font-medium text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Re-request working links
          </button>
        </div>
      )}

      <CandidateApproach
        approach={submission.approach}
        onRequest={() => onRequest('a written approach')}
      />
      <MediaShowcase
        submission={submission}
        onRequest={(kind) =>
          onRequest(kind === 'demo' ? 'a live demo' : 'a walkthrough video')
        }
        onRetry={(kind) =>
          onRequest(kind === 'demo' ? 'a working demo link' : 'a working walkthrough link')
        }
      />
      <RepoSummary
        repo={submission.repo}
        onRequestReadme={() => onRequest('a README')}
        onRequestAccess={() => onRequest('repository access')}
      />
      <TechStack techStack={submission.techStack} />
    </>
  );
}
