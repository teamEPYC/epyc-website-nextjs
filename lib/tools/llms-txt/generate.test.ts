import { describe, expect, it } from 'vitest'
import { buildDoc, selectPages } from './generate'
import type { StoredPage } from '../session'

/**
 * The guards, not the model.
 *
 * `buildDoc` is where everything that could put invented text on a customer's
 * real website is caught, so each rejection below is pinned. The model call
 * around it is judgement and is checked against real sites by eye — there is
 * nothing deterministic to assert there.
 */

const pages: StoredPage[] = [
  { url: 'https://acme.com/', title: 'Acme', text: 'Acme builds payment rails for marketplaces in India.' },
  {
    url: 'https://acme.com/pricing',
    title: 'Pricing | Acme',
    text: 'Plans start at 4,999 per month and include unlimited payouts.',
  },
  {
    url: 'https://acme.com/blog/why-payouts-break',
    title: 'Why payouts break',
    text: 'A long post about reconciliation failures and how teams recover from them.',
  },
]

function output(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Acme',
    summary: 'Payment rails for marketplaces',
    pages: [
      {
        url: 'https://acme.com/pricing',
        section: 'Pricing',
        description: 'Plans from 4,999 per month with unlimited payouts included.',
        evidence: 'Plans start at 4,999 per month and include unlimited payouts.',
      },
    ],
    ...overrides,
  }
}

describe('buildDoc', () => {
  it('keeps a description whose quote and figures are both on the page', () => {
    const { doc, skipped } = buildDoc('acme.com', pages, output())

    expect(doc.sections[0].pages[0].description).toContain('4,999')
    expect(skipped.map((p) => p.url)).not.toContain('https://acme.com/pricing')
  })

  it('drops a page the model invented', () => {
    const { doc } = buildDoc('acme.com', pages, output({
      pages: [{ url: 'https://acme.com/ghost', section: 'Services', description: 'A page.', evidence: 'A page.' }],
    }))

    expect(doc.sections).toHaveLength(0)
  })

  it('drops a description whose evidence is not in the page', () => {
    const { doc, skipped } = buildDoc('acme.com', pages, output({
      pages: [
        {
          url: 'https://acme.com/pricing',
          section: 'Pricing',
          description: 'Enterprise pricing with a dedicated account manager.',
          evidence: 'Every plan comes with a dedicated account manager.',
        },
      ],
    }))

    expect(doc.sections).toHaveLength(0)
    expect(skipped.map((p) => p.url)).toContain('https://acme.com/pricing')
  })

  it('drops a description quoting a figure the page never states', () => {
    const { doc } = buildDoc('acme.com', pages, output({
      pages: [
        {
          url: 'https://acme.com/pricing',
          section: 'Pricing',
          // The quote is real; the 30-day trial is not.
          description: 'Plans from 4,999 per month after a 30 day trial.',
          evidence: 'Plans start at 4,999 per month and include unlimited payouts.',
        },
      ],
    }))

    expect(doc.sections).toHaveLength(0)
  })

  it('drops a description that only restates the title', () => {
    const { doc } = buildDoc('acme.com', pages, output({
      pages: [
        {
          url: 'https://acme.com/blog/why-payouts-break',
          section: 'Optional',
          description: 'Why payouts break',
          evidence: 'A long post about reconciliation failures',
        },
      ],
    }))

    expect(doc.sections).toHaveLength(0)
  })

  it('clears a summary that quotes an unsupported figure', () => {
    const { doc } = buildDoc('acme.com', pages, output({ summary: 'Payment rails for 400 marketplaces' }))
    expect(doc.summary).toBe('')
  })

  it('keeps only the overview sentences whose figures the site states', () => {
    const { doc } = buildDoc('acme.com', pages, output({
      overview:
        'Acme builds payment rails for marketplaces in India. Plans start at 4,999 per month. It serves 900 enterprise customers.',
    }))

    expect(doc.overview).toBe(
      'Acme builds payment rails for marketplaces in India. Plans start at 4,999 per month.',
    )
  })

  it('refuses the same description twice, and the loser becomes the finding', () => {
    const { doc, skipped } = buildDoc('acme.com', pages, output({
      pages: [
        {
          url: 'https://acme.com/',
          section: 'Services',
          description: 'Payment rails built for marketplaces operating in India.',
          evidence: 'Acme builds payment rails for marketplaces in India.',
        },
        {
          url: 'https://acme.com/pricing',
          section: 'Pricing',
          description: 'Payment rails built for marketplaces operating in India.',
          evidence: 'Plans start at 4,999 per month',
        },
      ],
    }))

    expect(doc.sections).toHaveLength(1)
    expect(skipped.map((p) => p.url)).toContain('https://acme.com/pricing')
  })

  it('drops an overview sentence that only restates the summary, and keeps one that adds to it', () => {
    const { doc } = buildDoc('acme.com', pages, output({
      summary: 'Payment rails for marketplaces',
      overview: 'Payment rails for marketplaces. Payment rails for marketplaces in India, run from Bengaluru.',
    }))

    expect(doc.overview).toBe('Payment rails for marketplaces in India, run from Bengaluru.')
  })

  it('trims the Optional section to its cap and counts the rest as excluded, not skipped', () => {
    const posts: StoredPage[] = Array.from({ length: 8 }, (_, i) => ({
      url: `https://acme.com/blog/post-${i}`,
      title: `Post ${i}`,
      text: `Reconciliation notes number ${i} for marketplace finance teams.`,
    }))

    const { doc, skipped, excluded } = buildDoc('acme.com', posts, {
      name: 'Acme',
      summary: 'Payment rails for marketplaces',
      pages: posts.map((p, i) => ({
        url: p.url,
        section: 'Optional',
        description: `Reconciliation notes number ${i} written for marketplace finance teams.`,
        evidence: `Reconciliation notes number ${i} for marketplace finance`,
      })),
    })

    expect(doc.sections[0].pages).toHaveLength(5)
    expect(skipped).toHaveLength(0)
    expect(excluded).toBe(3)
  })

  it('lists the most important page first inside a section', () => {
    const { doc } = buildDoc('acme.com', pages, output({
      pages: [
        {
          url: 'https://acme.com/blog/why-payouts-break',
          section: 'Services',
          description: 'How reconciliation failures happen and how teams recover.',
          evidence: 'A long post about reconciliation failures and how teams recover from them.',
        },
        {
          url: 'https://acme.com/',
          section: 'Services',
          description: 'Payment rails built for marketplaces operating in India.',
          evidence: 'Acme builds payment rails for marketplaces in India.',
        },
      ],
    }))

    expect(doc.sections[0].pages.map((p) => p.url)).toEqual([
      'https://acme.com/',
      'https://acme.com/blog/why-payouts-break',
    ])
  })
})

describe('selectPages', () => {
  const noisy: StoredPage[] = [
    ...pages,
    { url: 'https://acme.com/blog/page/2', title: 'Blog page 2', text: 'More posts.' },
    { url: 'https://acme.com/tag/payouts', title: 'Payouts', text: 'Tagged posts.' },
    { url: 'https://acme.com/pricing/', title: 'Pricing | Acme', text: 'The same pricing page again.' },
  ]

  it('drops archive furniture and trailing-slash duplicates', () => {
    const { candidates, excluded } = selectPages(noisy)

    expect(candidates.map((p) => p.url)).not.toContain('https://acme.com/blog/page/2')
    expect(candidates.map((p) => p.url)).not.toContain('https://acme.com/tag/payouts')
    expect(candidates.map((p) => p.url)).not.toContain('https://acme.com/pricing/')
    expect(excluded).toBe(3)
  })

  it('returns them best first, so the file and the corpus lead with what matters', () => {
    expect(selectPages(noisy).candidates.map((p) => p.url)).toEqual([
      'https://acme.com/',
      'https://acme.com/pricing',
      'https://acme.com/blog/why-payouts-break',
    ])
  })

  it('keeps a slug that merely contains an archive word', () => {
    const { candidates } = selectPages([
      { url: 'https://acme.com/page-speed', title: 'Page speed', text: 'On performance.' },
    ])

    expect(candidates).toHaveLength(1)
  })
})
