import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type BlogProseProps = {
  children: ReactNode
  className?: string
}

/**
 * Typography contract for blog post bodies. Wraps any tree of plain HTML
 * tags (today: hand-authored JSX; later: Payload Lexical → React output)
 * and applies the design-system typography via descendant selectors.
 */
export function BlogProse({ children, className }: BlogProseProps) {
  return (
    <div
      className={cn(
        'flex flex-col text-ink',
        '[&_p]:text-body [&_p]:text-ink/80 [&_p]:mb-4 [&_p:last-child]:mb-0',
        '[&_h3]:text-h4-alt [&_h3]:text-ink [&_h3]:mt-8 [&_h3]:mb-2',
        '[&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:opacity-80',
        '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4',
        '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4',
        '[&_li]:text-body [&_li]:text-ink/80 [&_li]:mb-2',
        '[&_img]:my-6 [&_img]:w-full [&_img]:h-auto [&_img]:rounded-[4px]',
        '[&_strong]:font-semibold',
        '[&_em]:italic',
        className,
      )}
    >
      {children}
    </div>
  )
}
