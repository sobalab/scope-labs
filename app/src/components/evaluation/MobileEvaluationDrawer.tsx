import { useState } from 'react';
import type { Submission } from '../../data/submissions';
import { EvaluationPanel, type EvaluationHandlers } from './EvaluationPanel';
import { StatusBadge } from '../primitives/StatusBadge';
import { lifecycleMeta, isTerminal } from '../../lib/lifecycle';

interface MobileEvaluationDrawerProps {
  submission: Submission;
  handlers: EvaluationHandlers;
}

// On mobile the evaluation surface detaches into a bottom sheet with a
// persistent trigger. Mobile is framed as triage: skim, decide, request more,
// not deep evaluation.
export function MobileEvaluationDrawer({
  submission,
  handlers,
}: MobileEvaluationDrawerProps) {
  const [open, setOpen] = useState(false);
  const meta = lifecycleMeta[submission.status];
  const scored = submission.scorecard.filter((s) => s.score != null).length;

  return (
    <div className="lg:hidden">
      {/* persistent trigger bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <StatusBadge label={meta.label} tone={meta.tone} />
            <span className="font-mono text-[12px] text-faint">
              {scored}/{submission.scorecard.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-accent px-4 py-2 text-[14px] font-medium text-accent-ink"
          >
            {isTerminal(submission.status) ? 'View decision' : 'Score'}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-ink/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative max-h-[88vh] overflow-auto rounded-t-2xl border-t border-border bg-surface px-4 pb-6 pt-3">
            <div className="mb-4 flex items-center justify-between">
              <span
                className="mx-auto h-[4px] w-[40px] rounded-full bg-border-strong"
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-4 text-[13px] font-medium text-muted"
              >
                Close
              </button>
            </div>
            <EvaluationPanel submission={submission} handlers={handlers} bare />
          </div>
        </div>
      )}
    </div>
  );
}
