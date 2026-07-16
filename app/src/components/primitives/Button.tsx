import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'soft' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconRight?: ReactNode;
  block?: boolean;
}

// Pill button, adapted from the Frosted Glass system. The primary action is
// solid ink (not the accent — the accent stays reserved and quiet); ghost is a
// hairline; soft is the accent tint. Danger is a ghost that warms on hover, so
// reject reads as available but never shouts.
const variants: Record<Variant, string> = {
  primary: 'bg-ink text-[var(--surface)] border border-ink hover:bg-[var(--dark-glass-2)]',
  ghost:
    'bg-surface text-[var(--dark-glass)] border border-border-strong hover:border-ink hover:text-ink',
  soft: 'bg-accent-soft text-accent-text border border-transparent hover:bg-[var(--accent-line)]',
  // Red at rest (outline), intensifying to a soft fill on hover. Kept as an
  // outline rather than a solid fill so it never out-shouts the accent Advance.
  danger:
    'bg-surface text-danger border border-danger/60 hover:bg-danger-soft hover:border-danger',
};

const sizes: Record<Size, string> = {
  sm: 'px-[14px] py-[7px] text-[12.5px]',
  md: 'px-[18px] py-[9px] text-[13px]',
  lg: 'px-[22px] py-[11px] text-[14px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  iconRight,
  block = false,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={[
        'inline-flex items-center justify-center gap-[6px] whitespace-nowrap rounded-full font-sans font-normal leading-none transition duration-[var(--dur-fast)] ease-[var(--ease-out)] active:scale-[0.97]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-line',
        variants[variant],
        sizes[size],
        block ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {children}
      {iconRight && <span aria-hidden="true">{iconRight}</span>}
    </button>
  );
}
