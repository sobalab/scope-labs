import { useState } from 'react';
import type { Submission } from '../../data/submissions';
import { Skeleton } from '../primitives/Skeleton';
import { MockAppScreen } from './MockAppScreen';

interface MediaGalleryProps {
  gallery: Submission['gallery'];
}

// Each tile is a real-looking screenshot: the same product chrome ("Console"),
// a different view per image. The filename caption stays opaque — glass is
// reserved for floating chrome, not evidence tiles.
function ScreenshotTile({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-surface text-left transition duration-[var(--dur)] ease-[var(--ease-out)] hover:border-accent-line active:scale-[0.99]"
    >
      <MockAppScreen
        seed={name}
        className="absolute inset-0 transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] group-hover:scale-[1.04]"
      />
      <span className="absolute inset-x-0 bottom-0 bg-surface-sunk px-3 py-2 text-[11px] text-muted">
        {name}.png
      </span>
    </button>
  );
}

export function MediaGallery({ gallery }: MediaGalleryProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (gallery.state === 'loading') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="aspect-[16/10] w-full" />
        ))}
      </div>
    );
  }

  if (gallery.state === 'error') {
    const failed = gallery.failedCount ?? gallery.images?.length ?? 0;
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: Math.max(failed, 2) }, (_, i) => (
          <div
            key={i}
            className="flex aspect-[16/10] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-danger/30 bg-danger-soft/30"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-danger/70">
              <path d="M3 16l5-5 4 4 3-3 6 6M3 5h18v14H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[12px] text-muted">Image failed to load</span>
          </div>
        ))}
        <p className="col-span-2 text-[13px] text-danger">
          {failed} of {gallery.images?.length ?? failed} images could not be loaded.
        </p>
      </div>
    );
  }

  // populated
  const images = gallery.images ?? [];
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {images.map((name) => (
          <ScreenshotTile key={name} name={name} onOpen={() => setLightbox(name)} />
        ))}
      </div>

      {lightbox && (
        <div
          className="fade-in fixed inset-0 z-50 flex items-center justify-center p-8"
          style={{ background: 'rgba(20,30,45,.55)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${lightbox} preview`}
        >
          <div
            className="pop-in w-full max-w-[900px] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-[12px] text-muted">{lightbox}.png</span>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="rounded-md px-2 py-1 text-[13px] font-medium text-muted transition duration-[var(--dur-fast)] ease-[var(--ease-out)] hover:text-ink active:scale-95"
              >
                Close
              </button>
            </div>
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface">
              <MockAppScreen seed={lightbox} className="absolute inset-0" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
