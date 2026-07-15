interface ReviewerNotesProps {
  value: string;
  locked: boolean;
  onChange: (value: string) => void;
}

// Free text, private to the reviewer. Locked and shown as recorded text once
// the submission is decided.
export function ReviewerNotes({ value, locked, onChange }: ReviewerNotesProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-muted">
          Notes
        </h2>
        <span className="text-[11px] text-faint">Private</span>
      </div>
      {locked ? (
        <p className="rounded-lg border border-border bg-surface-sunk px-3 py-3 text-[13px] leading-[1.55] text-body">
          {value || 'No notes were recorded.'}
        </p>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          placeholder="What tipped your read one way or the other?"
          className="w-full resize-y rounded-lg border border-border bg-surface-sunk px-3 py-3 text-[13px] leading-[1.55] text-body placeholder:text-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
        />
      )}
    </div>
  );
}
