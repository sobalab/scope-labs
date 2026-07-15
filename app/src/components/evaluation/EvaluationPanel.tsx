import type { Submission } from '../../data/submissions';
import { isTerminal } from '../../lib/lifecycle';
import { Scorecard } from './Scorecard';
import { ReviewerNotes } from './ReviewerNotes';
import { DecisionActions } from './DecisionActions';

export interface EvaluationHandlers {
  onScore: (criterion: string, value: number) => void;
  onNotes: (value: string) => void;
  onAdvance: () => void;
  onReject: () => void;
  onRequestMore: () => void;
  onResume: () => void;
}

interface EvaluationPanelProps {
  submission: Submission;
  handlers: EvaluationHandlers;
  // When true, drop the outer card chrome (used inside the mobile drawer).
  bare?: boolean;
}

// Right column, sticky, always visible on desktop. The one place the accent
// carries meaning. The fixed 360px width means this surface never reflows.
export function EvaluationPanel({ submission, handlers, bare = false }: EvaluationPanelProps) {
  const locked = isTerminal(submission.status);
  const body = (
    <div className="space-y-24">
      <Scorecard
        scores={submission.scorecard}
        locked={locked}
        onScore={handlers.onScore}
      />
      <ReviewerNotes
        value={submission.notes ?? ''}
        locked={locked}
        onChange={handlers.onNotes}
      />
      <DecisionActions
        status={submission.status}
        decidedBy={submission.decidedBy}
        decidedAt={submission.decidedAt}
        onAdvance={handlers.onAdvance}
        onReject={handlers.onReject}
        onRequestMore={handlers.onRequestMore}
        onResume={handlers.onResume}
      />
    </div>
  );

  if (bare) return body;

  return (
    <div className="rounded-xl border border-border bg-surface p-24">
      <div className="mb-16">
        <h2 className="text-[15px] font-medium text-ink">Evaluation</h2>
        <p className="pt-4 text-[12px] text-muted">
          {locked ? 'Recorded decision, read only.' : 'Score, note, decide.'}
        </p>
      </div>
      {body}
    </div>
  );
}
