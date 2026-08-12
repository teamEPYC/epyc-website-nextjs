import type { SVGProps } from "react";

/**
 * Polaroid-photo glyph (Streamline Core, from the Figma AI-training format
 * cards). 20px slot.
 */
export function Polaroid({
  size = 20,
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 19.5704) / 19.5324}
      viewBox="0 0 19.5324 19.5704"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M1.92857 13.3571L11.9286 13.3571C12.7175 13.3571 13.3571 12.7175 13.3571 11.9286L13.3571 1.92857C13.3571 1.13959 12.7175 0.5 11.9286 0.5L1.92857 0.5C1.13959 0.5 0.5 1.13959 0.5 1.92857L0.5 11.9286C0.5 12.7175 1.13959 13.3571 1.92857 13.3571Z" />
      <path d="M16.9294 6.50028L18.0436 6.85742C18.2234 6.9156 18.3899 7.00887 18.5333 7.13182C18.6768 7.25477 18.7945 7.40496 18.8795 7.5737C18.9646 7.74244 19.0153 7.92637 19.0287 8.11485C19.0422 8.30333 19.0181 8.4926 18.9579 8.67171L15.8436 18.086C15.726 18.4458 15.4703 18.7441 15.1328 18.9156C14.7953 19.087 14.4036 19.1175 14.0436 19.0003L7.72935 16.9288" />
      <path d="M0.500001 9.78571H13.3571" />
    </svg>
  );
}
