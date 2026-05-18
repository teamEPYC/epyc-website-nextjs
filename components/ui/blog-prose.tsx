import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type BlogProseProps = {
  children: ReactNode
  className?: string
}

export function BlogProse({ children, className }: BlogProseProps) {
  return <div className={cn('blog-prose', className)}>{children}</div>
}
