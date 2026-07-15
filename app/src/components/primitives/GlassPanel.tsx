import type { CSSProperties, ReactNode } from 'react';

type Finish = 'light' | 'dark';

interface GlassPanelProps {
  finish?: Finish;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

// The signature frosted surface, adapted from the Frosted Glass system's
// GlassPanel. Only belongs on chrome that floats over the colored ground — the
// evaluation dock, the mobile sheet, overlays. Over a plain white card it would
// read as a normal card, so it is never used there. The blur is a real
// backdrop-filter, with an inset top highlight that gives the glass its edge.
const finishes: Record<Finish, CSSProperties> = {
  light: {
    background: 'var(--glass-light-bg)',
    border: '1px solid var(--glass-light-border)',
    backdropFilter: 'var(--blur)',
    WebkitBackdropFilter: 'var(--blur)',
    boxShadow: 'var(--shadow-glass)',
  },
  dark: {
    background: 'var(--glass-dark-bg)',
    border: '1px solid rgba(255,255,255,.1)',
    boxShadow: 'var(--shadow-dark)',
    color: '#fff',
  },
};

export function GlassPanel({
  finish = 'light',
  className = '',
  style,
  children,
}: GlassPanelProps) {
  return (
    <div className={className} style={{ ...finishes[finish], ...style }}>
      {children}
    </div>
  );
}
