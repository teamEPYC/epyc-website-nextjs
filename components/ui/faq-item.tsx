'use client'

import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/cn'
import { Plus } from '@/components/icons/plus'
import { Minus } from '@/components/icons/minus'

type FAQItemProps = {
  question: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}

/**
 * Accordion row. Uses React state + motion for a smooth height transition
 * on open/close. Icon swaps Plus -> Minus (no rotation). Matches ProjectRow.
 *
 * Note: the previous implementation used a native <details>/<summary> pair
 * for SSR-friendly disclosure without JS. That fallback is sacrificed here
 * for animation parity with ProjectRow per design direction.
 */
export function FAQItem({
  question,
  children,
  defaultOpen = false,
  className,
}: FAQItemProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className={cn('w-full border-b border-cream/40 py-6', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-6 text-left text-cream"
      >
        <span className="text-body-lg max-w-[90%]">{question}</span>
        <span className="shrink-0">
          {open ? <Minus size={24} /> : <Plus size={24} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 max-w-[90%] text-body text-cream/80">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
