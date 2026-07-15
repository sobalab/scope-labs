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

// The candidate's own profiles, distinct from the submission's repo. Each is
// optional so a profile with a missing link degrades gracefully.
export interface CandidateLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  resume?: string;
}

export interface Submission {
  id: string;
  candidate: { name: string; initials: string; links: CandidateLinks };
  role: string;
  challengeTitle: string;
  status: Lifecycle;
  submittedAt: string; // ISO
  timeSpentMinutes: number; // how long the candidate worked on the take-home
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
    // Recent commits, newest first. Each links out to the commit on the host.
    commitLog?: { sha: string; message: string; at: string }[];
    // Flat list of file paths; the tree is built from these for display.
    fileTree?: string[];
    health?: LinkHealth;
  };
  techStack: string[];
  scorecard: RubricScore[];
  notes?: string;
  // What the reviewer last asked the candidate for, shown while awaiting them.
  requested?: string;
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

// The open req these candidates all applied to. The per-candidate `role` field
// is each applicant's current title; this is the role being hired for.
export const rolePosting = 'Senior Software Engineer';

// The take-home's suggested time budget. Shown alongside each candidate's actual
// time worked so the reviewer can read effort against the guide, transparently.
export const suggestedTimeMinutes = 240; // 4 hours

// The reviewers on this role. `currentReviewer` is who is signed in; the rest
// share the queue, so the profile menu makes it clear who else is reviewing.
export const currentReviewer = { name: 'Alex Chen', initials: 'AC' };
export const reviewers = [
  currentReviewer,
  { name: 'Sam Rivera', initials: 'SR' },
  { name: 'Nina Kovač', initials: 'NK' },
];

const emptyScorecard = (): RubricScore[] =>
  RUBRIC_CRITERIA.map((criterion) => ({ criterion, score: null, max: 4 }));

const scoredCard = (scores: (number | null)[]): RubricScore[] =>
  RUBRIC_CRITERIA.map((criterion, i) => ({
    criterion,
    score: scores[i] ?? null,
    max: 4,
  }));

// Full README bodies. The RepoSummary renders the whole thing in a scroll region.
const streamReadme = `# realtime-ledger

A double-entry ledger with an append-only event log and a projection layer
for account balances. Writes go through a single command handler so every
mutation is validated before it lands.

## Contents
- Running locally
- Architecture
- The write path
- Balances as a projection
- Reconciliation
- Testing
- Trade-offs
- What I'd do next

## Running locally

    pnpm install
    pnpm dev        # api on :4000, web on :5173
    pnpm test       # unit + property tests

Requires Node 20+ and a local Postgres (or run \`docker compose up db\`). Copy
\`.env.example\` to \`.env\`; the defaults point at the docker database.

## Architecture

Three layers, deliberately boring:

- \`command/\`  a single handler that validates and appends events. No writes
  happen anywhere else, so there is exactly one place that can corrupt state.
- \`events/\`   the append-only log plus the event schemas.
- \`read/\`     projections folded from the log. Swappable and disposable.

The API is Fastify; the read model is Postgres; the log is a Postgres table
with an exclusion constraint on (account, sequence) so out-of-order or
duplicate events cannot land.

## The write path

Every mutation is a command. The handler:

1. loads the current sequence for the account,
2. validates the command against the folded balance,
3. appends the resulting event, and
4. only then acknowledges to the caller.

If step 3 fails, the caller gets an error and no partial state exists.

## Balances as a projection

Balances are never stored directly. They are folded from the event stream on
read and cached per account, invalidated on new events. This keeps the write
path honest and makes audit trivial: replay the log, you get the state.

## Reconciliation

The interesting failure modes live here: partial writes, out-of-order events,
and the replay path after a cache miss. \`GET /accounts/:id/reconcile\` re-folds
from event zero and diffs against the cache; the tests exercise each path.

## Testing

    pnpm test

Property tests assert that no sequence of valid commands can produce a negative
balance or a gap in the log. The reconciliation path has its own suite that
injects out-of-order and duplicate events.

## Trade-offs

Trade-off I accepted under the time limit: the projection cache is in-memory,
so a restart re-folds from event zero. Fine at this scale, not at production
volume.

I also skipped auth and multi-currency. Both are real, neither is the
interesting part of this challenge.

## What I'd do next

- Move the projection cache out of process (Redis) so restarts are cheap.
- Add backpressure on the command queue under write bursts.
- Snapshot the log every N events so reconciliation does not re-fold from zero.`;

const bareReadme = `# take-home

Submission for the platform engineer take-home: a small file-sync daemon.

## Setup

    npm install
    npm start        # runs on :3000
    make test

Runs on port 3000. I focused on getting the core sync loop correct rather than
the UI, so most of the work is in \`src/sync\`. There is no deployed demo; clone
and run to see it.

## How it works

A single watcher (fsnotify) feeds a debounced queue. Events are coalesced per
path so a burst of writes to one file becomes one sync. The index that maps
paths to content hashes lives in SQLite so restarts are cheap.

- \`src/sync\`    the loop: watch, debounce, diff, write.
- \`src/index\`   the SQLite-backed path/hash index.
- \`src/watch\`   the fsnotify wrapper and rename handling.

## Known gaps

- Renames are handled, but a rename plus an edit inside the debounce window can
  still double-sync. Documented in \`NOTES.md\`.
- No conflict resolution for two writers; last write wins.

## What I'd add

Content-addressed chunks so large files sync deltas, not the whole file.`;

export const submissions: Submission[] = [
  // 1. Complete — the strong, fully-evidenced submission. Everything populated.
  {
    id: 'sub_ea19',
    candidate: {
      name: 'Mara Osei',
      initials: 'MO',
      links: {
        linkedin: 'https://www.linkedin.com/in/maraosei',
        github: 'https://github.com/mosei',
        portfolio: 'https://maraosei.dev',
        resume: 'https://maraosei.dev/mara-osei-cv.pdf',
      },
    },
    role: 'Senior Full-Stack Engineer',
    challengeTitle: 'Realtime ledger service',
    status: 'in-review',
    submittedAt: '2026-07-14T09:12:00Z',
    timeSpentMinutes: 280,
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
      commitLog: [
        { sha: '7f3a2b1', message: 'Add reconciliation endpoint with replay-after-miss test', at: '2026-07-14T08:40:00Z' },
        { sha: 'c41d9e0', message: 'Fold balances from the event stream, cache per account', at: '2026-07-14T05:12:00Z' },
        { sha: 'a90b7c4', message: 'Validate commands before append, ack only after', at: '2026-07-13T21:38:00Z' },
        { sha: 'e28f150', message: 'Scaffold event log and projection layer', at: '2026-07-13T17:02:00Z' },
        { sha: '1b6d33a', message: 'Initial commit', at: '2026-07-13T14:20:00Z' },
      ],
      fileTree: [
        'src/command/handler.ts',
        'src/command/validate.ts',
        'src/events/log.ts',
        'src/events/schema.ts',
        'src/read/balances.ts',
        'src/read/reconcile.ts',
        'src/server.ts',
        'test/ledger.test.ts',
        'test/reconcile.test.ts',
        'docker-compose.yml',
        'package.json',
        'README.md',
      ],
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
    candidate: {
      name: 'Devin Park',
      initials: 'DP',
      links: {
        linkedin: 'https://www.linkedin.com/in/devinpark',
        github: 'https://github.com/dpark',
        portfolio: 'https://devpark.io',
        resume: 'https://devpark.io/resume.pdf',
      },
    },
    role: 'Platform Engineer',
    challengeTitle: 'File sync daemon',
    status: 'needs-review',
    submittedAt: '2026-07-15T02:47:00Z',
    timeSpentMinutes: 130,
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
      commitLog: [
        { sha: '9c2e77b', message: 'Handle rename events in the sync loop', at: '2026-07-15T01:55:00Z' },
        { sha: '4a0f1d8', message: 'Debounce fsnotify events, batch writes', at: '2026-07-15T00:31:00Z' },
        { sha: 'd7b3a90', message: 'Add SQLite index for path lookups', at: '2026-07-14T22:10:00Z' },
        { sha: '2f9c845', message: 'Initial sync daemon', at: '2026-07-14T19:44:00Z' },
      ],
      fileTree: [
        'cmd/syncd/main.go',
        'src/sync/loop.go',
        'src/sync/diff.go',
        'src/index/sqlite.go',
        'src/watch/fsnotify.go',
        'Makefile',
        'go.mod',
        'NOTES.md',
        'README.md',
      ],
      health: 'live',
    },
    techStack: ['Go', 'SQLite', 'fsnotify'],
    scorecard: emptyScorecard(),
  },

  // 3. All-rotted — strong entry submitted weeks ago; demo spun down, Loom deleted,
  //    repo went private. Every external artifact is in error at once.
  {
    id: 'sub_b204',
    candidate: {
      name: 'Priya Nair',
      initials: 'PN',
      links: {
        linkedin: 'https://www.linkedin.com/in/priyanair',
        github: 'https://github.com/pnair',
        portfolio: 'https://priyanair.design',
        resume: 'https://priyanair.design/priya-nair-cv.pdf',
      },
    },
    role: 'Senior Frontend Engineer',
    challengeTitle: 'Collaborative whiteboard',
    status: 'needs-review',
    submittedAt: '2026-06-24T15:30:00Z',
    timeSpentMinutes: 305,
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
    candidate: {
      name: 'Tomas Reyes',
      initials: 'TR',
      links: {
        linkedin: 'https://www.linkedin.com/in/tomasreyes',
        github: 'https://github.com/treyes',
        portfolio: 'https://reyes.dev',
        resume: 'https://reyes.dev/tomas-reyes-resume.pdf',
      },
    },
    role: 'Full-Stack Engineer',
    challengeTitle: 'Feature-flag service',
    status: 'awaiting-candidate',
    submittedAt: '2026-07-11T18:05:00Z',
    timeSpentMinutes: 230,
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
      commitLog: [
        { sha: 'b83c1a2', message: 'Document percentage-rollout edge case in ISSUES.md', at: '2026-07-11T17:20:00Z' },
        { sha: '5e6f209', message: 'Add local cache with pub/sub invalidation', at: '2026-07-11T14:03:00Z' },
        { sha: 'a17d4c8', message: 'Pure-function flag evaluation with tests', at: '2026-07-11T10:47:00Z' },
        { sha: '3c90b71', message: 'Initial commit', at: '2026-07-10T20:15:00Z' },
      ],
      fileTree: [
        'src/eval/evaluate.ts',
        'src/eval/evaluate.test.ts',
        'src/cache/pubsub.ts',
        'src/admin/server.ts',
        'ISSUES.md',
        'Makefile',
        'package.json',
        'README.md',
      ],
      health: 'live',
    },
    techStack: ['TypeScript', 'Go', 'Redis', 'gRPC'],
    scorecard: scoredCard([3, 3, 3, null, null]),
    requested: 'a live demo',
    notes:
      'Requested a working demo on Jul 12, the deployed instance was already down. Loom and repo are enough to keep evaluating. Parked until the redeploy lands.',
  },

  // 5. Decided — terminal (advanced). Read-only: scorecard locked, decision stamped.
  {
    id: 'sub_3a88',
    candidate: {
      name: 'Yuki Tanaka',
      initials: 'YT',
      links: {
        linkedin: 'https://www.linkedin.com/in/yukitanaka',
        github: 'https://github.com/ytanaka',
        portfolio: 'https://yukitanaka.engineering',
        resume: 'https://yukitanaka.engineering/cv.pdf',
      },
    },
    role: 'Backend Engineer',
    challengeTitle: 'Rate limiter as a service',
    status: 'advanced',
    submittedAt: '2026-07-08T11:00:00Z',
    timeSpentMinutes: 255,
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
      commitLog: [
        { sha: 'f2a5c30', message: 'Add sliding-window-counter algorithm and property test', at: '2026-07-08T10:15:00Z' },
        { sha: '6b1e9d7', message: 'Atomic check-and-decrement via Redis Lua', at: '2026-07-08T06:52:00Z' },
        { sha: 'c9083af', message: 'Token bucket behind the limiter interface', at: '2026-07-07T23:19:00Z' },
        { sha: '0d47e21', message: 'Benchmarks for all three algorithms', at: '2026-07-07T18:40:00Z' },
        { sha: '8a2f66c', message: 'Initial commit', at: '2026-07-07T15:05:00Z' },
      ],
      fileTree: [
        'limiter/interface.go',
        'limiter/tokenbucket.go',
        'limiter/sliding_window.go',
        'limiter/sliding_counter.go',
        'lua/token_bucket.lua',
        'lua/sliding.lua',
        'bench/bench_test.go',
        'main.go',
        'go.mod',
        'README.md',
      ],
      health: 'live',
    },
    techStack: ['Go', 'Redis', 'Lua', 'Prometheus'],
    scorecard: scoredCard([4, 4, 4, 3, 3]),
    notes:
      'Atomic Lua approach is exactly right for a limiter. Property tests over three algorithms is more rigor than the prompt asked for. Clear advance.',
  },
];
