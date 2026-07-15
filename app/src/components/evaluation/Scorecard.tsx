import type { RubricScore } from '../../data/submissions';
import { RatingControl } from '../primitives/RatingControl';
import { rubricAnchors } from '../../lib/lifecycle';

interface ScorecardProps {
  scores: RubricScore[];
  locked: boolean;
  onScore: (criterion: string, value: number) => void;
}

// Repeats a segmented scale per rubric criterion. The rubric is fixed across all
// submissions on purpose: consistent criteria fight the halo effect. Hovering or
// focusing a score shows what it means for that criterion.
export function Scorecard({ scores, locked, onScore }: ScorecardProps) {
  const scored = scores.filter((s) => s.score != null).length;
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <span className="eyebrow">Scorecard</span>
        <span className="font-sans text-[10.5px] text-faint">
          {scored}/{scores.length} scored
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
                descriptions={rubricAnchors[s.criterion]}
                onChange={(v) => onScore(s.criterion, v)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
