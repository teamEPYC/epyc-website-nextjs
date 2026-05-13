import type { SVGProps } from "react";

export function Sparkle({
  size = 15,
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 14) / 15}
      viewBox="0 0 15 14"
      fill="none"
      stroke="currentColor"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M7.518 7.4c14.335 0 0-14.2 0 0Zm0 0c0 13.1 14.335 0 0 0Zm0 0c-14.665 0 0-14.4 0 0Zm0 0c0 13.1-14.665 0 0 0Z" />
    </svg>
  );
}
