'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { EpycMark } from '@/components/icons/epyc-mark'
import { EpycWordmark } from '@/components/icons/epyc-wordmark'
import { MenuLines } from '@/components/icons/menu-lines'
import { menuLinks } from '@/data/nav'

/**
 * Site navigation bar.
 *
 * Mounted once in the `(my-app)` layout, above the page content. Not sticky —
 * it scrolls away with the page. Route-aware via `usePathname()`:
 *
 *  - Homepage: dark (ink) bar, cream content, EPYC mark + wordmark — reads
 *    continuous with the dark hero below it.
 *  - Every other page: beige bar, ink content, mark only.
 *
 * Desktop (≥810px): the four links sit at the far right, each with an
 * underline that grows from the left on hover/focus; the link for the current
 * section keeps its underline. Mobile: the links collapse into a toggle that
 * expands a panel below the bar.
 */

/** Snappy out-quint bezier — `as const` so it types as a cubic-bezier tuple. */
const EASE = [0.22, 1, 0.36, 1] as const

/** A nav link is "active" on its own page and any page nested under it. */
function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SiteNav() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()

  // Close the mobile panel whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header
      className={cn(
        'w-full',
        isHome ? 'bg-ink text-cream' : 'bg-beige text-ink',
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[var(--container-outer)] items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-15">
        {/* Logo — mark always; the wordmark joins it on the homepage. */}
        <Link
          href="/"
          aria-label="EPYC home"
          className="flex shrink-0 items-center gap-2.5 transition-opacity duration-200 hover:opacity-80"
        >
          <EpycMark className="h-4 w-auto lg:h-5" />
          {isHome && <EpycWordmark className="h-4 w-auto lg:h-5" />}
        </Link>

        {/* Desktop links */}
        <nav aria-label="Primary" className="hidden sm:block">
          <ul className="flex items-center gap-8">
            {menuLinks.map((link) => (
              <li key={link.href}>
                <NavLink
                  href={link.href}
                  label={link.label}
                  active={isActive(pathname, link.href)}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="-mr-2 flex h-10 w-10 items-center justify-center sm:hidden"
        >
          {open ? <CloseIcon /> : <MenuLines size={32} />}
        </button>
      </div>

      {/* Mobile panel — expands the header height; not an overlay. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            aria-label="Menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.26, ease: EASE }}
            className="overflow-hidden sm:hidden"
          >
            <ul className="flex flex-col border-t border-current/15 px-4 py-2">
              {menuLinks.map((link) => {
                const active = isActive(pathname, link.href)
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'block py-3 font-serif text-base',
                        active && 'underline underline-offset-4',
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

/** Desktop nav link — an underline that scales in from the left on
 *  hover/focus, and stays put for the active section. */
function NavLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className="group relative inline-block py-2 font-serif text-base focus-visible:outline-none"
    >
      {label}
      <span
        aria-hidden="true"
        className={cn(
          'absolute bottom-1 left-0 h-0.5 w-full origin-left bg-current',
          'transition-transform duration-200 ease-out motion-reduce:transition-none',
          active
            ? 'scale-x-100'
            : 'scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100',
        )}
      />
    </Link>
  )
}

/** Close (✕) icon shown on the mobile toggle while the panel is open. */
function CloseIcon() {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  )
}
