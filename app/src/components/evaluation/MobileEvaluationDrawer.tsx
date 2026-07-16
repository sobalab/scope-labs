import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Submission } from '../../data/submissions';
import { EvaluationPanel, type EvaluationHandlers, type SaveState } from './EvaluationPanel';
import { StatusBadge } from '../primitives/StatusBadge';
import { Button } from '../primitives/Button';
import { lifecycleMeta, isTerminal } from '../../lib/lifecycle';

interface MobileEvaluationDrawerProps {
  submission: Submission;
  handlers: EvaluationHandlers;
  saveState: SaveState;
}

const CLOSE_THRESHOLD = 120; // px of downward drag that dismisses the sheet

// On mobile the evaluation surface detaches into a bottom sheet with a
// persistent trigger. The sheet slides up on open, can be dragged down by its
// handle to dismiss, and slides back out on close. Mobile is triage: skim,
// decide, request more.
export function MobileEvaluationDrawer({
  submission,
  handlers,
  saveState,
}: MobileEvaluationDrawerProps) {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false); // drives the slide transition
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);

  const meta = lifecycleMeta[submission.status];
  const scored = submission.scorecard.filter((s) => s.score != null).length;

  // Mount, then flip `entered` on the next frame so the transform animates in.
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, [open]);

  const openSheet = () => {
    setDragY(0);
    setOpen(true);
  };
  const closeSheet = useCallback(() => setEntered(false), []);

  // When the slide-out finishes, unmount.
  const onTransitionEnd = () => {
    if (!entered) {
      setOpen(false);
      setDragY(0);
    }
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    setDragging(true);
    startY.current = e.clientY;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // pointer capture is a progressive enhancement; the drag still works
      // while the pointer stays over the handle without it.
    }
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragging) return;
    setDragY(Math.max(0, e.clientY - startY.current));
  };
  const onPointerUp = () => {
    setDragging(false);
    if (dragY > CLOSE_THRESHOLD) closeSheet();
    else setDragY(0);
  };

  const transform = dragging
    ? `translateY(${dragY}px)`
    : entered
      ? 'translateY(0)'
      : 'translateY(100%)';
  const scrimOpacity = entered ? Math.max(0, 1 - dragY / 500) : 0;

  return (
    <div className="lg:hidden">
      {/* persistent trigger bar — frosted chrome over the ground */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t px-4 py-3"
        style={{
          background: 'var(--glass-light-bg)',
          borderColor: 'var(--glass-light-border)',
          backdropFilter: 'var(--blur)',
          WebkitBackdropFilter: 'var(--blur)',
          boxShadow: '0 -12px 30px -20px rgba(20,30,45,.4)',
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <StatusBadge label={meta.label} tone={meta.tone} />
            <span className="text-[12px] text-faint">
              {scored}/{submission.scorecard.length} scored
            </span>
          </div>
          <Button variant="primary" onClick={openSheet}>
            {isTerminal(submission.status) ? 'View decision' : 'Score'}
          </Button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end">
          <div
            className="absolute inset-0"
            onClick={closeSheet}
            aria-hidden="true"
            style={{
              background: 'rgba(20,30,45,.5)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              opacity: scrimOpacity,
              transition: dragging ? 'none' : 'opacity .32s ease',
            }}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Evaluation"
            className="relative max-h-[90vh] overflow-hidden rounded-t-3xl border-t"
            onTransitionEnd={onTransitionEnd}
            style={{
              background: 'var(--glass-light-bg)',
              borderColor: 'var(--glass-light-border)',
              backdropFilter: 'var(--blur)',
              WebkitBackdropFilter: 'var(--blur)',
              boxShadow: 'var(--shadow-glass)',
              transform,
              transition: dragging ? 'none' : 'transform .34s cubic-bezier(.2,.7,.2,1)',
              touchAction: 'none',
            }}
          >
            {/* drag handle zone — grab here to pull the sheet down */}
            <div
              className="flex cursor-grab justify-center pb-2 pt-3 active:cursor-grabbing"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              role="button"
              tabIndex={0}
              aria-label="Drag to close"
            >
              <span className="h-[5px] w-[44px] rounded-full bg-border-strong" aria-hidden="true" />
            </div>
            <div className="flex justify-end px-4 pb-3 pt-1">
              <button
                type="button"
                onClick={closeSheet}
                className="rounded-full px-3 py-1 text-[13px] font-medium text-muted transition-colors hover:text-ink"
              >
                Close
              </button>
            </div>
            <div className="max-h-[calc(90vh-96px)] overflow-auto px-4 pb-6">
              <EvaluationPanel
                submission={submission}
                handlers={handlers}
                saveState={saveState}
                bare
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
