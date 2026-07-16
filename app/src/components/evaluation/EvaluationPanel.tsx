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

export type SaveState = 'idle' | 'saving' | 'saved';

interface EvaluationPanelProps {
  submission: Submission;
  handlers: EvaluationHandlers;
  saveState: SaveState;
  // When true, drop the outer glass chrome (used inside the mobile sheet, which
  // is itself the glass surface).
  bare?: boolean;
}

// Auto-save reassurance: scores and notes persist as they change, so this
// confirms it rather than making the reviewer navigate away to check.
function SaveStatus({ state }: { state: SaveState }) {
  if (state === 'saving') {
    return (
      <div key="saving" className="flex items-center gap-[7px] text-[12px] text-muted">
        <span className="h-[7px] w-[7px] animate-pulse rounded-full bg-accent" />
        Saving…
      </div>
    );
  }
  if (state === 'saved') {
    return (
      <div key="saved" className="pop-in flex items-center gap-[7px] text-[12px] text-ok">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Saved
      </div>
    );
  }
  return (
    <div key="idle" className="flex items-center gap-[7px] text-[12px] text-faint">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
      Scores save as you go
    </div>
  );
}

// The review dock — the one place the accent carries meaning, and a surface that
// floats over the ground, so it takes the light frost. Fixed 360px so it never
// reflows. When the submission is decided, the scorecard is replaced by a
// read-only dark SpectrumScore: the recorded profile at a glance.
export function EvaluationPanel({
  submission,
  handlers,
  saveState,
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
      {!locked && <SaveStatus state={saveState} />}
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
