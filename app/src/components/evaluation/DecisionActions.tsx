import { useMemo, useState } from 'react';
import type { Submission } from '../../data/submissions';
import { lifecycleMeta } from '../../lib/lifecycle';
import { formatDateTime } from '../../lib/format';
import { Button } from '../primitives/Button';
import { StatusBadge } from '../primitives/StatusBadge';
import { DecisionDialog } from './DecisionDialog';

interface DecisionActionsProps {
  submission: Submission;
  onAdvance: (email: boolean) => void;
  onReject: (email: boolean) => void;
  onRequestMore: (summary: string) => void;
  onResume: () => void;
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// The supporting materials the reviewer can ask for, in impact order. `phrase`
// is how the item reads in the request summary; `has` marks what the candidate
// already provided so the chooser can flag the gaps and pre-check them.
function materialsFor(s: Submission) {
  return [
    { key: 'loom', label: 'Loom walkthrough', hint: 'A short screen recording of them using it', phrase: 'a Loom walkthrough', has: s.loom.state === 'populated' },
    { key: 'gallery', label: 'Preview screenshots', hint: 'Images of the key screens', phrase: 'preview screenshots', has: s.gallery.state === 'populated' },
    { key: 'demo', label: 'Live demo', hint: 'A deployed URL to click through', phrase: 'a live demo', has: s.demo.state === 'populated' },
    { key: 'approach', label: 'Written approach', hint: 'A few lines on their thinking', phrase: 'a written approach', has: s.approach.state === 'populated' },
    { key: 'readme', label: 'README and setup', hint: 'How to run it locally', phrase: 'a README', has: s.repo.state === 'populated' && !!s.repo.readme },
  ];
}

function joinPhrases(list: string[]): string {
  if (list.length <= 1) return list[0] ?? '';
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`;
}

export function DecisionActions({
  submission,
  onAdvance,
  onReject,
  onRequestMore,
  onResume,
}: DecisionActionsProps) {
  const { status, decidedBy, decidedAt } = submission;
  const meta = lifecycleMeta[status];
  const firstName = submission.candidate.name.split(' ')[0];

  const materials = useMemo(() => materialsFor(submission), [submission]);
  const [choosing, setChoosing] = useState(false);
  const [confirm, setConfirm] = useState<'advance' | 'reject' | null>(null);
  // Pre-select the gaps: the strongest materials the candidate did not include.
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const openChooser = () => {
    setPicked(new Set(materials.filter((m) => !m.has).map((m) => m.key)));
    setChoosing(true);
  };
  const toggle = (key: string) =>
    setPicked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  const send = () => {
    const phrases = materials.filter((m) => picked.has(m.key)).map((m) => m.phrase);
    if (phrases.length === 0) return;
    onRequestMore(joinPhrases(phrases));
    setChoosing(false);
  };

  // Terminal — read-only decision stamp, no re-scoring.
  if (meta.terminal) {
    return (
      <div className="rounded-xl border border-border bg-surface-sunk px-4 py-4">
        <div className="flex items-center gap-3">
          <StatusBadge label={meta.label} tone={meta.tone} />
          {decidedBy && decidedAt && (
            <span className="text-[11px] text-muted">
              by {decidedBy} · {formatDateTime(decidedAt)}
            </span>
          )}
        </div>
        <p className="pt-3 text-[12px] leading-[1.5] text-faint">
          This decision is recorded and the scorecard is locked. Re-open from the
          queue to change it.
        </p>
      </div>
    );
  }

  // The request chooser replaces the action buttons while open.
  if (choosing) {
    return (
      <div className="pop-in space-y-3 rounded-xl border border-border bg-surface-sunk p-4">
        <div>
          <p className="text-[13px] font-medium text-ink">Ask for stronger materials</p>
          <p className="pt-1 text-[12px] leading-[1.5] text-muted">
            Parks the submission and invites {firstName} to add these. It will not
            count against them.
          </p>
        </div>
        <div className="space-y-[6px]">
          {materials.map((m) => {
            const on = picked.has(m.key);
            return (
              <label
                key={m.key}
                className={[
                  'flex cursor-pointer items-start gap-[10px] rounded-lg border px-3 py-[9px] transition duration-[var(--dur-fast)] ease-[var(--ease-out)] active:scale-[0.99]',
                  on ? 'border-accent-line bg-surface' : 'border-border bg-surface hover:border-border-strong',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(m.key)}
                  className="mt-[2px] h-[15px] w-[15px] shrink-0 accent-[var(--accent)]"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[13px] text-ink">{m.label}</span>
                    <span
                      className={
                        m.has ? 'text-[10px] uppercase tracking-[0.06em] text-faint' : 'text-[10px] uppercase tracking-[0.06em] text-warn'
                      }
                    >
                      {m.has ? 'Included' : 'Missing'}
                    </span>
                  </span>
                  <span className="mt-[1px] block text-[11.5px] leading-[1.35] text-muted">
                    {m.hint}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Button variant="primary" block onClick={send}>
            Send request
          </Button>
          <Button variant="ghost" onClick={() => setChoosing(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {status === 'awaiting-candidate' && (
        <div
          className="rounded-xl border border-warn/30 px-3 py-3"
          style={{ background: 'var(--warn-soft)' }}
        >
          <p className="text-[13px] font-medium text-ink">Awaiting {firstName}</p>
          <p className="pt-1 text-[12px] leading-[1.5] text-muted">
            You asked for {submission.requested ?? 'more materials'}. The
            submission re-queues when they respond, rather than counting the gap
            against them.
          </p>
          <div className="pt-2">
            <Button variant="soft" size="sm" onClick={onResume}>
              Resume review
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="eyebrow">Recommendation</span>
      </div>
      <Button variant="primary" size="lg" block onClick={() => setConfirm('advance')}>
        <CheckIcon />
        Advance
      </Button>
      <div className="flex gap-3">
        <Button variant="danger" block onClick={() => setConfirm('reject')}>
          Reject
        </Button>
        <Button variant="soft" block onClick={openChooser}>
          Request more
        </Button>
      </div>

      {confirm && (
        <DecisionDialog
          kind={confirm}
          firstName={firstName}
          challenge={submission.challengeTitle}
          onConfirm={(withEmail) => {
            if (confirm === 'advance') onAdvance(withEmail);
            else onReject(withEmail);
            setConfirm(null);
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
