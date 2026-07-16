import type { SVGProps } from "react";

/**
 * Calendar-with-check glyph (Streamline Core, from the Figma AI-training
 * format cards). 20px slot.
 */
export function CalendarCheck({
  size = 20,
  className,
  ...rest
}: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 19.5714 19.5714"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d="M1.92857 3.35714C1.54969 3.35714 1.18633 3.50765 0.918419 3.77556C0.65051 4.04347 0.5 4.40683 0.5 4.78571V17.6429C0.5 18.0217 0.65051 18.3851 0.918419 18.653C1.18633 18.9209 1.54969 19.0714 1.92857 19.0714H17.6429C18.0217 19.0714 18.3851 18.9209 18.653 18.653C18.9209 18.3851 19.0714 18.0217 19.0714 17.6429V4.78571C19.0714 4.40683 18.9209 4.04347 18.653 3.77556C18.3851 3.50765 18.0217 3.35714 17.6429 3.35714H14.7857" />
      <path d="M4.78571 0.5V6.21429" />
      <path d="M14.7857 0.5V6.21429" />
      <path d="M4.78571 3.35714H11.9286" />
      <path d="M5.5 12.6429L8.35714 14.7857L13.3571 9.07143" />
    </svg>
  );
}
