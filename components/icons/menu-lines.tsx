import type { SVGProps } from "react";

export function MenuLines({
  size = 41,
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 8) / 41}
      viewBox="0 0 41 8"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <rect x="5" y="5" width="31" height="3" rx="1.5" />
      <rect x="19" y="0" width="12" height="3" rx="1.5" />
      <rect x="0" y="0" width="13" height="3" rx="1.5" />
      <circle cx="21" cy="6.5" r="1" />
    </svg>
  );
}
