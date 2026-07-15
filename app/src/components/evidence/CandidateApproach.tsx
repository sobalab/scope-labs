import type { Submission } from '../../data/submissions';
import { SectionCard } from '../primitives/SectionCard';
import { EmptyState } from '../primitives/EmptyState';
import { Skeleton } from '../primitives/Skeleton';

interface CandidateApproachProps {
  approach: Submission['approach'];
  onRequest: () => void;
}

// The written reasoning, elevated above media. This is the lead signal: for
// most submissions it is the fastest read on whether the candidate understood
// the problem. Empty here is one of the two blocks where absence is a gap.
export function CandidateApproach({ approach, onRequest }: CandidateApproachProps) {
  return (
    <SectionCard title="Approach">
      {approach.state === 'loading' && (
        <div className="space-y-12">
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-[70%]" />
        </div>
      )}

      {approach.state === 'populated' && approach.body && (
        <div className="space-y-16 text-[16px] leading-[1.65] text-body">
          {approach.body.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}

      {approach.state === 'empty' && (
        <EmptyState
          type="description"
          signal
          action={{ label: 'Request a written summary', onClick: onRequest }}
        />
      )}
    </SectionCard>
  );
}
