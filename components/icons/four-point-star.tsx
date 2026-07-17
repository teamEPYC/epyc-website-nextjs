import type { SVGProps } from 'react'

export function FourPointStar({
  size = 18,
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 26) / 18}
      viewBox="0 0 18 26"
      fill="none"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path
        d="M9 4C10.7816 8.58792 12.7123 10.5626 18 13C11.9991 14.8042 10.2457 16.8933 9 22C8.08767 16.7404 5.98714 14.8188 0 13C5.37224 10.3733 7.0588 8.26234 9 4Z"
        fill="currentColor"
      />
    </svg>
  )
}
