import { cn } from '@/lib/cn'

type DashedDividerProps = {
  className?: string
}

export function DashedDivider({ className }: DashedDividerProps) {
  return (
    <svg
      viewBox="0 0 1257 14"
      className={cn('h-3.5 w-full text-sand', className)}
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <path
        stroke="currentColor"
        d="M400.5 7.4c14.335 0 0-14.2 0 0Zm0 0c0 13.1 14.335 0 0 0Zm0 0c-14.665 0 0-14.4 0 0Zm0 0c0 13.1-14.665 0 0 0Zm0 0h856m-856 0H.5"
      />
    </svg>
  )
}
