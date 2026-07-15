import { useState } from 'react';
import type { Submission } from '../../data/submissions';
import { Skeleton } from '../primitives/Skeleton';

interface MediaGalleryProps {
  gallery: Submission['gallery'];
}

// A stand-in "screenshot" tile. No real image files (self-contained prototype),
// so each tile renders a labelled placeholder that reads as a captured frame.
function ScreenshotTile({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-border bg-surface-sunk text-left transition-colors hover:border-accent-line"
    >
      <div className="absolute inset-0 flex flex-col gap-8 p-12 opacity-70">
        <div className="h-6 w-1/3 rounded bg-accent-soft" />
        <div className="flex-1 rounded border border-border bg-surface" />
        <div className="h-6 w-1/2 rounded bg-border/70" />
      </div>
      <span className="absolute bottom-0 left-0 right-0 bg-surface/85 px-12 py-8 font-mono text-[11px] text-muted backdrop-blur-[1px]">
        {name}.png
      </span>
    </button>
  );
}

export function MediaGallery({ gallery }: MediaGalleryProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  if (gallery.state === 'loading') {
    return (
      <div className="grid grid-cols-2 gap-12">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="aspect-[16/10] w-full" />
        ))}
      </div>
    );
  }

  if (gallery.state === 'error') {
    const failed = gallery.failedCount ?? gallery.images?.length ?? 0;
    return (
      <div className="grid grid-cols-2 gap-12">
        {Array.from({ length: Math.max(failed, 2) }, (_, i) => (
          <div
            key={i}
            className="flex aspect-[16/10] flex-col items-center justify-center gap-8 rounded-lg border border-dashed border-danger/30 bg-danger-soft/30"
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
      <div className="grid grid-cols-2 gap-12">
        {images.map((name) => (
          <ScreenshotTile key={name} name={name} onOpen={() => setLightbox(name)} />
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-32"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${lightbox} preview`}
        >
          <div
            className="w-full max-w-[900px] overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-16 py-12">
              <span className="font-mono text-[12px] text-muted">{lightbox}.png</span>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="rounded-md px-8 py-4 text-[13px] font-medium text-muted transition-colors hover:text-ink"
              >
                Close
              </button>
            </div>
            <div className="relative aspect-[16/10] w-full bg-surface-sunk">
              <div className="absolute inset-0 flex flex-col gap-12 p-32 opacity-70">
                <div className="h-12 w-1/3 rounded bg-accent-soft" />
                <div className="flex-1 rounded-lg border border-border bg-surface" />
                <div className="h-12 w-1/2 rounded bg-border/70" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
