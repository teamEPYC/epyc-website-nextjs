import type { SVGProps } from "react";

export function WebflowGlyph({
  className,
  ...rest
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 34 21"
      fill="currentColor"
      className={className}
      aria-label="Webflow"
      role="img"
      {...rest}
    >
      <path
        fillRule="evenodd"
        d="M34 0 23.138 21H12.956l4.528-8.711h-.21C13.559 17.11 7.958 20.274 0 21v-8.582s5.104-.285 8.088-3.422H0V0h9.082v7.415h.21L13.008 0h6.884v7.363h.21L23.923 0H34Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
