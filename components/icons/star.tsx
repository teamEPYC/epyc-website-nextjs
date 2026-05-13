import type { SVGProps } from "react";

export function Star({
  size = 16,
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 13) / 13.333}
      viewBox="0 0 13.333 13"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M 2.55 13 L 3.633 8.193 L 0 4.961 L 4.8 4.533 L 6.667 0 L 8.533 4.533 L 13.333 4.961 L 9.7 8.193 L 10.783 13 L 6.667 10.451 Z" />
    </svg>
  );
}
