import { afterEach, describe, expect, it, vi } from 'vitest'
import { PayloadProvider } from './payload-provider'

type Call = { url: URL; init: RequestInit }

function stubFetch(docs: unknown[], status = 200) {
  const calls: Call[] = []
  vi.stubGlobal('fetch', (input: URL | string, init: RequestInit = {}) => {
    calls.push({ url: new URL(String(input)), init })
    return Promise.resolve(
      new Response(JSON.stringify({ docs }), { status, headers: { 'content-type': 'application/json' } }),
    )
  })
  return calls
}

const provider = (draft = false) => new PayloadProvider({ baseUrl: 'https://cms.test', token: 'tok', draft })

const mediaDoc = {
  id: 7,
  url: '/media/cover.png',
  width: 2400,
  height: 1350,
  alt: 'A cover',
  sizes: {
    thumbnail: { url: '/media/cover-400.png', width: 400, height: 225 },
    card: { url: '/media/cover-1080.png', width: 1080, height: 608 },
    banner: { url: '/media/cover-1600.png', width: 1600, height: 900 },
  },
}

afterEach(() => vi.unstubAllGlobals())

describe('PayloadProvider media mapping', () => {
  it('aliases Payload sizes onto the format names the normalisers read', async () => {
    stubFetch([{ id: 1, title: 'Post', slug: 'post', updatedAt: '2026-01-01', coverImage: mediaDoc }])
    const [blog] = await provider().listBlogs()

    // `lib/blogs/normalise.ts` and `lib/projects/normalise.ts` read
    // `formats.large`; without the alias every image serves at full size.
    expect(blog.coverImage?.formats?.large).toEqual({ url: '/media/cover-1080.png', width: 1080, height: 608 })
    expect(blog.coverImage?.formats?.banner?.width).toBe(1600)
    expect(blog.coverImage?.alternativeText).toBe('A cover')
    expect(blog.coverImage?.id).toBe('7')
  })

  it('drops a size that is missing dimensions instead of emitting a partial format', async () => {
    stubFetch([
      {
        id: 1,
        title: 'Post',
        slug: 'post',
        updatedAt: '2026-01-01',
        coverImage: { ...mediaDoc, sizes: { card: { url: '/media/cover-1080.png' } } },
      },
    ])
    const [blog] = await provider().listBlogs()
    expect(blog.coverImage?.formats?.large).toBeUndefined()
    expect(blog.coverImage?.url).toBe('/media/cover.png')
  })

  it('treats an unpopulated relation and a file-less upload as absent', async () => {
    stubFetch([
      { id: 1, title: 'Unpopulated', slug: 'a', updatedAt: '2026-01-01', coverImage: 7, author: 3 },
      { id: 2, title: 'No file', slug: 'b', updatedAt: '2026-01-01', coverImage: { id: 8, url: null } },
    ])
    const [unpopulated, noFile] = await provider().listBlogs()
    expect(unpopulated.coverImage).toBeNull()
    expect(unpopulated.author).toBeNull()
    expect(noFile.coverImage).toBeNull()
  })
})

describe('PayloadProvider requests', () => {
  it('fetches a single blog by slug in one request', async () => {
    const calls = stubFetch([{ id: 1, title: 'Post', slug: 'post', updatedAt: '2026-01-01' }])
    const blog = await provider().getBlogBySlug('post')

    expect(calls).toHaveLength(1)
    expect(calls[0].url.searchParams.get('where[slug][equals]')).toBe('post')
    expect(calls[0].url.searchParams.get('limit')).toBe('1')
    expect(blog?.slug).toBe('post')
  })

  it('reads published content with ISR and drafts with no caching', async () => {
    const published = stubFetch([])
    await provider().listBlogs()
    expect(published[0].url.searchParams.get('draft')).toBe('false')
    expect((published[0].init as { next?: { revalidate?: number } }).next?.revalidate).toBe(60)
    expect(published[0].init.cache).toBeUndefined()

    vi.unstubAllGlobals()
    const drafts = stubFetch([])
    await provider(true).listBlogs()
    expect(drafts[0].url.searchParams.get('draft')).toBe('true')
    expect(drafts[0].init.cache).toBe('no-store')
  })

  it('excludes a slug for related-item lists', async () => {
    const calls = stubFetch([])
    await provider().listBlogs({ excludeSlug: 'post', limit: 3 })
    expect(calls[0].url.searchParams.get('where[slug][not_equals]')).toBe('post')
    expect(calls[0].url.searchParams.get('limit')).toBe('3')
  })

  it('throws on an upstream failure rather than reporting an empty collection', async () => {
    stubFetch([], 502)
    await expect(provider().listBlogs()).rejects.toThrow('Payload 502: blogs')
  })

  it('requires a base URL', async () => {
    await expect(new PayloadProvider({ baseUrl: '' }).listBlogs()).rejects.toThrow('PAYLOAD_URL is required')
  })
})

describe('PayloadProvider field shapes', () => {
  it('keeps project type as an array and defaults gallery designers', async () => {
    stubFetch([{ id: 1, title: 'P', slug: 'p', type: ['WEBFLOW', 'SEO'], featured: true, publishedAt: '2026-01-01' }])
    const [project] = await provider().listProjects()
    expect(project.type).toEqual(['WEBFLOW', 'SEO'])

    vi.unstubAllGlobals()
    stubFetch([{ id: 2, title: 'G', slug: 'g' }])
    const [item] = await provider().listGalleryItems()
    expect(item.designers).toEqual([])
  })
})
