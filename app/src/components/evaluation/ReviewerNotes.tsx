interface ReviewerNotesProps {
  value: string;
  locked: boolean;
  onChange: (value: string) => void;
}

// Free text, private to the reviewer. Soft-glass field over the dock. Phrased as
// a nudge, not a required field. Locked and shown as recorded text once decided.
export function ReviewerNotes({ value, locked, onChange }: ReviewerNotesProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">Notes</span>
        <span className="font-sans text-[10px] uppercase tracking-[0.1em] text-faint">
          private
        </span>
      </div>
      {locked ? (
        <p className="rounded-xl border border-border bg-surface-sunk px-[14px] py-3 text-[13px] leading-[1.55] text-body">
          {value || 'No note was recorded.'}
        </p>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder="What stood out, and why"
          className="w-full resize-y rounded-xl border border-border-strong px-[14px] py-[10px] text-[13px] leading-[1.5] text-ink placeholder:text-faint focus:border-accent focus:outline-none"
          style={{
            background: 'var(--field-bg)',
            boxShadow: 'inset 0 1px 2px rgba(20,30,45,.04)',
          }}
        />
      )}
    </div>
  );
}
