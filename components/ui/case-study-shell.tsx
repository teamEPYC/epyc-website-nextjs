'use client'

import { createContext, useContext, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/cn'

// ─── Context ──────────────────────────────────────────────────────────────────

const CaseStudyViewContext = createContext<{ isTldr: boolean }>({ isTldr: false })

// ─── Toggle UI ────────────────────────────────────────────────────────────────

/** Toggle colourways — `cream` sits on an ink surface, `ink` on beige/cream. */
type ToggleTone = 'cream' | 'ink'

const toggleTones: Record<ToggleTone, { frame: string; active: string; idle: string }> = {
  cream: {
    frame: 'border-cream/20',
    active: 'bg-cream/15 text-cream',
    idle: 'text-cream/40 hover:text-cream/70',
  },
  ink: {
    frame: 'border-ink/20',
    active: 'bg-ink/10 text-ink',
    idle: 'text-ink/45 hover:text-ink/75',
  },
}

function ViewToggle({ tone = 'cream' }: { tone?: ToggleTone }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isTldr = searchParams.get('view') === 'tldr'
  const t = toggleTones[tone]

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
    <div className={cn('inline-flex rounded-full border p-0.5', t.frame)}>
      <button
        onClick={() => setMode(false)}
        className={cn(
          'rounded-full px-4 py-1.5 text-h5 uppercase tracking-wider transition-colors',
          !isTldr ? t.active : t.idle,
        )}
      >
        Full story
      </button>
      <button
        onClick={() => setMode(true)}
        className={cn(
          'rounded-full px-4 py-1.5 text-h5 uppercase tracking-wider transition-colors',
          isTldr ? t.active : t.idle,
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

export function CaseStudyViewToggle({ tone }: { tone?: ToggleTone }) {
  return (
    <Suspense fallback={null}>
      <ViewToggle tone={tone} />
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
