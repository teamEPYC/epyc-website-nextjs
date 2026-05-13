import type { SVGProps } from "react";

export function FramerGlyph({
  className,
  ...rest
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 12 17"
      fill="currentColor"
      className={className}
      aria-label="Framer"
      role="img"
      {...rest}
    >
      <path d="M12 0v5.667H6.074L0 0h12ZM0 5.667h6.074L12 11.333H6.074V17L0 11.333V5.667Z" />
    </svg>
  );
}
