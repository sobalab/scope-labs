import { useMemo } from 'react';

// A stand-in "screenshot" of a candidate's deployed app. No real image files
// (the prototype is self-contained), so this renders a convincing product UI —
// top bar, sidebar, KPIs, a chart, a table — in the cool palette. It reads as a
// real deployed screen rather than an abstract grey placeholder. A seed varies
// the numbers, chart shape, and which layout renders, so different tiles and
// different candidates look like genuinely different products.

// Small deterministic RNG (mulberry32 seeded from a string) so a given seed
// always renders the same screen — no flicker on re-render, no Math.random.
function rng(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function series(next: () => number, n: number, base: number, spread: number) {
  const pts: number[] = [];
  let v = base;
  for (let i = 0; i < n; i++) {
    v += (next() - 0.42) * spread;
    v = Math.max(base * 0.4, Math.min(base * 1.7, v));
    pts.push(v);
  }
  return pts;
}

function path(pts: number[], w: number, h: number, pad = 2) {
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const rng2 = max - min || 1;
  const step = (w - pad * 2) / (pts.length - 1);
  return pts
    .map((p, i) => {
      const x = pad + i * step;
      const y = pad + (1 - (p - min) / rng2) * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}

const ACCENT = '#5a7183';

function Spark({ pts, w = 68, h = 22 }: { pts: number[]; w?: number; h?: number }) {
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <path d={path(pts, w, h)} fill="none" stroke={ACCENT} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  );
}

// A shared app frame: brand, sidebar nav, and a main slot.
function Frame({
  title,
  nav,
  active,
  children,
}: {
  title: string;
  nav: string[];
  active: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full text-[var(--ink)]" style={{ background: 'var(--surface)' }}>
      {/* sidebar */}
      <div
        className="hidden w-[18%] min-w-[92px] flex-col gap-[3%] p-[3%] sm:flex"
        style={{ background: 'var(--surface-sunk)', borderRight: '1px solid var(--border)' }}
      >
        <div className="mb-[6%] flex items-center gap-[6px]">
          <span className="h-[14px] w-[14px] rounded-[4px]" style={{ background: ACCENT }} />
          <span className="truncate text-[10px] font-medium">{title}</span>
        </div>
        {nav.map((n, i) => (
          <div
            key={n}
            className="flex items-center gap-[6px] rounded-[6px] px-[6px] py-[5px]"
            style={i === active ? { background: 'var(--accent-soft)' } : undefined}
          >
            <span
              className="h-[9px] w-[9px] rounded-[3px]"
              style={{ background: i === active ? ACCENT : 'var(--border-strong)' }}
            />
            <span
              className="h-[5px] flex-1 rounded-full"
              style={{ background: i === active ? 'var(--accent-line)' : 'var(--border)' }}
            />
          </div>
        ))}
      </div>
      {/* main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className="flex items-center justify-between px-[4%] py-[2.6%]"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="h-[6px] w-[26%] rounded-full" style={{ background: 'var(--border-strong)' }} />
          <div className="flex items-center gap-[8px]">
            <span className="h-[7px] w-[46px] rounded-full" style={{ background: 'var(--surface-sunk)' }} />
            <span className="h-[16px] w-[16px] rounded-full" style={{ background: 'linear-gradient(150deg,#5a7183,#3f5666)' }} />
          </div>
        </div>
        <div className="min-h-0 flex-1 p-[4%]">{children}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, delta, pts }: { label: string; value: string; delta: string; pts: number[] }) {
  const up = !delta.startsWith('-');
  return (
    <div className="flex-1 rounded-[10px] p-[10px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="mb-[6px] text-[9px] uppercase tracking-[0.08em] text-[var(--muted)]">{label}</div>
      <div className="flex items-end justify-between gap-[6px]">
        <div>
          <div className="text-[17px] font-medium leading-none">{value}</div>
          <div className="mt-[5px] text-[9px]" style={{ color: up ? ACCENT : 'var(--danger)' }}>
            {up ? '↑' : '↓'} {delta.replace('-', '')}
          </div>
        </div>
        <Spark pts={pts} />
      </div>
    </div>
  );
}

interface MockAppScreenProps {
  seed: string;
  title?: string;
  className?: string;
}

// Three distinct layouts (overview / table / detail) chosen by seed, so a
// gallery of screenshots reads as different views of one real app.
export function MockAppScreen({ seed, title = 'Console', className = '' }: MockAppScreenProps) {
  const model = useMemo(() => {
    const next = rng(seed);
    const layout = Math.floor(next() * 3);
    const nav = ['Overview', 'Activity', 'Records', 'Reports', 'Settings'];
    const active = Math.floor(next() * 4);
    const money = () => `$${(3 + next() * 90).toFixed(1)}k`;
    const pct = () => `${(1 + next() * 24).toFixed(1)}%`;
    const stats = [
      { label: 'Throughput', value: `${(0.4 + next() * 9).toFixed(1)}k/s`, delta: pct(), pts: series(next, 12, 40, 20) },
      { label: 'Ledger balance', value: money(), delta: pct(), pts: series(next, 12, 60, 24) },
      { label: 'P99 latency', value: `${(8 + next() * 90).toFixed(0)}ms`, delta: `-${pct()}`, pts: series(next, 12, 50, 26) },
    ];
    const chart = series(next, 26, 55, 30);
    const rows = Array.from({ length: 6 }, () => ({
      w: 30 + Math.floor(next() * 45),
      tone: next() > 0.72 ? 'warn' : next() > 0.45 ? 'ok' : 'neutral',
      val: (next() * 100).toFixed(1),
    }));
    return { layout, nav, active, stats, chart, rows };
  }, [seed]);

  const toneColor: Record<string, string> = {
    ok: 'var(--ok)',
    warn: 'var(--warn)',
    neutral: 'var(--muted)',
  };

  return (
    <div className={`h-full w-full ${className}`}>
      <Frame title={title} nav={model.nav} active={model.active}>
        {model.layout === 0 && (
          <div className="flex h-full flex-col gap-[10px]">
            <div className="flex gap-[10px]">
              {model.stats.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </div>
            <div className="min-h-0 flex-1 rounded-[10px] p-[12px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="mb-[8px] flex items-center justify-between">
                <span className="h-[6px] w-[80px] rounded-full" style={{ background: 'var(--border-strong)' }} />
                <span className="rounded-full px-[10px] py-[3px] text-[9px] text-white" style={{ background: 'var(--ink)' }}>
                  Last 30 days
                </span>
              </div>
              <Chart pts={model.chart} />
            </div>
          </div>
        )}

        {model.layout === 1 && (
          <div className="flex h-full flex-col gap-[10px]">
            <div className="flex items-center justify-between">
              <span className="h-[7px] w-[100px] rounded-full" style={{ background: 'var(--border-strong)' }} />
              <span className="h-[22px] w-[120px] rounded-full" style={{ background: 'var(--surface-sunk)', border: '1px solid var(--border)' }} />
            </div>
            <div className="min-h-0 flex-1 overflow-hidden rounded-[10px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              {model.rows.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-[10px] px-[12px] py-[9px]"
                  style={{ borderBottom: i < model.rows.length - 1 ? '1px solid var(--border)' : undefined }}
                >
                  <span className="h-[16px] w-[16px] rounded-[5px]" style={{ background: 'var(--surface-sunk)' }} />
                  <span className="h-[6px] rounded-full" style={{ width: `${r.w}%`, background: 'var(--border-strong)' }} />
                  <span className="flex-1" />
                  <span className="text-[9px] text-[var(--muted)]">{r.val}</span>
                  <span className="rounded-full px-[8px] py-[2px] text-[8px] uppercase tracking-[0.06em]" style={{ background: 'var(--accent-soft)', color: toneColor[r.tone] }}>
                    {r.tone === 'ok' ? 'passing' : r.tone === 'warn' ? 'flaky' : 'queued'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {model.layout === 2 && (
          <div className="flex h-full gap-[10px]">
            <div className="flex flex-[1.4] flex-col gap-[8px] rounded-[10px] p-[12px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <span className="h-[7px] w-[60%] rounded-full" style={{ background: 'var(--border-strong)' }} />
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex flex-col gap-[4px]">
                  <span className="h-[5px] w-[34%] rounded-full" style={{ background: 'var(--border)' }} />
                  <span className="h-[9px] w-full rounded-[5px]" style={{ background: 'var(--surface-sunk)', border: '1px solid var(--border)' }} />
                </div>
              ))}
            </div>
            <div className="flex flex-1 flex-col gap-[10px]">
              <div className="rounded-[10px] p-[12px]" style={{ background: 'var(--accent-soft)' }}>
                <div className="mb-[6px] text-[9px] uppercase tracking-[0.08em]" style={{ color: ACCENT }}>Status</div>
                <div className="text-[15px] font-medium" style={{ color: ACCENT }}>Healthy</div>
                <Spark pts={model.chart.slice(0, 12)} w={120} h={26} />
              </div>
              <div className="min-h-0 flex-1 rounded-[10px] p-[12px]" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <Chart pts={model.chart} />
              </div>
            </div>
          </div>
        )}
      </Frame>
    </div>
  );
}

// Area + line chart with a faint baseline grid.
function Chart({ pts }: { pts: number[] }) {
  const w = 300;
  const h = 96;
  const d = path(pts, w, h, 3);
  const area = `${d} L${w - 3} ${h - 3} L3 ${h - 3} Z`;
  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block">
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="3" x2={w - 3} y1={h * g} y2={h * g} stroke="var(--border)" strokeWidth="0.8" />
      ))}
      <path d={area} fill={ACCENT} opacity="0.09" />
      <path d={d} fill="none" stroke={ACCENT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
