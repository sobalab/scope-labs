import type { ReactNode } from 'react';
import type { CandidateLinks } from '../data/submissions';

// The candidate's own profiles, separate from the submission's repo. Rendered as
// labelled links (not icon-only) inside a nav landmark, each opening in a new
// tab with an accessible label that says so and a visible focus ring.

const LinkedInIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18" strokeLinecap="round" />
  </svg>
);

const DocIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 3H6.5A1.5 1.5 0 005 4.5v15A1.5 1.5 0 006.5 21h11a1.5 1.5 0 001.5-1.5V8z" />
    <path d="M14 3v5h5M8.5 13.5h7M8.5 17h5" />
  </svg>
);

type LinkKey = keyof CandidateLinks;

const ORDER: {
  key: LinkKey;
  label: string;
  icon: ReactNode;
  // how the destination is described to a screen reader
  describe: (name: string) => string;
}[] = [
  { key: 'linkedin', label: 'LinkedIn', icon: <LinkedInIcon />, describe: (n) => `${n} on LinkedIn` },
  { key: 'github', label: 'GitHub', icon: <GitHubIcon />, describe: (n) => `${n} on GitHub` },
  { key: 'portfolio', label: 'Portfolio', icon: <GlobeIcon />, describe: (n) => `${n}'s portfolio` },
  { key: 'resume', label: 'Résumé', icon: <DocIcon />, describe: (n) => `${n}'s résumé, PDF` },
];

interface ProfileLinksProps {
  name: string;
  links: CandidateLinks;
}

export function ProfileLinks({ name, links }: ProfileLinksProps) {
  const available = ORDER.filter((item) => links[item.key]);
  if (available.length === 0) return null;

  return (
    <nav aria-label={`${name} profile links`} className="flex flex-wrap gap-2">
      {available.map((item) => (
        <a
          key={item.key}
          href={links[item.key]}
          target="_blank"
          rel="noreferrer"
          aria-label={`${item.describe(name)}, opens in a new tab`}
          className="inline-flex items-center gap-[7px] rounded-full border border-border-strong bg-surface px-3 py-[6px] text-[12px] text-body transition-colors hover:border-accent hover:text-accent-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-line"
        >
          <span className="text-muted" aria-hidden="true">
            {item.icon}
          </span>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
