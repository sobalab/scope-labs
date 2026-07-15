import { useState } from 'react';
import type { BlockState, Lifecycle, Submission } from '../data/submissions';
import { lifecycleMeta } from '../lib/lifecycle';

export type BlockKey = 'approach' | 'demo' | 'gallery' | 'loom' | 'repo';
export type BlockOverride = BlockState | 'auto';

export interface SimState {
  blocks: Partial<Record<BlockKey, BlockOverride>>;
  lifecycle: Lifecycle | 'auto';
}

interface StateSwitcherProps {
  submissions: Submission[];
  activeId: string;
  onPick: (id: string) => void;
  sim: SimState;
  onSetBlock: (key: BlockKey, value: BlockOverride) => void;
  onSetLifecycle: (value: Lifecycle | 'auto') => void;
  onReset: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

// What each fixture is meant to demonstrate, so the picker teaches the states.
const FIXTURE_NOTE: Record<string, string> = {
  sub_ea19: 'Complete',
  sub_7c3d: 'Bare, repo only',
  sub_b204: 'All links rotted',
  sub_9f61: 'Awaiting candidate',
  sub_3a88: 'Decided, read only',
};

const BLOCK_STATES: Record<BlockKey, BlockState[]> = {
  approach: ['loading', 'populated', 'empty'],
  demo: ['loading', 'populated', 'empty', 'error'],
  gallery: ['loading', 'populated', 'empty', 'error'],
  loom: ['loading', 'populated', 'empty', 'error'],
  repo: ['loading', 'populated', 'empty', 'error'],
};

const STATE_ABBR: Record<BlockState, string> = {
  loading: 'load',
  populated: 'ok',
  empty: 'empty',
  error: 'error',
};

const LIFECYCLES = Object.keys(lifecycleMeta) as Lifecycle[];

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-md px-8 py-[3px] text-[11px] font-medium transition-colors',
        active
          ? 'bg-accent text-accent-ink'
          : 'bg-surface-sunk text-muted hover:text-ink',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function StateSwitcher(props: StateSwitcherProps) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-16 top-16 z-40 flex items-center gap-8 rounded-lg border border-border bg-surface px-12 py-8 text-[12px] font-medium text-muted shadow-lg transition-colors hover:text-ink"
      >
        <span className="h-[7px] w-[7px] rounded-full bg-accent" />
        Demo states
      </button>
    );
  }

  return (
    <div className="fixed right-16 top-16 z-40 w-[288px] rounded-xl border border-border bg-surface p-16 shadow-2xl">
      <div className="mb-12 flex items-center justify-between">
        <span className="text-[12px] font-medium uppercase tracking-[0.06em] text-faint">
          Demo controls
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[12px] font-medium text-muted transition-colors hover:text-ink"
        >
          Hide
        </button>
      </div>

      <div className="space-y-16">
        <div className="space-y-8">
          <p className="text-[11px] font-medium text-muted">Submission</p>
          <div className="grid grid-cols-1 gap-4">
            {props.submissions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => props.onPick(s.id)}
                className={[
                  'flex items-center justify-between rounded-md px-8 py-[6px] text-left text-[12px] transition-colors',
                  s.id === props.activeId
                    ? 'bg-accent-soft text-accent'
                    : 'text-body hover:bg-surface-sunk',
                ].join(' ')}
              >
                <span className="font-medium">{s.candidate.name}</span>
                <span className="text-[11px] text-faint">{FIXTURE_NOTE[s.id]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <p className="text-[11px] font-medium text-muted">Lifecycle</p>
          <div className="flex flex-wrap gap-4">
            <Pill
              active={props.sim.lifecycle === 'auto'}
              onClick={() => props.onSetLifecycle('auto')}
            >
              auto
            </Pill>
            {LIFECYCLES.map((l) => (
              <Pill
                key={l}
                active={props.sim.lifecycle === l}
                onClick={() => props.onSetLifecycle(l)}
              >
                {lifecycleMeta[l].label.toLowerCase()}
              </Pill>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <p className="text-[11px] font-medium text-muted">Evidence blocks</p>
          <div className="space-y-8">
            {(Object.keys(BLOCK_STATES) as BlockKey[]).map((key) => (
              <div key={key} className="flex items-center gap-8">
                <span className="w-[64px] shrink-0 font-mono text-[11px] text-faint">
                  {key}
                </span>
                <div className="flex flex-wrap gap-4">
                  <Pill
                    active={(props.sim.blocks[key] ?? 'auto') === 'auto'}
                    onClick={() => props.onSetBlock(key, 'auto')}
                  >
                    auto
                  </Pill>
                  {BLOCK_STATES[key].map((st) => (
                    <Pill
                      key={st}
                      active={props.sim.blocks[key] === st}
                      onClick={() => props.onSetBlock(key, st)}
                    >
                      {STATE_ABBR[st]}
                    </Pill>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={props.onToggleTheme}
            className="rounded-md border border-border px-10 py-[5px] text-[12px] font-medium text-body transition-colors hover:border-accent hover:text-accent"
          >
            {props.theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
          <button
            type="button"
            onClick={props.onReset}
            className="text-[12px] font-medium text-muted transition-colors hover:text-ink"
          >
            Reset overrides
          </button>
        </div>
      </div>
    </div>
  );
}
