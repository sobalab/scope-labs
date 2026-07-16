import type { Lifecycle, LinkHealth } from '../data/submissions';

export type Tone = 'neutral' | 'accent' | 'ok' | 'warn' | 'danger';

export const lifecycleMeta: Record<
  Lifecycle,
  { label: string; tone: Tone; terminal: boolean }
> = {
  'needs-review': { label: 'Needs review', tone: 'accent', terminal: false },
  'in-review': { label: 'In review', tone: 'neutral', terminal: false },
  'awaiting-candidate': {
    label: 'Awaiting candidate',
    tone: 'warn',
    terminal: false,
  },
  // The two terminal states read as a positive / negative pair: advanced is
  // the green "ok" pill, rejected the red "danger" pill. Neither uses ink, so
  // a status never reads as the primary decision button.
  advanced: { label: 'Advanced', tone: 'ok', terminal: true },
  rejected: { label: 'Rejected', tone: 'danger', terminal: true },
};

// Short labels for the SpectrumScore marker chips (the full criterion names are
// too long to ride inside a chip).
export const rubricShort: Record<string, string> = {
  'Problem understanding': 'PROBLEM',
  'Code quality': 'CODE',
  'Technical approach': 'APPROACH',
  'Communication': 'COMMS',
  'Product sense': 'PRODUCT',
};

// What each score means for each criterion, indexed 0..3 for scores 1..4. Shown
// on hover / focus of a scale cell so the reviewer scores against a shared
// anchor rather than a gut feel, which is the point of a fixed rubric.
export const rubricAnchors: Record<string, [string, string, string, string]> = {
  'Problem understanding': [
    'Misread the prompt or solved the wrong problem.',
    'Grasped the basics but missed key constraints.',
    'Understood the problem and its main trade-offs.',
    'Reframed the problem and anticipated the edge cases.',
  ],
  'Code quality': [
    'Hard to follow, little structure, few or no tests.',
    'Works, but rough structure or thin test coverage.',
    'Clean and readable, reasonably tested.',
    'Exemplary structure, naming, and tests around the risk.',
  ],
  'Technical approach': [
    'Chose an approach that does not hold up.',
    'Reasonable approach with notable gaps.',
    'Sound approach with justified choices.',
    'Elegant approach, defended against the alternatives.',
  ],
  'Communication': [
    'Little explanation of what was built or why.',
    'Explains what, rarely why.',
    'Clear on the decisions and their trade-offs.',
    'Crisp, and teaches the reader something.',
  ],
  'Product sense': [
    'No read on the user or the goal.',
    'Some product awareness, mostly surface level.',
    'Weighs user needs against effort sensibly.',
    'Sharp instincts on what matters and why.',
  ],
};

export const isTerminal = (status: Lifecycle): boolean =>
  lifecycleMeta[status].terminal;

export const healthMeta: Record<
  LinkHealth,
  { label: string; tone: Tone }
> = {
  checking: { label: 'Checking link', tone: 'neutral' },
  live: { label: 'Link live', tone: 'ok' },
  unreachable: { label: 'Unreachable', tone: 'danger' },
};
