import type { Lifecycle, LinkHealth } from '../data/submissions';

export type Tone = 'neutral' | 'accent' | 'ink' | 'ok' | 'warn' | 'danger';

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
  // Advanced is the system's "ink" pill — the one solid, decisive state.
  advanced: { label: 'Advanced', tone: 'ink', terminal: true },
  rejected: { label: 'Rejected', tone: 'danger', terminal: true },
};

// Short mono labels for the SpectrumScore marker chips (the full criterion
// names are too long to ride inside a chip).
export const rubricShort: Record<string, string> = {
  'Problem understanding': 'PROBLEM',
  'Code quality': 'CODE',
  'Technical approach': 'APPROACH',
  'Communication': 'COMMS',
  'Product sense': 'PRODUCT',
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
