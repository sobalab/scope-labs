import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../primitives/Button';

interface DecisionDialogProps {
  kind: 'advance' | 'reject';
  firstName: string;
  challenge: string;
  onConfirm: (email: boolean) => void;
  onCancel: () => void;
}

function template(kind: 'advance' | 'reject', first: string, challenge: string) {
  if (kind === 'advance') {
    return `Hi ${first},\n\nThanks for the time you put into the ${challenge} take-home. We've reviewed it and we'd like to move you to the next round. We'll follow up shortly with the details.\n\nBest,\nThe hiring team`;
  }
  return `Hi ${first},\n\nThank you for your ${challenge} submission. After a careful review, we've decided not to move forward at this time. We really appreciate the effort, and we wish you the best.\n\nBest,\nThe hiring team`;
}

// A confirm popup for the two irreversible decisions. Advance and reject both
// route through here; each offers to email the candidate the update, with an
// editable message pre-filled for the outcome.
export function DecisionDialog({
  kind,
  firstName,
  challenge,
  onConfirm,
  onCancel,
}: DecisionDialogProps) {
  const [email, setEmail] = useState(true);
  const [message, setMessage] = useState(() => template(kind, firstName, challenge));
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cardRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const advance = kind === 'advance';
  const title = `${advance ? 'Advance' : 'Reject'} ${firstName}?`;

  // Portal to the body so the fixed overlay escapes the evaluation panel's
  // backdrop-filter, which would otherwise be its containing block.
  return createPortal(
    <div
      className="fade-in fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'rgba(20,30,45,.55)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="decision-dialog-title"
    >
      <div
        ref={cardRef}
        tabIndex={-1}
        className="pop-in w-full max-w-[440px] rounded-2xl border border-border bg-surface p-6 shadow-2xl focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="decision-dialog-title" className="text-[18px] font-medium text-ink">
          {title}
        </h2>
        <p className="pt-1 text-[13px] leading-[1.5] text-muted">
          {advance
            ? `${firstName} moves to the next round. This is recorded and locks the scorecard.`
            : `This closes out ${firstName}'s submission. This is recorded and locks the scorecard.`}
        </p>

        <label className="mt-4 flex cursor-pointer items-center gap-[10px] rounded-xl border border-border bg-surface-sunk px-4 py-3">
          <input
            type="checkbox"
            checked={email}
            onChange={(e) => setEmail(e.target.checked)}
            className="h-[15px] w-[15px] shrink-0 accent-[var(--accent)]"
          />
          <span className="text-[13px] text-ink">Email {firstName} this update</span>
        </label>

        {email && (
          <div className="mt-3 space-y-1">
            <span className="eyebrow">Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              aria-label={`Email to ${firstName}`}
              className="w-full resize-y rounded-xl border border-border-strong px-[14px] py-[10px] text-[13px] leading-[1.5] text-ink focus:border-accent focus:outline-none"
              style={{ background: 'var(--field-bg)' }}
            />
          </div>
        )}

        <div className="mt-5 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={advance ? 'primary' : 'danger'}
            onClick={() => onConfirm(email)}
          >
            {advance ? 'Advance' : 'Reject'}
            {email ? ' and email' : ''}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
