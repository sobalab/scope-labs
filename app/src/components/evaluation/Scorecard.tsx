import type { RubricScore } from '../../data/submissions';
import { RatingControl } from '../primitives/RatingControl';

interface ScorecardProps {
  scores: RubricScore[];
  locked: boolean;
  onScore: (criterion: string, value: number) => void;
}

// Repeats a segmented scale per rubric criterion. The rubric is fixed across all
// submissions on purpose: consistent criteria fight the halo effect. The scale
// shows the number in each cell, so no separate readout is needed.
export function Scorecard({ scores, locked, onScore }: ScorecardProps) {
  const scored = scores.filter((s) => s.score != null).length;
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="eyebrow">Scorecard</span>
        <span className="font-sans text-[10.5px] text-faint">
          {scored}/{scores.length} · 1 = weak · 4 = excellent
        </span>
      </div>

      <div className="space-y-3">
        {scores.map((s) => (
          <div key={s.criterion} className="flex items-center gap-4">
            <span className="min-w-0 flex-1 truncate text-[13px] text-body">
              {s.criterion}
            </span>
            <div className="w-[132px] shrink-0">
              <RatingControl
                label={s.criterion}
                value={s.score}
                max={s.max}
                locked={locked}
                onChange={(v) => onScore(s.criterion, v)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
