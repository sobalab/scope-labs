// Stand-in file contents for the in-interface code viewer. There is no real
// repository, so each file resolves to a realistic, language-appropriate
// snippet: hand-authored for the signature files, and a coherent per-language
// fallback (seeded by the path) for the rest. The point is the review flow —
// reading a candidate's code without leaving the tool — not literal builds.

const base = (p: string) => p.split('/').pop() ?? p;
const ext = (p: string) => (p.includes('.') ? p.split('.').pop()! : '');

const SPECIFIC: Record<string, string> = {
  'handler.ts': `import { EventLog } from '../events/log';
import { validate } from './validate';
import type { Command, Event } from '../events/schema';

// Every mutation flows through here: validate, append, then acknowledge. There
// is exactly one place that can write, so exactly one place that can corrupt.
export async function handle(cmd: Command, log: EventLog): Promise<Event> {
  const seq = await log.sequenceFor(cmd.account);
  const balance = await log.fold(cmd.account);

  const error = validate(cmd, balance);
  if (error) throw new CommandError(error);

  const event = toEvent(cmd, seq + 1);
  await log.append(event);
  return event;
}

export class CommandError extends Error {}
`,
  'validate.ts': `import type { Command } from '../events/schema';

// Pure and total: given a command and the current balance, either null (ok) or
// the reason it cannot land. No I/O, so it is trivial to test exhaustively.
export function validate(cmd: Command, balance: number): string | null {
  if (cmd.amount <= 0) return 'amount must be positive';
  if (cmd.type === 'debit' && cmd.amount > balance) return 'insufficient funds';
  return null;
}
`,
  'evaluate.ts': `import type { Flag, Context } from './types';

// Flag evaluation is the hot path, so it is a pure function over config and a
// context with no I/O. Everything cold (admin, persistence) lives elsewhere.
export function evaluate(flag: Flag, ctx: Context): boolean {
  if (!flag.enabled) return false;
  for (const rule of flag.rules) {
    if (matches(rule, ctx)) return rule.value;
  }
  return bucket(ctx.userId, flag.rollout);
}

// Deterministic bucketing so a user stays on the same side of a rollout.
function bucket(id: string, pct: number): boolean {
  return hash(id) % 100 < pct;
}
`,
  'token_bucket.lua': `-- Atomic check-and-decrement. Running inside Redis means the whole check
-- happens under a single lock, which is the entire game for a rate limiter.
local key  = KEYS[1]
local rate = tonumber(ARGV[1])
local ttl  = tonumber(ARGV[2])

local tokens = tonumber(redis.call('get', key) or rate)
if tokens < 1 then
  return 0
end

redis.call('set', key, tokens - 1, 'PX', ttl)
return 1
`,
  'sliding.lua': `-- Sliding-window counter: weight the previous window by how far we are into
-- the current one, then compare the estimate against the configured rate.
local prev = tonumber(redis.call('get', KEYS[1]) or 0)
local curr = tonumber(redis.call('get', KEYS[2]) or 0)
local elapsed = tonumber(ARGV[1])
local rate = tonumber(ARGV[2])

local estimate = prev * (1 - elapsed) + curr
if estimate >= rate then return 0 end

redis.call('incr', KEYS[2])
return 1
`,
  'sliding_counter.go': `package limiter

import "time"

// SlidingWindowCounter approximates a sliding window with two fixed buckets,
// weighting the previous bucket by how far into the current one we are.
type SlidingWindowCounter struct {
	rate   int
	window time.Duration
}

func (s *SlidingWindowCounter) Allow(now time.Time, prev, curr int) bool {
	elapsed := float64(now.UnixNano()%int64(s.window)) / float64(s.window)
	estimate := float64(prev)*(1-elapsed) + float64(curr)
	return estimate < float64(s.rate)
}
`,
  'interface.go': `package limiter

import "time"

// Limiter is the one seam every algorithm implements, so the caller picks the
// trade-off (token bucket, sliding log, sliding counter) rather than us.
type Limiter interface {
	Allow(key string, now time.Time) (bool, error)
}

// New returns the limiter named by algo, or an error for an unknown name.
func New(algo string, rate int) (Limiter, error) {
	switch algo {
	case "token_bucket":
		return &TokenBucket{rate: rate}, nil
	case "sliding_window":
		return &SlidingWindow{rate: rate}, nil
	default:
		return nil, fmt.Errorf("unknown algorithm %q", algo)
	}
}
`,
  'loop.go': `package sync

// The sync loop: watch, debounce, diff, write. Events for one path are coalesced
// so a burst of writes to a file becomes a single sync.
func (d *Daemon) Run(ctx context.Context) error {
	events := d.watcher.Events()
	pending := newDebouncer(150 * time.Millisecond)

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case e := <-events:
			pending.add(e.Path)
		case path := <-pending.ready():
			if err := d.syncPath(path); err != nil {
				log.Printf("sync %s: %v", path, err)
			}
		}
	}
}
`,
  'main.go': `package main

import (
	"log"
	"net/http"
)

func main() {
	srv, err := NewServer()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", srv))
}
`,
  'server.ts': `import Fastify from 'fastify';
import { handle } from './command/handler';
import { reconcile } from './read/reconcile';

export function buildServer(log: EventLog) {
  const app = Fastify({ logger: true });

  app.post('/accounts/:id/commands', async (req) => {
    return handle(req.body as Command, log);
  });

  app.get('/accounts/:id/reconcile', async (req) => {
    return reconcile(req.params.id, log);
  });

  return app;
}
`,
  'package.json': `{
  "name": "realtime-ledger",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "test": "vitest run",
    "build": "tsc -p ."
  },
  "dependencies": {
    "fastify": "^4.26.0",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "typescript": "^5.4.0",
    "vitest": "^1.4.0"
  }
}
`,
  'go.mod': `module github.com/candidate/take-home

go 1.22

require (
	github.com/mattn/go-sqlite3 v1.14.22
	github.com/redis/go-redis/v9 v9.5.1
)
`,
  'Makefile': `.PHONY: dev test bench

dev:
	go run ./cmd/...

test:
	go test ./...

bench:
	go test -bench=. -benchmem ./bench
`,
  'docker-compose.yml': `services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: ledger
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
`,
};

function testFile(p: string): string {
  const isGo = ext(p) === 'go';
  if (isGo) {
    return `package ${p.split('/')[0] || 'main'}

import "testing"

// Property: no sequence of valid operations can breach the configured ceiling.
func TestNeverExceedsRate(t *testing.T) {
	l := New(100)
	for i := 0; i < 100; i++ {
		if !l.Allow("k", now()) {
			t.Fatalf("rejected within rate at %d", i)
		}
	}
	if l.Allow("k", now()) {
		t.Fatal("allowed request over the rate")
	}
}
`;
  }
  return `import { describe, it, expect } from 'vitest';
import { handle } from '../src/command/handler';
import { memoryLog } from './helpers';

describe('${base(p).replace(/\\.test\\.ts$/, '')}', () => {
  it('never allows a negative balance', async () => {
    const log = memoryLog();
    await handle({ account: 'a', type: 'credit', amount: 100 }, log);
    await expect(
      handle({ account: 'a', type: 'debit', amount: 150 }, log),
    ).rejects.toThrow('insufficient funds');
  });

  it('folds balances from the event stream', async () => {
    const log = memoryLog();
    await handle({ account: 'a', type: 'credit', amount: 40 }, log);
    await handle({ account: 'a', type: 'credit', amount: 60 }, log);
    expect(await log.fold('a')).toBe(100);
  });
});
`;
}

function fallback(p: string): string {
  const name = base(p).replace(/\.[^.]+$/, '');
  const e = ext(p);
  if (e === 'go') {
    return `package ${p.split('/').slice(-2, -1)[0] || 'main'}

// ${name}: see the tests alongside this file for the behaviour it guarantees.
type ${cap(name)} struct {
	// unexported fields elided
}

func (${name[0]} *${cap(name)}) Do(ctx context.Context) error {
	return nil
}
`;
  }
  if (e === 'ts') {
    return `// ${base(p)}
export interface ${cap(name)} {
  // shape elided for brevity
}

export function create${cap(name)}(): ${cap(name)} {
  return {} as ${cap(name)};
}
`;
  }
  if (e === 'lua') {
    return `-- ${base(p)}
return function(KEYS, ARGV)
  return 1
end
`;
  }
  return `# ${base(p)}\n`;
}

const cap = (s: string) =>
  s.replace(/[-_.]/g, ' ').replace(/(^|\s)\S/g, (m) => m.toUpperCase()).replace(/\s/g, '');

const langByExt: Record<string, string> = {
  ts: 'TypeScript',
  go: 'Go',
  lua: 'Lua',
  json: 'JSON',
  yml: 'YAML',
  yaml: 'YAML',
  md: 'Markdown',
  mod: 'Go module',
};

export interface FileContent {
  content: string;
  lang: string;
}

export function fileContent(path: string, readme?: string): FileContent {
  const b = base(path);
  const lang = b === 'Makefile' ? 'Make' : langByExt[ext(path)] ?? 'Text';
  if (/(\.test\.ts|_test\.go)$/.test(b)) return { content: testFile(path), lang };
  if (b === 'README.md' && readme) return { content: readme, lang };
  if (SPECIFIC[b]) return { content: SPECIFIC[b], lang };
  return { content: fallback(path), lang };
}
