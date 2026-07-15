// Fixture data for the submission showcase.
// Five submissions, chosen to exercise every state named in the brief:
//   complete, bare (repo-only), all-rotted, awaiting-candidate, and decided (terminal).
// All artifacts are fictional. Link-health fields stand in for a pre-checked crawl.

export type LinkHealth = 'checking' | 'live' | 'unreachable';
export type BlockState = 'loading' | 'populated' | 'empty' | 'error';
export type Lifecycle =
  | 'needs-review'
  | 'in-review'
  | 'advanced'
  | 'rejected'
  | 'awaiting-candidate';

export interface RubricScore {
  criterion: string;
  score: number | null;
  max: number;
}

export interface Submission {
  id: string;
  candidate: { name: string; initials: string };
  role: string;
  challengeTitle: string;
  status: Lifecycle;
  submittedAt: string; // ISO
  decidedBy?: string; // set only for terminal states
  decidedAt?: string;
  approach: { state: BlockState; body?: string };
  demo: { state: BlockState; url?: string; health?: LinkHealth };
  gallery: { state: BlockState; images?: string[]; failedCount?: number };
  loom: { state: BlockState; url?: string; health?: LinkHealth };
  repo: {
    state: BlockState;
    url?: string;
    readme?: string;
    languages?: { name: string; pct: number }[];
    commits?: number;
    lastCommit?: string;
    health?: LinkHealth;
  };
  techStack: string[];
  scorecard: RubricScore[];
  notes?: string;
}

// The fixed rubric. Five criteria, each scored 1 to 4. Keeping the set fixed
// across every submission is the point: it fights the halo effect.
export const RUBRIC_CRITERIA = [
  'Problem understanding',
  'Code quality',
  'Technical approach',
  'Communication',
  'Product sense',
] as const;

const emptyScorecard = (): RubricScore[] =>
  RUBRIC_CRITERIA.map((criterion) => ({ criterion, score: null, max: 4 }));

const scoredCard = (scores: (number | null)[]): RubricScore[] =>
  RUBRIC_CRITERIA.map((criterion, i) => ({
    criterion,
    score: scores[i] ?? null,
    max: 4,
  }));

// Realistic README bodies. Kept short; the RepoSummary renders the first stretch.
const streamReadme = `# realtime-ledger

A double-entry ledger with an append-only event log and a projection layer
for account balances. Writes go through a single command handler so every
mutation is validated before it lands.

## Running locally

    pnpm install
    pnpm dev        # api on :4000, web on :5173

## Design notes

Balances are never stored directly. They are folded from the event stream on
read and cached per account, invalidated on new events. This keeps the write
path honest and makes audit trivial: replay the log, you get the state.

Trade-off I accepted under the time limit: the projection cache is in-memory,
so a restart re-folds from event zero. Fine at this scale, not at production
volume. See "What I'd do next" below.`;

const bareReadme = `# take-home

Submission for the platform engineer take-home.

## Setup

    npm install
    npm start

Runs on port 3000. I focused on getting the core sync loop correct rather
than the UI, so most of the work is in src/sync. There is no deployed demo;
clone and run to see it.`;

export const submissions: Submission[] = [
  // 1. Complete — the strong, fully-evidenced submission. Everything populated.
  {
    id: 'sub_ea19',
    candidate: { name: 'Mara Osei', initials: 'MO' },
    role: 'Senior Full-Stack Engineer',
    challengeTitle: 'Realtime ledger service',
    status: 'in-review',
    submittedAt: '2026-07-14T09:12:00Z',
    approach: {
      state: 'populated',
      body: `I read the prompt as an integrity problem first and a features problem second. A ledger that loses or double-counts a transaction is worthless, so I built the write path as a single command handler that validates, appends to an event log, and only then acknowledges.

Balances are a projection folded from that log, cached per account and invalidated on write. That gave me an audit trail for free and kept the read model swappable.

I spent the last two hours on the reconciliation endpoint because that is where the interesting failure modes live: partial writes, out-of-order events, and the replay path after a cache miss. I wrote tests for each before wiring the UI.

If I had another day I would move the projection cache out of process and add backpressure on the command queue. Both are noted in the README.`,
    },
    demo: {
      state: 'populated',
      url: 'https://realtime-ledger.demo.app',
      health: 'live',
    },
    gallery: {
      state: 'populated',
      images: [
        'ledger-dashboard',
        'reconciliation-view',
        'event-log-inspector',
        'account-detail',
      ],
    },
    loom: {
      state: 'populated',
      url: 'https://www.loom.com/share/ledger-walkthrough',
      health: 'live',
    },
    repo: {
      state: 'populated',
      url: 'https://github.com/mosei/realtime-ledger',
      readme: streamReadme,
      languages: [
        { name: 'TypeScript', pct: 71 },
        { name: 'CSS', pct: 14 },
        { name: 'Shell', pct: 9 },
        { name: 'Dockerfile', pct: 6 },
      ],
      commits: 47,
      lastCommit: '2026-07-14T08:40:00Z',
      health: 'live',
    },
    techStack: ['TypeScript', 'Fastify', 'PostgreSQL', 'React', 'Vitest', 'Docker'],
    scorecard: scoredCard([4, 4, 3, 4, 3]),
    notes:
      'Reconciliation endpoint is genuinely thoughtful. Event-sourcing choice is justified, not cargo-culted. Want to confirm the cache invalidation story in the walkthrough before advancing.',
  },

  // 2. Bare — repo link only. No description, no media. Degrades to the README.
  {
    id: 'sub_7c3d',
    candidate: { name: 'Devin Park', initials: 'DP' },
    role: 'Platform Engineer',
    challengeTitle: 'File sync daemon',
    status: 'needs-review',
    submittedAt: '2026-07-15T02:47:00Z',
    approach: {
      state: 'empty',
    },
    demo: {
      state: 'empty',
    },
    gallery: {
      state: 'empty',
    },
    loom: {
      state: 'empty',
    },
    repo: {
      state: 'populated',
      url: 'https://github.com/dpark/take-home',
      readme: bareReadme,
      languages: [
        { name: 'Go', pct: 88 },
        { name: 'Makefile', pct: 12 },
      ],
      commits: 9,
      lastCommit: '2026-07-15T01:55:00Z',
      health: 'live',
    },
    techStack: ['Go', 'SQLite', 'fsnotify'],
    scorecard: emptyScorecard(),
  },

  // 3. All-rotted — strong entry submitted weeks ago; demo spun down, Loom deleted,
  //    repo went private. Every external artifact is in error at once.
  {
    id: 'sub_b204',
    candidate: { name: 'Priya Nair', initials: 'PN' },
    role: 'Senior Frontend Engineer',
    challengeTitle: 'Collaborative whiteboard',
    status: 'needs-review',
    submittedAt: '2026-06-24T15:30:00Z',
    approach: {
      state: 'populated',
      body: `The hard part of a shared whiteboard is not drawing, it is convergence: two people editing the same region should end up seeing the same thing without a server round-trip on every stroke.

I used a CRDT for the document so edits merge deterministically, and kept a thin presence channel separate from the document channel so cursors do not spam the merge log. Strokes are batched and flushed on an animation frame.

I deployed a live demo and recorded a walkthrough showing two tabs converging after a simulated network partition. The repo has the CRDT tests, which are the part I am most proud of.`,
    },
    demo: {
      state: 'error',
      url: 'https://whiteboard-crdt.fly.dev',
      health: 'unreachable',
    },
    gallery: {
      state: 'error',
      images: ['board-overview', 'presence-cursors', 'conflict-merge'],
      failedCount: 3,
    },
    loom: {
      state: 'error',
      url: 'https://www.loom.com/share/whiteboard-demo',
      health: 'unreachable',
    },
    repo: {
      state: 'error',
      url: 'https://github.com/pnair/collab-whiteboard',
      health: 'unreachable',
    },
    techStack: ['TypeScript', 'React', 'Yjs', 'WebSocket', 'Canvas'],
    scorecard: emptyScorecard(),
  },

  // 4. Awaiting-candidate — opened, then parked on a request for a working demo.
  //    Approach and repo are solid; the demo link rotted and was re-requested.
  {
    id: 'sub_9f61',
    candidate: { name: 'Tomas Reyes', initials: 'TR' },
    role: 'Full-Stack Engineer',
    challengeTitle: 'Feature-flag service',
    status: 'awaiting-candidate',
    submittedAt: '2026-07-11T18:05:00Z',
    approach: {
      state: 'populated',
      body: `I treated flag evaluation as the hot path and everything else as cold. Evaluation is a pure function over a flag config and a context, with no I/O, so it is trivially testable and fast enough to run inline.

Config changes propagate through a small pub/sub layer with a local cache, so a flag flip is visible in well under a second without hammering the store. The admin UI is deliberately thin.

The one thing I did not finish was the percentage-rollout bucketing under a config change mid-request. I documented the edge case rather than shipping something I had not tested.`,
    },
    demo: {
      state: 'error',
      url: 'https://flags.reyes.dev',
      health: 'unreachable',
    },
    gallery: {
      state: 'empty',
    },
    loom: {
      state: 'populated',
      url: 'https://www.loom.com/share/flag-service-tour',
      health: 'live',
    },
    repo: {
      state: 'populated',
      url: 'https://github.com/treyes/flag-service',
      readme: `# flag-service

Evaluation is a pure function. Everything hot lives in \`src/eval\`; everything
cold (admin, persistence) is behind an interface so it can be swapped.

## Run

    make dev

Known gap: percentage-rollout bucketing during a mid-request config change is
documented in ISSUES.md, not fixed.`,
      languages: [
        { name: 'TypeScript', pct: 64 },
        { name: 'Go', pct: 22 },
        { name: 'HCL', pct: 14 },
      ],
      commits: 31,
      lastCommit: '2026-07-11T17:20:00Z',
      health: 'live',
    },
    techStack: ['TypeScript', 'Go', 'Redis', 'gRPC'],
    scorecard: scoredCard([3, 3, 3, null, null]),
    notes:
      'Requested a working demo on Jul 12, the deployed instance was already down. Loom and repo are enough to keep evaluating. Parked until the redeploy lands.',
  },

  // 5. Decided — terminal (advanced). Read-only: scorecard locked, decision stamped.
  {
    id: 'sub_3a88',
    candidate: { name: 'Yuki Tanaka', initials: 'YT' },
    role: 'Backend Engineer',
    challengeTitle: 'Rate limiter as a service',
    status: 'advanced',
    submittedAt: '2026-07-08T11:00:00Z',
    decidedBy: 'You',
    decidedAt: '2026-07-10T16:22:00Z',
    approach: {
      state: 'populated',
      body: `I implemented three algorithms behind one interface (token bucket, sliding window log, sliding window counter) so the caller picks the trade-off rather than me guessing. Each has a property test asserting it never allows more than its configured rate over a window.

The interesting decision was storage. I used Redis with a Lua script per algorithm so the check-and-decrement is atomic under contention, which is the whole game for a limiter. Benchmarks for each are in the README.

I would add per-tenant quotas next; the interface already has the seam for it.`,
    },
    demo: {
      state: 'populated',
      url: 'https://ratelimit.tanaka.dev',
      health: 'live',
    },
    gallery: {
      state: 'populated',
      images: ['algorithm-compare', 'benchmark-results'],
    },
    loom: {
      state: 'populated',
      url: 'https://www.loom.com/share/ratelimiter-tour',
      health: 'live',
    },
    repo: {
      state: 'populated',
      url: 'https://github.com/ytanaka/rate-limiter',
      readme: `# rate-limiter

Three algorithms, one interface. Atomic check-and-decrement via Redis Lua.
Property tests assert the rate ceiling holds under a window. Benchmarks below.`,
      languages: [
        { name: 'Go', pct: 79 },
        { name: 'Lua', pct: 13 },
        { name: 'Shell', pct: 8 },
      ],
      commits: 38,
      lastCommit: '2026-07-08T10:15:00Z',
      health: 'live',
    },
    techStack: ['Go', 'Redis', 'Lua', 'Prometheus'],
    scorecard: scoredCard([4, 4, 4, 3, 3]),
    notes:
      'Atomic Lua approach is exactly right for a limiter. Property tests over three algorithms is more rigor than the prompt asked for. Clear advance.',
  },
];
