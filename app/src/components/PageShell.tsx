import type { ReactNode } from 'react';

/*
  ─────────────────────────────────────────────────────────────────────────
  Submission showcase — layout.
  Adapted from the "Frosted Glass" design system: cool-neutral ground, one
  slate accent, frosted glass on floating chrome. Four design choices held
  throughout (tokens in index.css):
    Type    TWK Lausanne (neutral grotesque) for everything readable. Mono
            (IBM Plex Mono) is reserved for code only — the README preview.
            Two weights, 400 and 500. Hierarchy by size and color.
    Palette Cool ground, near-black ink, one slate accent (#5a7183) reserved
            for the decision surface and primary actions. Everything else neutral.
    Layout  One primitive, repeated: split. A full-width context header, then a
            two-column body. Evidence is minmax(0,1fr); the evaluation dock is a
            fixed ~360px so the decision surface never reflows and sticks cleanly.
    Spacing 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64.
  Glass appears only on chrome that floats over the ground — the evaluation
  dock, the mobile sheet, overlays, the dev control. Evidence stays opaque.
  ─────────────────────────────────────────────────────────────────────────
*/

interface PageShellProps {
  header: ReactNode;
  evidence: ReactNode;
  evaluation: ReactNode;
}

export function PageShell({ header, evidence, evaluation }: PageShellProps) {
  return (
    <div className="app-bg fade-in min-h-screen text-body">
      <div className="mx-auto max-w-[1240px]">
        {header}
        <div className="grid grid-cols-1 items-start gap-8 px-8 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <main className="stagger min-w-0 space-y-6">{evidence}</main>
          <aside className="sticky top-6 hidden lg:block">{evaluation}</aside>
        </div>
      </div>
    </div>
  );
}
