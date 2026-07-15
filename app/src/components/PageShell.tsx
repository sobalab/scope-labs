import type { ReactNode } from 'react';

/*
  ─────────────────────────────────────────────────────────────────────────
  Submission showcase — layout.
  Four design choices (held throughout, see index.css for tokens):
    Type    TWK Lausanne (UI grotesk) + JetBrains Mono (repo / commits / tech).
            Two weights only, 400 and 500. Hierarchy by size and color.
    Palette Warm paper base, warm near-black ink, one accent (deep teal).
            The accent is reserved for the decision surface and primary actions.
    Layout  A single primitive, repeated: split. Full-width context header,
            then a two-column body. Evidence is minmax(0,1fr); evaluation is a
            fixed ~360px so the decision surface never reflows and sticky is clean.
    Spacing 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64. Nothing off-scale.
  ─────────────────────────────────────────────────────────────────────────
*/

interface PageShellProps {
  header: ReactNode;
  evidence: ReactNode;
  evaluation: ReactNode;
}

export function PageShell({ header, evidence, evaluation }: PageShellProps) {
  return (
    <div className="min-h-screen bg-paper text-body">
      <div className="mx-auto max-w-[1240px]">
        {header}
        <div className="grid grid-cols-1 items-start gap-32 px-32 py-32 lg:grid-cols-[minmax(0,1fr)_360px]">
          <main className="min-w-0 space-y-24">{evidence}</main>
          <aside className="sticky top-24 hidden lg:block">{evaluation}</aside>
        </div>
      </div>
    </div>
  );
}
