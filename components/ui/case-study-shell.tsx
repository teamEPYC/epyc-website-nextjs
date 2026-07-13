'use client'

import { createContext, useContext, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/cn'

// ─── Context ──────────────────────────────────────────────────────────────────

const CaseStudyViewContext = createContext<{ isTldr: boolean }>({ isTldr: false })

// ─── Toggle UI ────────────────────────────────────────────────────────────────

function ViewToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isTldr = searchParams.get('view') === 'tldr'

  function setMode(tldr: boolean) {
    const params = new URLSearchParams(searchParams.toString())
    if (tldr) {
      params.set('view', 'tldr')
    } else {
      params.delete('view')
    }
    const query = params.toString()
    router.replace(query ? `?${query}` : window.location.pathname, { scroll: false })
  }

  return (
    <div className="inline-flex rounded-full border border-cream/20 p-0.5">
      <button
        onClick={() => setMode(false)}
        className={cn(
          'rounded-full px-4 py-1.5 text-h5 uppercase tracking-wider transition-colors',
          !isTldr ? 'bg-cream/15 text-cream' : 'text-cream/40 hover:text-cream/70',
        )}
      >
        Full story
      </button>
      <button
        onClick={() => setMode(true)}
        className={cn(
          'rounded-full px-4 py-1.5 text-h5 uppercase tracking-wider transition-colors',
          isTldr ? 'bg-cream/15 text-cream' : 'text-cream/40 hover:text-cream/70',
        )}
      >
        TL;DR
      </button>
    </div>
  )
}

// ─── Shell ────────────────────────────────────────────────────────────────────

function ShellInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const isTldr = searchParams.get('view') === 'tldr'

  return (
    <CaseStudyViewContext.Provider value={{ isTldr }}>
      {children}
    </CaseStudyViewContext.Provider>
  )
}

export function CaseStudyShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<CaseStudyViewContext.Provider value={{ isTldr: false }}>{children}</CaseStudyViewContext.Provider>}>
      <ShellInner>{children}</ShellInner>
    </Suspense>
  )
}

// ─── Toggle export ────────────────────────────────────────────────────────────

export function CaseStudyViewToggle() {
  return (
    <Suspense fallback={null}>
      <ViewToggle />
    </Suspense>
  )
}

// ─── HideInTldr ───────────────────────────────────────────────────────────────

export function HideInTldr({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isTldr } = useContext(CaseStudyViewContext)
  return (
    <div className={cn(isTldr && 'hidden', className)}>
      {children}
    </div>
  )
}

// ─── ShowInTldr ───────────────────────────────────────────────────────────────

export function ShowInTldr({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isTldr } = useContext(CaseStudyViewContext)
  return (
    <div className={cn(!isTldr && 'hidden', className)}>
      {children}
    </div>
  )
}
