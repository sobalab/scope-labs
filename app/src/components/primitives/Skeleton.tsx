interface SkeletonProps {
  className?: string;
}

// Skeletons over spinners: the shape of each block is known ahead of load,
// so we show that shape shimmering rather than a generic spinner.
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-border/70 ${className}`}
      aria-hidden="true"
    />
  );
}
