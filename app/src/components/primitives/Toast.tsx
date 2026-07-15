import { useEffect } from 'react';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
}

// Transient confirmation for request actions. In a real app the request would
// hit the pipeline layer; here it parks the submission and confirms.
export function Toast({ message, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-6">
      <div className="pointer-events-auto flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-[13px] text-body shadow-lg">
        <span className="h-[7px] w-[7px] rounded-full bg-accent" />
        {message}
      </div>
    </div>
  );
}
