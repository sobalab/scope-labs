import type { RubricScore } from '../../data/submissions';
import { RatingControl } from '../primitives/RatingControl';

interface ScorecardProps {
  scores: RubricScore[];
  locked: boolean;
  onScore: (criterion: string, value: number) => void;
}

// Repeats a RatingControl per rubric criterion. The rubric is fixed across all
// submissions on purpose: consistent criteria fight the halo effect. When the
// submission is terminal, the whole card is locked and shows recorded scores.
export function Scorecard({ scores, locked, onScore }: ScorecardProps) {
  const scored = scores.filter((s) => s.score != null).length;
  return (
    <div className="space-y-16">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-muted">
          Scorecard
        </h2>
        <span className="font-mono text-[12px] text-faint">
          {scored}/{scores.length} scored
        </span>
      </div>

      <div className="space-y-16">
        {scores.map((s) => (
          <div key={s.criterion} className="space-y-8">
            <div className="flex items-center justify-between gap-12">
              <span className="text-[13px] text-body">{s.criterion}</span>
              <span className="font-mono text-[12px] text-faint">
                {s.score != null ? `${s.score}/${s.max}` : '—'}
              </span>
            </div>
            <RatingControl
              label={s.criterion}
              value={s.score}
              max={s.max}
              locked={locked}
              onChange={(v) => onScore(s.criterion, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
