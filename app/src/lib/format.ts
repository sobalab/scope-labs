// A fixed "now" so relative timestamps are deterministic in the prototype.
// In a real app this would be Date.now().
export const NOW = new Date('2026-07-15T14:25:00Z');

export function timeSince(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.round((NOW.getTime() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 14) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  return `${weeks}w ago`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
