import type { SVGProps } from "react";

export function Minus({
  size = 24,
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number }) {
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
      <path d="M5 12h14" />
    </svg>
  );
}
