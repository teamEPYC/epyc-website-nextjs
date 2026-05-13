import type { SVGProps } from "react";

export function BubbleGlyph({
  className,
  ...rest
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-label="Bubble"
      role="img"
      {...rest}
    >
      <path
        d="M9.567 4.378c-1.356 0-2.689.577-3.711 1.722V.466H3.845v9.49c0 3.078 2.5 5.578 5.578 5.578 3.078 0 5.578-2.5 5.578-5.578 0-3.078-2.356-5.578-5.434-5.578Zm-.144 9.011a3.429 3.429 0 0 1-3.434-3.433 3.436 3.436 0 0 1 3.434-3.434c1.9 0 3.433 1.534 3.433 3.434a3.436 3.436 0 0 1-3.433 3.433Zm-7.046 2.145a1.378 1.378 0 1 0 0-2.756 1.378 1.378 0 0 0 0 2.756Z"
      />
    </svg>
  );
}
