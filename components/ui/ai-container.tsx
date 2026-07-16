import type { ComponentProps } from 'react'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/cn'

/**
 * Content wrapper for the AI-training page. Same 1440px outer cap as
 * `<Container width="outer">` (--container-outer) — only the gutters differ:
 * 92px on desktop / 32px on tablet, giving the 1256px content column this
 * page's Figma frame uses, rather than the site-standard 1150px.
 *
 * Per-page container geometry is the norm here, not an exception: blog and
 * projects null out the gutters and run fluid at `w-[90%]` inside the 1440
 * cap, the homepage sections use the 1150 content column, and coming-soon
 * uses `prose`. Each page picks what its design needs.
 */
export function AiContainer({ className, ...rest }: ComponentProps<typeof Container>) {
  return <Container width="outer" className={cn('sm:px-8 lg:px-[92px]', className)} {...rest} />
}
