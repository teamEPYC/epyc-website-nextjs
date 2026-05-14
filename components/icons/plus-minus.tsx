import type { SVGProps } from 'react'

/**
 * Plus that morphs to a minus by rotating its vertical bar 90° onto the
 * horizontal bar. CSS transition handles both directions, so closing
 * reverses the same motion.
 */
export function PlusMinus({
  open,
  size = 24,
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { open: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* Horizontal bar — always horizontal */}
      <path d="M5 12h14" />
      {/* Vertical bar — rotates 90° to overlap the horizontal when `open`,
          collapsing the plus into a minus. */}
      <path
        d="M12 5v14"
        style={{
          transformOrigin: '12px 12px',
          transform: `rotate(${open ? 90 : 0}deg)`,
          transition: 'transform 300ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
    </svg>
  )
}
