import { useEffect, useMemo, useRef, useState } from 'react';
import {
  submissions as fixtures,
  lastReviewedSeed,
  type BlockState,
  type Lifecycle,
  type Submission,
} from './data/submissions';
import { NOW } from './lib/format';
import { isTerminal } from './lib/lifecycle';
import { PageShell } from './components/PageShell';
import { ContextHeader } from './components/ContextHeader';
import { EvidencePane } from './components/evidence/EvidencePane';
import {
  EvaluationPanel,
  type EvaluationHandlers,
} from './components/evaluation/EvaluationPanel';
import { MobileEvaluationDrawer } from './components/evaluation/MobileEvaluationDrawer';
import { QueueTable } from './components/QueueTable';
import {
  StateSwitcher,
  type BlockKey,
  type BlockOverride,
  type SimState,
} from './components/StateSwitcher';
import { Toast } from './components/primitives/Toast';

// Sample data injected when a block is *forced* to populated/error via the demo
// controls but the underlying fixture has nothing there. Keeps every simulated
// state visually real instead of blank.
function fillBlock(
  base: Submission,
  key: BlockKey,
  state: BlockState,
): Submission[BlockKey] {
  const current = base[key];
  if (state !== 'populated' && state !== 'error') {
    return { ...current, state } as Submission[BlockKey];
  }

  const live = state === 'populated' ? 'live' : 'unreachable';
  switch (key) {
    case 'approach':
      return {
        state,
        body:
          (current as Submission['approach']).body ??
          'I scoped the problem to its riskiest part first, wrote tests around that, and left the polish for last. The README covers the trade-offs I accepted under the time limit.',
      };
    case 'demo':
      return {
        state,
        url: (current as Submission['demo']).url ?? 'https://demo.candidate.app',
        health: live,
      };
    case 'gallery':
      return {
        state,
        images: (current as Submission['gallery']).images ?? [
          'dashboard',
          'detail-view',
          'settings',
        ],
        failedCount: state === 'error' ? 3 : undefined,
      };
    case 'loom':
      return {
        state,
        url:
          (current as Submission['loom']).url ??
          'https://www.loom.com/share/walkthrough',
        health: live,
      };
    case 'repo':
      return {
        state,
        url:
          (current as Submission['repo']).url ??
          'https://github.com/candidate/take-home',
        readme:
          (current as Submission['repo']).readme ??
          '# take-home\n\nCore logic in src/. Run with `make dev`. Trade-offs in NOTES.md.',
        languages: (current as Submission['repo']).languages ?? [
          { name: 'TypeScript', pct: 82 },
          { name: 'CSS', pct: 18 },
        ],
        commits: (current as Submission['repo']).commits ?? 24,
        lastCommit: (current as Submission['repo']).lastCommit ?? NOW.toISOString(),
        commitLog: (current as Submission['repo']).commitLog ?? [
          { sha: 'a1c4f90', message: 'Wire up the core flow end to end', at: NOW.toISOString() },
          { sha: '7d22e0b', message: 'Add tests around the tricky path', at: NOW.toISOString() },
          { sha: '3f88a1c', message: 'Initial commit', at: NOW.toISOString() },
        ],
        fileTree: (current as Submission['repo']).fileTree ?? [
          'src/index.ts',
          'src/core/handler.ts',
          'src/core/handler.test.ts',
          'package.json',
          'README.md',
        ],
        health: live,
      };
  }
}

const emptySim: SimState = { blocks: {}, lifecycle: 'auto' };

export default function App() {
  const [store, setStore] = useState<Record<string, Submission>>(() =>
    Object.fromEntries(fixtures.map((s) => [s.id, s])),
  );
  const [view, setView] = useState<'queue' | 'showcase'>('showcase');
  const [activeId, setActiveId] = useState<string>(fixtures[0].id);
  const [sim, setSim] = useState<SimState>(emptySim);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [toast, setToast] = useState<string | null>(null);
  const [lastOpened, setLastOpened] = useState<Record<string, string>>(
    () => ({ ...lastReviewedSeed }),
  );
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scores and notes persist synchronously; this just flashes the reassurance.
  const flashSaved = () => {
    setSaveState('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaveState('saved'), 550);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const orderedSubmissions = useMemo(
    () => fixtures.map((f) => store[f.id]),
    [store],
  );

  // Effective submission = stored working copy with the demo overlay applied.
  const effective = useMemo<Submission>(() => {
    const base = store[activeId];
    let next: Submission = { ...base };

    for (const [k, override] of Object.entries(sim.blocks) as [
      BlockKey,
      BlockOverride,
    ][]) {
      if (!override || override === 'auto') continue;
      next = { ...next, [k]: fillBlock(base, k, override) };
    }

    if (sim.lifecycle !== 'auto') {
      next = { ...next, status: sim.lifecycle };
      if (isTerminal(sim.lifecycle) && !next.decidedBy) {
        next = { ...next, decidedBy: 'You', decidedAt: NOW.toISOString() };
      }
    }
    return next;
  }, [store, activeId, sim]);

  const patchActive = (patch: Partial<Submission>) =>
    setStore((prev) => ({
      ...prev,
      [activeId]: { ...prev[activeId], ...patch },
    }));

  const openSubmission = (id: string) => {
    setActiveId(id);
    setSim(emptySim);
    setView('showcase');
    setSaveState('idle');
    setLastOpened((prev) => ({ ...prev, [id]: NOW.toISOString() }));
  };

  const handlers: EvaluationHandlers = {
    onScore: (criterion, value) => {
      patchActive({
        scorecard: store[activeId].scorecard.map((s) =>
          s.criterion === criterion ? { ...s, score: value } : s,
        ),
      });
      flashSaved();
    },
    onNotes: (value) => {
      patchActive({ notes: value });
      flashSaved();
    },
    onAdvance: (email: boolean) => {
      patchActive({
        status: 'advanced',
        decidedBy: 'You',
        decidedAt: NOW.toISOString(),
      });
      setSim((s) => ({ ...s, lifecycle: 'auto' }));
      const name = store[activeId].candidate.name;
      setToast(email ? `Advanced ${name} and emailed them.` : `Advanced ${name}.`);
    },
    onReject: (email: boolean) => {
      patchActive({
        status: 'rejected',
        decidedBy: 'You',
        decidedAt: NOW.toISOString(),
      });
      setSim((s) => ({ ...s, lifecycle: 'auto' }));
      const name = store[activeId].candidate.name;
      setToast(email ? `Rejected ${name} and emailed them.` : `Rejected ${name}.`);
    },
    onRequestMore: (summary: string) => {
      patchActive({ status: 'awaiting-candidate', requested: summary });
      setSim((s) => ({ ...s, lifecycle: 'auto' }));
      setToast(`Asked ${store[activeId].candidate.name.split(' ')[0]} for ${summary}.`);
    },
    onResume: () => {
      patchActive({ status: 'in-review', requested: undefined });
      setSim((s) => ({ ...s, lifecycle: 'auto' }));
      setToast('Resumed. Moved back to in review.');
    },
  };

  const requestArtifact = (what: string) => {
    if (!isTerminal(effective.status)) {
      patchActive({ status: 'awaiting-candidate', requested: what });
    }
    setToast(`Requested ${what} from the candidate.`);
  };

  const bulkReRequest = () => {
    if (!isTerminal(effective.status)) {
      patchActive({ status: 'awaiting-candidate', requested: 'working links for every broken artifact' });
    }
    setToast('Requested fresh links for every broken artifact.');
  };

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <>
      {view === 'queue' ? (
        <QueueTable
          submissions={orderedSubmissions}
          onOpen={openSubmission}
          theme={theme}
          onToggleTheme={toggleTheme}
          lastOpened={lastOpened}
        />
      ) : (
        <>
          <PageShell
            header={
              <ContextHeader
                submission={effective}
                onBack={() => setView('queue')}
                theme={theme}
                onToggleTheme={toggleTheme}
                submissions={orderedSubmissions}
                onSelect={openSubmission}
              />
            }
            evidence={
              <EvidencePane
                key={effective.id}
                submission={effective}
                onRequest={requestArtifact}
                onBulkReRequest={bulkReRequest}
              />
            }
            evaluation={
              <EvaluationPanel
                key={effective.id}
                submission={effective}
                handlers={handlers}
                saveState={saveState}
              />
            }
          />
          {/* Bottom padding so the mobile trigger bar never covers content. */}
          <div className="h-[72px] lg:hidden" />
          <MobileEvaluationDrawer
            submission={effective}
            handlers={handlers}
            saveState={saveState}
          />
        </>
      )}

      <StateSwitcher
        submissions={orderedSubmissions}
        activeId={activeId}
        onPick={openSubmission}
        sim={sim}
        onSetBlock={(key: BlockKey, value: BlockOverride) =>
          setSim((s) => ({ ...s, blocks: { ...s.blocks, [key]: value } }))
        }
        onSetLifecycle={(value: Lifecycle | 'auto') =>
          setSim((s) => ({ ...s, lifecycle: value }))
        }
        onReset={() => setSim(emptySim)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  );
}
