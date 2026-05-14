import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type ServiceCardProps = {
  title: ReactNode
  body: ReactNode
  className?: string
  align?: 'center' | 'start'
}

export function ServiceCard({ title, body, className, align = 'center' }: ServiceCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col justify-center gap-4 w-full h-full',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      <h3 className="text-h3 text-beige">{title}</h3>
      <p
        className={cn(
          'text-body text-[20px]',
          align === 'center' ? 'max-w-sm text-beige' : 'text-beige',
        )}
      >
        {body}
      </p>
    </div>
  )
}
