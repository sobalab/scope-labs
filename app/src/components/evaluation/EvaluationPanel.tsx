import type { Submission } from '../../data/submissions';
import { isTerminal, rubricShort } from '../../lib/lifecycle';
import { GlassPanel } from '../primitives/GlassPanel';
import { Scorecard } from './Scorecard';
import { ReviewerNotes } from './ReviewerNotes';
import { DecisionActions } from './DecisionActions';
import { SpectrumScore, type SpectrumItem } from './SpectrumScore';

export interface EvaluationHandlers {
  onScore: (criterion: string, value: number) => void;
  onNotes: (value: string) => void;
  onAdvance: (email: boolean) => void;
  onReject: (email: boolean) => void;
  onRequestMore: (summary: string) => void;
  onResume: () => void;
}

interface EvaluationPanelProps {
  submission: Submission;
  handlers: EvaluationHandlers;
  // When true, drop the outer glass chrome (used inside the mobile sheet, which
  // is itself the glass surface).
  bare?: boolean;
}

// The review dock — the one place the accent carries meaning, and a surface that
// floats over the ground, so it takes the light frost. Fixed 360px so it never
// reflows. When the submission is decided, the scorecard is replaced by a
// read-only dark SpectrumScore: the recorded profile at a glance.
export function EvaluationPanel({
  submission,
  handlers,
  bare = false,
}: EvaluationPanelProps) {
  const locked = isTerminal(submission.status);

  const spectrumItems: SpectrumItem[] = submission.scorecard.map((s) => ({
    label: rubricShort[s.criterion] ?? s.criterion,
    value: s.score ?? 0,
  }));

  const body = (
    <div className="space-y-6">
      {locked ? (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="eyebrow">Scorecard</span>
            <span className="font-sans text-[10px] uppercase tracking-[0.1em] text-faint">
              recorded
            </span>
          </div>
          <SpectrumScore
            finish="dark"
            items={spectrumItems}
            axisLeft="Needs work"
            axisRight="Exceptional"
          />
        </div>
      ) : (
        <Scorecard
          scores={submission.scorecard}
          locked={locked}
          onScore={handlers.onScore}
        />
      )}
      <ReviewerNotes
        value={submission.notes ?? ''}
        locked={locked}
        onChange={handlers.onNotes}
      />
      <DecisionActions
        submission={submission}
        onAdvance={handlers.onAdvance}
        onReject={handlers.onReject}
        onRequestMore={handlers.onRequestMore}
        onResume={handlers.onResume}
      />
    </div>
  );

  if (bare) return body;

  return (
    <GlassPanel finish="light" className="rise rounded-2xl p-6">
      {body}
    </GlassPanel>
  );
}
