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
  advanced: { label: 'Advanced', tone: 'ok', terminal: true },
  rejected: { label: 'Rejected', tone: 'danger', terminal: true },
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
