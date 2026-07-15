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
    <section className={`rounded-2xl border ${surround} p-6`}>
      {(title || aside) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          {/* pt-[3px] optically centers the small title against taller asides
              (e.g. the tab group) while keeping its top offset consistent with
              cards that have no aside. */}
          {title && <h2 className="eyebrow pt-[3px]">{title}</h2>}
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}
