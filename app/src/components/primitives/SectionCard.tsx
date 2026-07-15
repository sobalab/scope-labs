import type { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  // A small trailing element on the header row: a badge, a count, a link.
  aside?: ReactNode;
  children: ReactNode;
  // Evidence blocks in error get a subtle danger-tinted surround so the
  // reviewer registers "broken" before reading. Full treatment, never a
  // one-sided accent edge.
  variant?: 'default' | 'alert';
}

// The workhorse opaque evidence card. Per the system, glass never goes on these
// plain white surfaces — they stay opaque cards with a hairline border and a
// whisper-soft cool shadow. Generous 20px radius. Blocks are separated on the
// page by whitespace, not rules; the title is a mono eyebrow.
export function SectionCard({
  title,
  aside,
  children,
  variant = 'default',
}: SectionCardProps) {
  const surround =
    variant === 'alert'
      ? 'border-danger/25 bg-danger-soft/40'
      : 'border-border bg-surface shadow-[var(--shadow-card)]';
  return (
    <section className={`rounded-[20px] border ${surround} p-6`}>
      {(title || aside) && (
        <header className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="eyebrow">{title}</h2>}
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}
