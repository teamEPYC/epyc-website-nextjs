import { describe, expect, it } from 'vitest'
import { OPTIONAL_SECTION, renderLlmsTxt, type LlmsTxtDoc } from './render'

/**
 * The renderer is the one piece of this tool that produces a file someone
 * saves to their web root, so its shape is worth pinning: a malformed bullet
 * or a stray newline is invisible to us and permanent on their site.
 *
 * The generation call above it is a model judgement and is checked against
 * real sites by eye — there is nothing deterministic to assert there.
 */

const doc: LlmsTxtDoc = {
  name: 'Acme',
  summary: 'Payments infrastructure for marketplaces',
  sections: [
    {
      name: 'Services',
      pages: [
        { url: 'https://acme.com/payments', title: 'Payments', description: 'Card and bank rails.' },
      ],
    },
    { name: OPTIONAL_SECTION, pages: [{ url: 'https://acme.com/blog', title: 'Blog', description: 'Articles.' }] },
    { name: 'About', pages: [{ url: 'https://acme.com/about', title: 'About', description: 'Who we are.' }] },
  ],
}

describe('renderLlmsTxt', () => {
  it('renders the convention: H1, blockquote, H2 sections, described bullets', () => {
    const out = renderLlmsTxt(doc)

    expect(out.startsWith('# Acme\n\n> Payments infrastructure for marketplaces\n')).toBe(true)
    expect(out).toContain('## Services\n- [Payments](https://acme.com/payments): Card and bank rails.')
    expect(out.endsWith('\n')).toBe(true)
  })

  it('sorts the reserved Optional section last, whatever order it arrived in', () => {
    const out = renderLlmsTxt(doc)
    expect(out.indexOf('## Optional')).toBeGreaterThan(out.indexOf('## About'))
  })

  it('orders known sections by usefulness, not by the order the model emitted them', () => {
    const out = renderLlmsTxt(doc)
    expect(out.indexOf('## About')).toBeLessThan(out.indexOf('## Services'))
  })

  it('keeps an unrecognised section between the known ones and Optional', () => {
    const out = renderLlmsTxt({
      ...doc,
      sections: [
        ...doc.sections,
        { name: 'Research', pages: [{ url: 'https://acme.com/r', title: 'R', description: 'd' }] },
      ],
    })

    expect(out.indexOf('## Research')).toBeGreaterThan(out.indexOf('## Services'))
    expect(out.indexOf('## Research')).toBeLessThan(out.indexOf('## Optional'))
  })

  it('puts the overview between the blockquote and the first heading', () => {
    const out = renderLlmsTxt({
      ...doc,
      overview: 'Acme sells payment rails. Its customers are marketplaces in India.',
    })

    const expected = [
      '> Payments infrastructure for marketplaces',
      'Acme sells payment rails. Its customers are marketplaces in India.',
      '## About',
    ].join('\n\n')

    expect(out).toContain(expected)
  })

  it('renders no overview block when there is nothing to say', () => {
    expect(renderLlmsTxt({ ...doc, overview: '   ' })).toBe(renderLlmsTxt(doc))
  })

  it('drops empty sections rather than leaving a bare heading', () => {
    const out = renderLlmsTxt({ ...doc, sections: [{ name: 'Ghost', pages: [] }] })
    expect(out).not.toContain('## Ghost')
  })

  it('keeps every bullet on one line and never breaks the link syntax', () => {
    const out = renderLlmsTxt({
      name: 'Acme',
      summary: 'One\nline\nonly',
      sections: [
        {
          name: 'Work',
          pages: [
            {
              url: 'https://acme.com/x',
              title: 'A [bracketed] title',
              description: 'Split\nacross\nlines.',
            },
          ],
        },
      ],
    })

    expect(out).toContain('> One line only')
    expect(out).toContain('- [A bracketed title](https://acme.com/x): Split across lines.')
  })

  it('strips the site name off titles, at either end, whatever the separator', () => {
    const out = renderLlmsTxt({
      name: 'Acme',
      summary: 's',
      sections: [
        {
          name: 'Work',
          pages: [
            { url: 'https://a.com/1', title: 'Pricing | Acme', description: 'd' },
            { url: 'https://a.com/2', title: 'Acme — About', description: 'd' },
            { url: 'https://a.com/3', title: 'Careers - ACME', description: 'd' },
            // Nothing but the brand: better link text than an empty string.
            { url: 'https://a.com/4', title: 'Acme', description: 'd' },
            // A name that merely contains the brand is left alone.
            { url: 'https://a.com/5', title: 'Acme Corp Handbook', description: 'd' },
          ],
        },
      ],
    })

    expect(out).toContain('- [Pricing](https://a.com/1)')
    expect(out).toContain('- [About](https://a.com/2)')
    expect(out).toContain('- [Careers](https://a.com/3)')
    expect(out).toContain('- [Acme](https://a.com/4)')
    expect(out).toContain('- [Acme Corp Handbook](https://a.com/5)')
  })

  it('falls back to the URL when a page has no title', () => {
    const out = renderLlmsTxt({
      name: 'Acme',
      summary: '',
      sections: [{ name: 'Work', pages: [{ url: 'https://acme.com/x', title: '', description: 'Thing.' }] }],
    })

    expect(out).toContain('- [https://acme.com/x](https://acme.com/x): Thing.')
    expect(out).not.toContain('>')
  })
})
