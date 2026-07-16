import type { SVGProps } from "react";

/**
 * Multiple-users glyph (Streamline Core, from the Figma AI-training format
 * cards). 20px slot.
 */
export function Users({
  size = 20,
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={(size * 18.1429) / 19.5709}
      viewBox="0 0 19.5709 18.1429"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M6.92857 6.92857C8.70377 6.92857 10.1429 5.48949 10.1429 3.71429C10.1429 1.93908 8.70377 0.5 6.92857 0.5C5.15337 0.5 3.71429 1.93908 3.71429 3.71429C3.71429 5.48949 5.15337 6.92857 6.92857 6.92857Z" />
      <path d="M13.3571 17.6429H0.5V16.2143C0.5 14.5093 1.17729 12.8742 2.38288 11.6686C3.58848 10.463 5.22361 9.78571 6.92857 9.78571C8.63353 9.78571 10.2687 10.463 11.4743 11.6686C12.6798 12.8742 13.3571 14.5093 13.3571 16.2143V17.6429Z" />
      <path d="M12.6429 0.5C13.4953 0.5 14.3129 0.838647 14.9157 1.44144C15.5185 2.04424 15.8571 2.8618 15.8571 3.71429C15.8571 4.56677 15.5185 5.38433 14.9157 5.98713C14.3129 6.58992 13.4953 6.92857 12.6429 6.92857" />
      <path d="M14.928 10.0571C16.1449 10.52 17.1926 11.3415 17.9324 12.4129C18.6721 13.4843 19.0691 14.7551 19.0709 16.0571V17.6428H16.928" />
    </svg>
  );
}
