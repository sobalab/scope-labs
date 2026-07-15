import type { CSSProperties } from 'react';

export interface SpectrumItem {
  label: string; // short mono label, rides inside the marker chip
  value: number;
  avg?: number; // optional faint cohort tick
}

interface SpectrumScoreProps {
  items: SpectrumItem[];
  axisLeft?: string;
  axisRight?: string;
  max?: number;
  finish?: 'dark' | 'light';
  title?: string;
  className?: string;
}

// The system's signature data component. Each criterion is a spectrum from
// axisLeft to axisRight; a mono-labelled marker sits at the score with a dashed
// remainder. Used here as the read-only representation of a decided scorecard,
// which is where a display-only spectrum belongs.
//
// The marker track is inset (10%..90%) rather than 0..100 so the label chip
// never clips the edge of the narrow evaluation rail; the exact value still
// rides in the chip, and the axis captions carry the ends.
export function SpectrumScore({
  items,
  axisLeft = 'Needs work',
  axisRight = 'Exceptional',
  max = 4,
  finish = 'dark',
  title,
  className = '',
}: SpectrumScoreProps) {
  const dark = finish === 'dark';
  const c = {
    baseline: dark ? 'rgba(255,255,255,.2)' : 'rgba(20,30,45,.16)',
    fill: dark ? 'rgba(255,255,255,.72)' : 'var(--accent)',
    tick: dark ? 'rgba(255,255,255,.35)' : 'rgba(20,30,45,.2)',
    chipBg: dark ? 'rgba(255,255,255,.95)' : 'var(--surface)',
    chipBorder: dark ? 'transparent' : 'var(--border-strong)',
    chipText: dark ? '#2f353c' : 'var(--dark-glass)',
    axis: dark ? 'rgba(255,255,255,.5)' : 'var(--muted)',
    eyebrow: dark ? 'rgba(255,255,255,.55)' : 'var(--muted)',
    dots: dark ? 'rgba(255,255,255,.16)' : 'rgba(20,30,45,.07)',
  };
  const container: CSSProperties = dark
    ? { background: 'var(--glass-dark-bg)', boxShadow: 'var(--shadow-dark)', color: '#fff' }
    : {
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
      };

  const track = (v: number) => 10 + Math.max(0, Math.min(1, v / max)) * 80;

  return (
    <div
      className={`relative overflow-hidden rounded-[20px] ${className}`}
      style={{ padding: '24px 22px 20px', ...container }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(${c.dots} 1px, transparent 1.4px)`,
          backgroundSize: '30px 30px',
          opacity: dark ? 0.5 : 0.7,
        }}
      />
      <div className="relative">
        {title && (
          <div
            className="mb-[20px]"
            style={{
              font: '500 10px/1 var(--font-sans)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: c.eyebrow,
            }}
          >
            {title}
          </div>
        )}
        <div className="flex flex-col gap-[22px]">
          {items.map((it) => {
            const scored = it.value != null && it.value > 0;
            const pct = track(it.value);
            const avgPct = it.avg != null ? track(it.avg) : null;
            return (
              <div
                key={it.label}
                className="relative flex h-5 items-center"
              >
                <div
                  className="absolute left-0 right-0"
                  style={{ height: 2, borderTop: `2px dashed ${c.baseline}` }}
                />
                {scored && (
                  <div
                    className="absolute left-0"
                    style={{ width: `${pct}%`, height: 2, background: c.fill }}
                  />
                )}
                {avgPct != null && (
                  <div
                    className="absolute top-1/2"
                    style={{
                      left: `${avgPct}%`,
                      transform: 'translate(-50%,-50%)',
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: c.tick,
                    }}
                  />
                )}
                <div
                  className="absolute top-1/2 inline-flex items-center gap-[6px] whitespace-nowrap"
                  style={{
                    left: scored ? `${pct}%` : '10%',
                    transform: 'translate(-50%,-50%)',
                    padding: '4px 9px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    background: scored ? c.chipBg : 'transparent',
                    border: `1px solid ${scored ? c.chipBorder : c.baseline}`,
                    boxShadow: scored
                      ? dark
                        ? '0 4px 10px -4px rgba(0,0,0,.5)'
                        : '0 4px 10px -6px rgba(20,30,45,.35)'
                      : 'none',
                    font: '400 10.5px var(--font-sans)',
                    color: scored ? c.chipText : c.axis,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 1.5,
                      background: scored ? 'var(--accent)' : c.baseline,
                    }}
                  />
                  {it.label}
                  {scored ? ` · ${it.value.toFixed(1)}` : ' · not set'}
                </div>
              </div>
            );
          })}
        </div>
        <div
          className="mt-[20px] flex justify-between"
          style={{
            font: '400 9.5px var(--font-sans)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: c.axis,
          }}
        >
          <span>{axisLeft}</span>
          <span>{axisRight}</span>
        </div>
      </div>
    </div>
  );
}
