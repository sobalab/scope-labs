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

// When the current reviewer last opened each candidate's submission. Seeds the
// "last reviewed" column; opening a submission updates it live. Candidates the
// reviewer has not opened yet are absent (they read as "not opened").
export const lastReviewedSeed: Record<string, string> = {
  sub_ea19: '2026-07-15T11:00:00Z', // Mara, 3h ago
  sub_9f61: '2026-07-13T18:00:00Z', // Tomas, 2d ago
  sub_3a88: '2026-07-10T16:22:00Z', // Yuki, decided
  sub_c8b2: '2026-07-14T12:00:00Z', // Chloe, 1d ago
  sub_a1f9: '2026-07-09T14:00:00Z', // Grace, decided
  sub_f3c6: '2026-07-11T10:00:00Z', // Ben, 4d ago
};

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

  // 6. Complete, needs-review — a strong second full submission.
  {
    id: 'sub_5d70',
    candidate: {
      name: 'Ravi Menon',
      initials: 'RM',
      links: {
        linkedin: 'https://www.linkedin.com/in/ravimenon',
        github: 'https://github.com/rmenon',
        portfolio: 'https://ravimenon.dev',
        resume: 'https://ravimenon.dev/ravi-menon-cv.pdf',
      },
    },
    role: 'Backend Engineer',
    challengeTitle: 'Distributed job scheduler',
    status: 'needs-review',
    submittedAt: '2026-07-15T08:30:00Z',
    timeSpentMinutes: 265,
    approach: {
      state: 'populated',
      body: `I treated at-least-once as the floor and idempotency as the caller's contract, because exactly-once across a network is a promise you cannot keep. Workers claim due jobs with SELECT ... FOR UPDATE SKIP LOCKED, so two workers never run the same job even under contention.

Leader election is a Postgres advisory lock; the leader only enqueues due work, the workers do the rest. Retries use exponential backoff with jitter, capped at six attempts, then the job goes to a dead-letter table rather than looping forever.

The parts I tested hardest are the cron parser and the claim query under concurrency. If I had more time I would move the queue off Postgres once throughput outgrows it.`,
    },
    demo: { state: 'populated', url: 'https://jobs.ravimenon.dev', health: 'live' },
    gallery: {
      state: 'populated',
      images: ['scheduler-dashboard', 'job-detail', 'worker-pool'],
    },
    loom: {
      state: 'populated',
      url: 'https://www.loom.com/share/scheduler-tour',
      health: 'live',
    },
    repo: {
      state: 'populated',
      url: 'https://github.com/rmenon/job-scheduler',
      readme: `# job-scheduler

A distributed job scheduler with at-least-once delivery. Workers claim due jobs
with SELECT ... FOR UPDATE SKIP LOCKED, so no two workers run the same job.

## Run

    docker compose up
    go run ./cmd/scheduler
    go test ./...

## Design

Leader election is a Postgres advisory lock; the leader only enqueues due jobs,
workers do the rest. Retries use exponential backoff with jitter, capped at six
attempts, then the job moves to a dead-letter table. Cron expressions are parsed
once and cached.

## Trade-offs

At-least-once, not exactly-once: handlers must be idempotent, and the handler
docs say so. Postgres is the queue for now; I would move it to a dedicated log
once throughput outgrows a single table.`,
      languages: [
        { name: 'Go', pct: 74 },
        { name: 'SQL', pct: 16 },
        { name: 'Shell', pct: 10 },
      ],
      commits: 33,
      lastCommit: '2026-07-15T08:10:00Z',
      commitLog: [
        { sha: '9a3f2c1', message: 'Add jitter to the retry backoff curve', at: '2026-07-15T08:10:00Z' },
        { sha: 'b71e0d4', message: 'Claim due jobs with SKIP LOCKED', at: '2026-07-15T04:30:00Z' },
        { sha: 'c22a9f8', message: 'Leader election via a Postgres advisory lock', at: '2026-07-14T21:00:00Z' },
        { sha: 'e40d7b3', message: 'Parse and cache cron expressions', at: '2026-07-14T17:20:00Z' },
        { sha: '1f5c88a', message: 'Initial commit', at: '2026-07-14T13:00:00Z' },
      ],
      fileTree: [
        'cmd/scheduler/main.go',
        'internal/leader/lock.go',
        'internal/queue/claim.go',
        'internal/queue/claim_test.go',
        'internal/cron/parse.go',
        'internal/retry/backoff.go',
        'docker-compose.yml',
        'go.mod',
        'README.md',
      ],
      health: 'live',
    },
    techStack: ['Go', 'PostgreSQL', 'Redis', 'Docker'],
    scorecard: emptyScorecard(),
  },

  // 7. In-review, partial — strong write-up and repo, but no live demo yet.
  {
    id: 'sub_c8b2',
    candidate: {
      name: 'Chloe Fontaine',
      initials: 'CF',
      links: {
        linkedin: 'https://www.linkedin.com/in/chloefontaine',
        github: 'https://github.com/cfontaine',
        portfolio: 'https://chloefontaine.design',
        resume: 'https://chloefontaine.design/chloe-fontaine-resume.pdf',
      },
    },
    role: 'Frontend Engineer',
    challengeTitle: 'Virtualized data grid',
    status: 'in-review',
    submittedAt: '2026-07-13T10:00:00Z',
    timeSpentMinutes: 220,
    approach: {
      state: 'populated',
      body: `The hard part of a data grid at a hundred thousand rows is not rendering, it is not rendering. Only the visible window lives in the DOM; a spacer above and below fakes the full scroll height, and a fixed row height keeps the offset math O(1).

Sort and filter run in a Web Worker, so the main thread stays at 60fps while you scroll through a freshly sorted set. The column menu and multi-sort are wired, and the tests cover the windowing math at the boundaries.

Variable row heights are stubbed rather than finished, and drag-selection is not done. Both are noted in the README.`,
    },
    demo: { state: 'empty' },
    gallery: {
      state: 'populated',
      images: ['grid-overview', 'column-menu', 'row-selection'],
    },
    loom: { state: 'empty' },
    repo: {
      state: 'populated',
      url: 'https://github.com/cfontaine/data-grid',
      readme: `# data-grid

A virtualized data grid that stays at 60fps with a hundred thousand rows.

## Run

    pnpm install
    pnpm dev
    pnpm test

## How it works

Only the visible rows are in the DOM; a spacer div above and below fakes the
scroll height. Sort and filter run in a Web Worker so scrolling never blocks.
Row height is fixed to keep the offset math O(1).

## Known gaps

Variable row heights are stubbed, not done. Keyboard selection works; drag
selection does not.`,
      languages: [
        { name: 'TypeScript', pct: 88 },
        { name: 'CSS', pct: 12 },
      ],
      commits: 21,
      lastCommit: '2026-07-13T09:40:00Z',
      commitLog: [
        { sha: 'a8d3f01', message: 'Move sort and filter into a worker', at: '2026-07-13T09:40:00Z' },
        { sha: '3c7b210', message: 'Fixed-height row windowing', at: '2026-07-12T22:15:00Z' },
        { sha: 'd90a4e6', message: 'Column menu and multi-sort', at: '2026-07-12T18:00:00Z' },
        { sha: '5b1c7a9', message: 'Initial grid scaffold', at: '2026-07-12T14:30:00Z' },
      ],
      fileTree: [
        'src/Grid.tsx',
        'src/useWindowing.ts',
        'src/Grid.test.tsx',
        'src/worker/sort.ts',
        'src/columns/ColumnMenu.tsx',
        'index.html',
        'package.json',
        'README.md',
      ],
      health: 'live',
    },
    techStack: ['TypeScript', 'React', 'Vite', 'Vitest'],
    scorecard: scoredCard([3, 4, 3, null, null]),
    notes:
      'Windowing is clean and the worker call is the right instinct. Want to see it run before scoring communication and product sense; no demo attached yet.',
  },

  // 8. Complete, needs-review.
  {
    id: 'sub_2e45',
    candidate: {
      name: 'Omar Haddad',
      initials: 'OH',
      links: {
        linkedin: 'https://www.linkedin.com/in/omarhaddad',
        github: 'https://github.com/ohaddad',
        portfolio: 'https://omarhaddad.dev',
        resume: 'https://omarhaddad.dev/omar-haddad-cv.pdf',
      },
    },
    role: 'Full-Stack Engineer',
    challengeTitle: 'URL shortener with analytics',
    status: 'needs-review',
    submittedAt: '2026-07-14T16:00:00Z',
    timeSpentMinutes: 195,
    approach: {
      state: 'populated',
      body: `Shortening a URL is trivial; the interesting parts are collision-free codes and click analytics that never slow the redirect. Short codes are base62 of a Snowflake-style id, so they are short, ordered, and unguessable without a lookup table.

The redirect is a single indexed lookup that returns a 302 immediately. The click event is pushed onto a queue and written to ClickHouse asynchronously, so the hot path never waits on analytics.

Per-link expiry and a creation rate limit are the next two things I would add; the seams are there.`,
    },
    demo: { state: 'populated', url: 'https://sho.rt-demo.app', health: 'live' },
    gallery: { state: 'populated', images: ['link-list', 'analytics-view'] },
    loom: {
      state: 'populated',
      url: 'https://www.loom.com/share/shortener-walkthrough',
      health: 'live',
    },
    repo: {
      state: 'populated',
      url: 'https://github.com/ohaddad/shortlink',
      readme: `# shortlink

A URL shortener with click analytics that never slow the redirect.

## Run

    pnpm install
    pnpm dev        # api + redirect on :8080

## Design

Short codes are base62 of a Snowflake-style id: short, ordered, unguessable.
The redirect is a single indexed lookup; the click event is pushed onto a queue
and written to ClickHouse asynchronously, so the 302 never waits on analytics.

## Next

Per-link expiry and a rate limit on creation.`,
      languages: [
        { name: 'TypeScript', pct: 69 },
        { name: 'Go', pct: 20 },
        { name: 'HTML', pct: 11 },
      ],
      commits: 27,
      lastCommit: '2026-07-14T15:40:00Z',
      commitLog: [
        { sha: '7e2a1b9', message: 'Push click events onto the queue', at: '2026-07-14T15:40:00Z' },
        { sha: 'f13c0d8', message: 'Base62 short-code generation', at: '2026-07-14T12:10:00Z' },
        { sha: 'a67b902', message: 'Redirect via a single indexed lookup', at: '2026-07-14T09:00:00Z' },
        { sha: '2d9f4c1', message: 'Initial commit', at: '2026-07-13T20:00:00Z' },
      ],
      fileTree: [
        'src/api/create.ts',
        'src/api/redirect.ts',
        'src/codes/base62.ts',
        'src/codes/base62.test.ts',
        'ingest/consumer.go',
        'package.json',
        'go.mod',
        'README.md',
      ],
      health: 'live',
    },
    techStack: ['TypeScript', 'Go', 'Redis', 'ClickHouse'],
    scorecard: emptyScorecard(),
  },

  // 9. Decided — terminal (rejected). Read-only, scorecard locked and low.
  {
    id: 'sub_a1f9',
    candidate: {
      name: 'Grace Liu',
      initials: 'GL',
      links: {
        linkedin: 'https://www.linkedin.com/in/graceliu',
        github: 'https://github.com/gliu',
        portfolio: 'https://graceliu.io',
        resume: 'https://graceliu.io/grace-liu-resume.pdf',
      },
    },
    role: 'Platform Engineer',
    challengeTitle: 'Metrics aggregation pipeline',
    status: 'rejected',
    submittedAt: '2026-07-07T09:00:00Z',
    timeSpentMinutes: 150,
    decidedBy: 'You',
    decidedAt: '2026-07-09T14:00:00Z',
    approach: {
      state: 'populated',
      body: `I built an ingestion endpoint that buffers metrics in memory and flushes them to a time-series store on an interval. A Kafka topic sits in front for durability so a restart does not lose the last window.

The aggregation is a straightforward rollup by tag and minute. It works for the happy path in the demo.

Under sustained load the flush falls behind and the buffer starts dropping the oldest points, and I did not get to a backpressure story. It is documented in the README.`,
    },
    demo: { state: 'populated', url: 'https://metrics.graceliu.dev', health: 'live' },
    gallery: { state: 'empty' },
    loom: {
      state: 'populated',
      url: 'https://www.loom.com/share/metrics-tour',
      health: 'live',
    },
    repo: {
      state: 'populated',
      url: 'https://github.com/gliu/metrics-pipe',
      readme: `# metrics-pipe

An ingestion endpoint that buffers metrics and flushes to a time-series store.

## Run

    pip install -r requirements.txt
    python -m metrics.server

## Design

Metrics are buffered in memory and flushed to InfluxDB every five seconds or
when the buffer fills. A Kafka topic sits in front for durability.

## Known issues

Under sustained load the flush falls behind and the buffer drops the oldest
points. There is no backpressure yet.`,
      languages: [
        { name: 'Python', pct: 91 },
        { name: 'Dockerfile', pct: 9 },
      ],
      commits: 14,
      lastCommit: '2026-07-07T08:40:00Z',
      commitLog: [
        { sha: 'c4a7e20', message: 'Flush the buffer to InfluxDB on an interval', at: '2026-07-07T08:40:00Z' },
        { sha: '90f3b1d', message: 'Kafka consumer for durability', at: '2026-07-06T22:00:00Z' },
        { sha: 'a12c8f7', message: 'Ingestion endpoint scaffold', at: '2026-07-06T18:30:00Z' },
        { sha: '3f0d99b', message: 'Initial commit', at: '2026-07-06T15:00:00Z' },
      ],
      fileTree: [
        'metrics/server.py',
        'metrics/buffer.py',
        'metrics/flush.py',
        'metrics/kafka_consumer.py',
        'tests/test_buffer.py',
        'requirements.txt',
        'Dockerfile',
        'README.md',
      ],
      health: 'live',
    },
    techStack: ['Python', 'InfluxDB', 'Kafka'],
    scorecard: scoredCard([2, 2, 2, 3, 2]),
    notes:
      'Basics are there, but the aggregation drops points under load and there is no backpressure. Below the bar for a platform role. Rejected.',
  },

  // 10. Awaiting-candidate — strong entry parked on a rotted demo.
  {
    id: 'sub_f3c6',
    candidate: {
      name: 'Ben Carter',
      initials: 'BC',
      links: {
        linkedin: 'https://www.linkedin.com/in/bencarter',
        github: 'https://github.com/bcarter',
        portfolio: 'https://bencarter.dev',
        resume: 'https://bencarter.dev/ben-carter-cv.pdf',
      },
    },
    role: 'Senior Backend Engineer',
    challengeTitle: 'Distributed cache',
    status: 'awaiting-candidate',
    submittedAt: '2026-07-09T12:00:00Z',
    timeSpentMinutes: 290,
    approach: {
      state: 'populated',
      body: `Consistent hashing with virtual nodes is the spine: 128 virtual nodes per physical node, so adding a node moves about 1/N of the keys instead of reshuffling everything. That is the property that makes scaling boring, which is what you want.

Writes are write-through with a short TTL, and a single-flight guard collapses concurrent misses for the same key so a cold key cannot stampede the origin. Node-to-node traffic is gRPC.

I deployed a demo and recorded a walkthrough of the ring rebalancing when a node joins. The consistent-hashing tests are the part I am most proud of.`,
    },
    demo: { state: 'error', url: 'https://cache.bencarter.dev', health: 'unreachable' },
    gallery: { state: 'populated', images: ['ring-visualizer', 'node-detail'] },
    loom: {
      state: 'populated',
      url: 'https://www.loom.com/share/cache-tour',
      health: 'live',
    },
    repo: {
      state: 'populated',
      url: 'https://github.com/bcarter/dcache',
      readme: `# dcache

A distributed cache with consistent hashing and write-through.

## Run

    make dev        # starts a 3-node ring locally
    go test ./...

## Design

Consistent hashing with 128 virtual nodes per physical node, so adding a node
moves about 1/N of the keys. Writes are write-through with a short TTL; a
single-flight guard collapses concurrent misses for the same key so a cold key
cannot stampede the origin. Node-to-node traffic is gRPC.

## Trade-offs

Eventual consistency across replicas. Rebalancing streams keys lazily on the
next read rather than eagerly.`,
      languages: [
        { name: 'Go', pct: 82 },
        { name: 'Shell', pct: 18 },
      ],
      commits: 41,
      lastCommit: '2026-07-09T11:30:00Z',
      commitLog: [
        { sha: 'e91a3f7', message: 'Single-flight guard on cache miss', at: '2026-07-09T11:30:00Z' },
        { sha: 'b40c2d8', message: 'Consistent hashing with virtual nodes', at: '2026-07-09T06:00:00Z' },
        { sha: 'a7f1c93', message: 'Write-through with a short TTL', at: '2026-07-08T21:00:00Z' },
        { sha: 'd23b8a0', message: 'gRPC node-to-node protocol', at: '2026-07-08T16:00:00Z' },
        { sha: '5c9e017', message: 'Initial commit', at: '2026-07-08T12:00:00Z' },
      ],
      fileTree: [
        'cmd/dcache/main.go',
        'ring/consistent.go',
        'ring/consistent_test.go',
        'cache/writethrough.go',
        'cache/singleflight.go',
        'proto/node.proto',
        'Makefile',
        'go.mod',
        'README.md',
      ],
      health: 'live',
    },
    techStack: ['Go', 'gRPC', 'Redis'],
    scorecard: scoredCard([4, 3, 4, null, null]),
    requested: 'a live demo',
    notes:
      'Consistent-hashing implementation is the real thing. Demo spun down; asked for a redeploy before finishing the score.',
  },
];
