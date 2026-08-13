// Hand-built markdown for the CMS-driven routes.
//
// These pages have structured Strapi fields behind them, so building markdown
// from the fields beats converting the rendered HTML — the output carries the
// author, date, and tags as data instead of as layout. Every other route falls
// back to converting its own rendered HTML (see `app/md/[[...path]]/route.ts`).

import { fetchStrapi } from '@/lib/strapi/client'
import type { StrapiBlog, StrapiGalleryItem, StrapiList, StrapiProject } from '@/lib/strapi/types'
import { normalise } from '@/lib/blogs/normalise'
import { normaliseGallery } from '@/lib/gallery/normalise'
import { normaliseProject } from '@/lib/projects/normalise'
import { htmlToMarkdown } from '@/lib/markdown/from-html'
import { faqs, type FAQ } from '@/data/faqs'

export type MarkdownDocument = { markdown: string; status?: number }

type Builder = (args: { slug: string; origin: string }) => Promise<MarkdownDocument | null>

export function frontMatter(fields: Record<string, string | undefined>): string {
  const lines = Object.entries(fields)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    // Quote every value: titles routinely contain `:` and `#`.
    .map(([key, value]) => `${key}: "${value.replace(/"/g, '\\"').replace(/\s+/g, ' ').trim()}"`)
  return lines.length > 0 ? `---\n${lines.join('\n')}\n---\n\n` : ''
}

const BLOG_FIELDS = {
  'populate[coverImage][fields]': 'url,width,height,alternativeText,formats',
  'populate[author][fields]': 'name,slug',
}

const blogPost: Builder = async ({ slug, origin }) => {
  const { data } = await fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
    'filters[slug][$eq]': slug,
    ...BLOG_FIELDS,
    'pagination[limit]': '1',
  })
  const raw = data[0]
  if (!raw) return null

  const blog = normalise(raw, 'banner')
  const body = htmlToMarkdown(raw.content ?? '')

  const meta = [blog.author && `Author: ${blog.author}`, blog.date && `Published: ${blog.date}`, blog.readTime && `Read time: ${blog.readTime}`]
    .filter(Boolean)
    .join('  \n')

  return {
    markdown: [
      frontMatter({
        title: raw.metaTitle ?? blog.title,
        description: blog.metaDescription,
        url: `${origin}/blog/${slug}`,
        author: blog.author,
        published: blog.publishedAt,
        type: 'blog-post',
      }),
      `# ${blog.title}`,
      meta,
      blog.metaDescription && `_${blog.metaDescription}_`,
      body,
    ]
      .filter(Boolean)
      .join('\n\n'),
  }
}

const blogIndex: Builder = async ({ origin }) => {
  const { data } = await fetchStrapi<StrapiList<StrapiBlog>>('/blogs', {
    ...BLOG_FIELDS,
    sort: 'publishedDate:desc',
    'pagination[limit]': '100',
  })
  const blogs = data.filter((b) => b.slug).map((b) => normalise(b))

  const items = blogs.map((blog) => {
    const meta = [blog.author, blog.date, blog.readTime].filter(Boolean).join(' · ')
    return [
      `## [${blog.title}](${origin}/blog/${blog.slug})`,
      meta,
      blog.metaDescription,
    ]
      .filter(Boolean)
      .join('\n\n')
  })

  return {
    markdown: [
      frontMatter({
        title: 'Blog | EPYC',
        description: 'Get into our minds and understand how we do the things we do.',
        url: `${origin}/blog`,
        type: 'blog-index',
      }),
      '# Blog',
      'Get into our minds and understand how we do the things we do.',
      items.length > 0 ? items.join('\n\n') : '_No posts published yet._',
    ].join('\n\n'),
  }
}

const projectsIndex: Builder = async ({ origin }) => {
  const { data } = await fetchStrapi<StrapiList<StrapiProject>>('/projects', {
    'populate[thumbnail][fields]': 'url,width,height,alternativeText,formats',
    'populate[industry][fields]': 'title,slug',
    'populate[platform][fields]': 'title,slug',
    sort: 'featured:desc,publishedAt:desc',
    'pagination[limit]': '200',
  })
  const projects = data.filter((p) => p.slug).map((p) => normaliseProject(p))

  const rows = projects.map((project) => {
    const link = project.caseStudyPath ? `${origin}${project.caseStudyPath}` : project.redirectLink
    const cells = [
      `[${project.title}](${link})`,
      project.typesDisplay || '—',
      project.industry,
      project.platform,
      project.featured ? 'yes' : 'no',
    ]
    return `| ${cells.join(' | ')} |`
  })

  return {
    markdown: [
      frontMatter({
        title: 'Projects | EPYC',
        description: 'Selected work from EPYC — design and engineering for ambitious teams.',
        url: `${origin}/projects`,
        type: 'projects-index',
      }),
      '# Projects',
      'Selected work from EPYC — design and engineering for ambitious teams.',
      projects.length > 0
        ? ['| Project | Work | Industry | Platform | Featured |', '| --- | --- | --- | --- | --- |', ...rows].join('\n')
        : '_No projects published yet._',
    ].join('\n\n'),
  }
}

const GALLERY_FIELDS = { 'populate[image][fields]': 'url,width,height,alternativeText' }

const galleryIndex: Builder = async ({ origin }) => {
  const { data } = await fetchStrapi<StrapiList<StrapiGalleryItem>>('/gallery-items', {
    ...GALLERY_FIELDS,
    'pagination[limit]': '500',
  })
  const items = data.filter((item) => item.slug).map((item) => normaliseGallery(item))

  const list = items.map((item) => {
    const meta = [item.kind, item.designers?.join(', ')].filter(Boolean).join(' · ')
    return [`- [${item.title ?? item.slug}](${origin}/gallery/${item.slug})`, meta && `(${meta})`]
      .filter(Boolean)
      .join(' ')
  })

  return {
    markdown: [
      frontMatter({
        title: 'Gallery | EPYC',
        description: 'Stills, motion clips, and prototypes from the EPYC studio.',
        url: `${origin}/gallery`,
        type: 'gallery-index',
      }),
      '# Gallery',
      'Stills, motion clips, and prototypes from the EPYC studio.',
      list.length > 0 ? list.join('\n') : '_No gallery items published yet._',
    ].join('\n\n'),
  }
}

const galleryItem: Builder = async ({ slug, origin }) => {
  const { data } = await fetchStrapi<StrapiList<StrapiGalleryItem>>('/gallery-items', {
    'filters[slug][$eq]': slug,
    ...GALLERY_FIELDS,
    'pagination[limit]': '1',
  })
  const raw = data[0]
  if (!raw) return null

  const item = normaliseGallery(raw)
  const title = item.title ?? slug

  return {
    markdown: [
      frontMatter({
        title,
        description: item.description,
        url: `${origin}/gallery/${slug}`,
        type: 'gallery-item',
      }),
      `# ${title}`,
      item.designers?.length ? `Designers: ${item.designers.join(', ')}` : undefined,
      raw.year ? `Year: ${raw.year}` : undefined,
      item.description ? htmlToMarkdown(item.description) : undefined,
      item.previewLink ? `[View live](${item.previewLink})` : undefined,
    ]
      .filter(Boolean)
      .join('\n\n'),
  }
}

const EXACT_SOURCES: Record<string, Builder> = {
  '/blog': blogIndex,
  '/projects': projectsIndex,
  '/gallery': galleryIndex,
}

const DYNAMIC_SOURCES: { pattern: RegExp; build: Builder }[] = [
  { pattern: /^\/blog\/([^/]+)$/, build: blogPost },
  { pattern: /^\/gallery\/([^/]+)$/, build: galleryItem },
]

// ── Supplements ───────────────────────────────────────────────────────────────
//
// Content that exists on the page but not in its server-rendered HTML. The FAQ
// accordion (`components/ui/faq-item.tsx`) keeps answers in React state, so a
// closed row ships the question and nothing else. Agents would read the whole
// FAQ as a list of unanswered questions.

/** Routes that render the shared homepage FAQ set (`<FAQs />` with no `items`). */
const SHARED_FAQ_ROUTES = new Set(['/', '/contact', '/gallery'])

function faqsFromJsonLd(html: string): FAQ[] {
  const found: FAQ[] = []
  const blocks = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )

  for (const [, body] of blocks) {
    let parsed: unknown
    try {
      parsed = JSON.parse(body)
    } catch {
      continue
    }
    const graph = Array.isArray(parsed) ? parsed : [parsed]
    for (const node of graph) {
      const entries = (node as { '@graph'?: unknown[] })['@graph'] ?? [node]
      for (const entry of entries as { '@type'?: string; mainEntity?: unknown }[]) {
        if (entry?.['@type'] !== 'FAQPage' || !Array.isArray(entry.mainEntity)) continue
        for (const question of entry.mainEntity as {
          name?: string
          acceptedAnswer?: { text?: string }
        }[]) {
          if (question?.name && question.acceptedAnswer?.text) {
            found.push({ question: question.name, answer: question.acceptedAnswer.text })
          }
        }
      }
    }
  }

  return found
}

/**
 * FAQ markdown for a route, drawn from the page's `FAQPage` structured data when
 * it has any and from `data/faqs.ts` for the routes that render the shared set.
 * `html` is omitted for CMS routes, which have no rendered HTML to inspect.
 */
export function faqSection(pathname: string, html?: string): string {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  const collected = [
    ...(html ? faqsFromJsonLd(html) : []),
    ...(SHARED_FAQ_ROUTES.has(path) ? faqs : []),
  ]

  const seen = new Set<string>()
  const sections = collected
    .filter((faq) => faq.question && faq.answer.trim())
    .filter((faq) => {
      const key = faq.question.trim().toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .map((faq) => `### ${faq.question}\n\n${faq.answer}`)

  return sections.length > 0 ? `## FAQs\n\n${sections.join('\n\n')}` : ''
}

/**
 * Returns purpose-built markdown for a route, or `null` when the route has no
 * structured source and should fall back to HTML conversion.
 */
export async function buildFromSource(pathname: string, origin: string): Promise<MarkdownDocument | null> {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname

  const exact = EXACT_SOURCES[path]
  if (exact) return exact({ slug: '', origin })

  for (const { pattern, build } of DYNAMIC_SOURCES) {
    const match = pattern.exec(path)
    if (match) return build({ slug: decodeURIComponent(match[1]), origin })
  }

  return null
}
