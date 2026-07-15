import type { ReactNode } from 'react';

interface SectionCardProps {
  title?: string;
  // A small trailing element on the header row: a badge, a count, a link.
  aside?: ReactNode;
  children: ReactNode;
  // Evidence blocks in error get a subtle danger-tinted surround so the
  // reviewer registers "broken" before reading. Kept as a full treatment,
  // never a one-sided accent edge.
  variant?: 'default' | 'alert';
}

// The single evidence container. Full border plus surface fill, no one-sided
// accent edges, no internal hairline dividers. Blocks are separated on the
// page by whitespace, not rules.
export function SectionCard({
  title,
  aside,
  children,
  variant = 'default',
}: SectionCardProps) {
  const surround =
    variant === 'alert'
      ? 'border-danger/25 bg-danger-soft/40'
      : 'border-border bg-surface';
  return (
    <section className={`rounded-xl border ${surround} p-24`}>
      {(title || aside) && (
        <header className="mb-16 flex items-center justify-between gap-16">
          {title && (
            <h2 className="text-[13px] font-medium uppercase tracking-[0.06em] text-muted">
              {title}
            </h2>
          )}
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}
