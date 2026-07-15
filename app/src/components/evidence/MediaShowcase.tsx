import { useMemo, useState } from 'react';
import type { Submission } from '../../data/submissions';
import { SectionCard } from '../primitives/SectionCard';
import { EmptyState } from '../primitives/EmptyState';
import { DemoEmbed } from './DemoEmbed';
import { MediaGallery } from './MediaGallery';
import { LoomEmbed } from './LoomEmbed';

interface MediaShowcaseProps {
  submission: Submission;
  onRequest: (kind: 'demo' | 'loom') => void;
  onRetry: (kind: 'demo' | 'loom') => void;
}

type MediaKind = 'demo' | 'gallery' | 'loom';

const TAB_LABEL: Record<MediaKind, string> = {
  demo: 'Live demo',
  gallery: 'Screenshots',
  loom: 'Walkthrough',
};

// Priority when picking the default panel: a populated demo beats a populated
// gallery beats a populated walkthrough. A block that is loading or broken is
// still worth a tab (the reviewer needs to see the rot); an empty block is not.
const SCORE: Record<Exclude<Submission['demo']['state'], never>, number> = {
  populated: 3,
  loading: 2,
  error: 1,
  empty: 0,
};

// A switcher, not a stack. The parent only chooses which children to mount and
// which is default-selected; each child owns its own loading / error / empty.
export function MediaShowcase({ submission, onRequest, onRetry }: MediaShowcaseProps) {
  const kinds = useMemo<MediaKind[]>(() => {
    const order: MediaKind[] = ['demo', 'gallery', 'loom'];
    return order.filter((k) => submission[k].state !== 'empty');
  }, [submission]);

  const defaultKind = useMemo<MediaKind | null>(() => {
    if (kinds.length === 0) return null;
    return [...kinds].sort(
      (a, b) => SCORE[submission[b].state] - SCORE[submission[a].state],
    )[0];
  }, [kinds, submission]);

  const [active, setActive] = useState<MediaKind | null>(defaultKind);
  const selected = active && kinds.includes(active) ? active : defaultKind;

  // Nothing provided at all — a single neutral empty for the whole block.
  if (!selected) {
    return (
      <SectionCard title="Evidence">
        <EmptyState
          type="demo"
          action={{ label: 'Request a demo or walkthrough', onClick: () => onRequest('demo') }}
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Evidence"
      aside={
        kinds.length > 1 ? (
          <div
            className="flex gap-[2px] rounded-full border border-border p-[3px]"
            role="tablist"
            style={{ background: 'var(--field-bg)' }}
          >
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={selected === k}
                onClick={() => setActive(k)}
                className={[
                  'rounded-full px-[15px] py-[6px] text-[12px] transition-colors',
                  selected === k
                    ? 'bg-ink text-[var(--surface)]'
                    : 'text-muted hover:text-ink',
                ].join(' ')}
              >
                {TAB_LABEL[k]}
                {submission[k].state === 'error' && (
                  <span className="ml-[6px] inline-block h-[6px] w-[6px] rounded-full bg-danger align-middle" />
                )}
              </button>
            ))}
          </div>
        ) : undefined
      }
    >
      {selected === 'demo' && (
        <DemoEmbed
          demo={submission.demo}
          onRequest={() => onRequest('demo')}
          onRetry={() => onRetry('demo')}
        />
      )}
      {selected === 'gallery' && <MediaGallery gallery={submission.gallery} />}
      {selected === 'loom' && (
        <LoomEmbed
          loom={submission.loom}
          onRequest={() => onRequest('loom')}
          onRetry={() => onRetry('loom')}
        />
      )}
    </SectionCard>
  );
}
