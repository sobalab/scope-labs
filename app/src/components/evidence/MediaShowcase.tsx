import { useMemo, useState } from 'react';
import type { Submission } from '../../data/submissions';
import { SectionCard } from '../primitives/SectionCard';
import { DemoEmbed } from './DemoEmbed';
import { MediaGallery } from './MediaGallery';
import { LoomEmbed } from './LoomEmbed';

interface MediaShowcaseProps {
  submission: Submission;
  onRequest: (kind: 'demo' | 'gallery' | 'loom') => void;
  onRetry: (kind: 'demo' | 'loom') => void;
}

type MediaKind = 'demo' | 'gallery' | 'loom';

// The three artifact channels, always shown in this order.
const TAB_ORDER: MediaKind[] = ['demo', 'gallery', 'loom'];

const TAB_LABEL: Record<MediaKind, string> = {
  demo: 'Live demo',
  gallery: 'Screenshots',
  loom: 'Walkthrough',
};

// Priority when picking which tab opens first: a populated demo beats a
// populated gallery beats a populated walkthrough; a loading or broken block
// still outranks an empty one (the reviewer should land on real signal). Empty
// ranks last, but its tab is always present.
const SCORE: Record<Exclude<Submission['demo']['state'], never>, number> = {
  populated: 3,
  loading: 2,
  error: 1,
  empty: 0,
};

// A per-tab status dot so the reviewer sees at a glance which channels actually
// carry something — green present, red broken, a pulse while checking, nothing
// when the channel is empty.
const DOT: Record<Exclude<Submission['demo']['state'], never>, string | null> = {
  populated: 'bg-ok',
  loading: 'bg-faint animate-pulse',
  error: 'bg-danger',
  empty: null,
};

// A switcher, not a stack. All three channels are always offered as tabs,
// submitted or not, so the reviewer can check any of them; each child owns its
// own loading / error / empty state, so an unsubmitted channel reads as a clear
// gap rather than a missing tab.
export function MediaShowcase({ submission, onRequest, onRetry }: MediaShowcaseProps) {
  // Open on the strongest available channel so the panel leads with real
  // content when there is any; every tab stays selectable regardless.
  const defaultKind = useMemo<MediaKind>(
    () =>
      [...TAB_ORDER].sort(
        (a, b) => SCORE[submission[b].state] - SCORE[submission[a].state],
      )[0],
    [submission],
  );

  const [active, setActive] = useState<MediaKind>(defaultKind);

  return (
    <SectionCard
      title="Artifacts"
      aside={
        <div
          className="flex gap-[2px] rounded-full border border-border p-[3px]"
          role="tablist"
          style={{ background: 'var(--field-bg)' }}
        >
          {TAB_ORDER.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={active === k}
              onClick={() => setActive(k)}
              className={[
                'rounded-full px-[15px] py-[6px] text-[12px] transition duration-[var(--dur-fast)] ease-[var(--ease-out)] active:scale-[0.96]',
                active === k
                  ? 'bg-ink text-[var(--surface)]'
                  : 'text-muted hover:text-ink',
              ].join(' ')}
            >
              {TAB_LABEL[k]}
              {DOT[submission[k].state] && (
                <span
                  className={`ml-[6px] inline-block h-[6px] w-[6px] rounded-full align-middle ${DOT[submission[k].state]}`}
                />
              )}
            </button>
          ))}
        </div>
      }
    >
      {/* Keyed so the panel crossfades when the reviewer switches tabs. */}
      <div key={active} className="fade-in">
        {active === 'demo' && (
          <DemoEmbed
            demo={submission.demo}
            onRequest={() => onRequest('demo')}
            onRetry={() => onRetry('demo')}
            hasGallery={submission.gallery.state === 'populated'}
            onViewGallery={() => setActive('gallery')}
          />
        )}
        {active === 'gallery' && (
          <MediaGallery
            gallery={submission.gallery}
            onRequest={() => onRequest('gallery')}
          />
        )}
        {active === 'loom' && (
          <LoomEmbed
            loom={submission.loom}
            onRequest={() => onRequest('loom')}
            onRetry={() => onRetry('loom')}
          />
        )}
      </div>
    </SectionCard>
  );
}
