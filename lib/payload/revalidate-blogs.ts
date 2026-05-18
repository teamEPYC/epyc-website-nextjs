import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

type SlugDoc = { slug?: string | null }

/**
 * `next/cache` is dynamically imported so that Payload's CLI (which runs
 * outside the Next.js bundler context — e.g. `pnpm generate:types`) can load
 * this file without failing to resolve the Next.js-only module. At runtime
 * inside the Next.js server the import resolves normally.
 */
async function revalidate(...paths: string[]) {
  const { revalidatePath } = await import('next/cache')
  for (const p of paths) revalidatePath(p)
}

export const revalidateBlog: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  const context = req?.context as { disableRevalidate?: boolean } | undefined
  if (context?.disableRevalidate) return doc

  const next = (doc as SlugDoc).slug
  const prev = (previousDoc as SlugDoc | undefined)?.slug

  const paths = ['/blogs']
  if (next) paths.push(`/blogs/${next}`)
  if (prev && prev !== next) paths.push(`/blogs/${prev}`)

  void revalidate(...paths)
  return doc
}

export const revalidateBlogDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  const context = req?.context as { disableRevalidate?: boolean } | undefined
  if (context?.disableRevalidate) return doc

  const slug = (doc as SlugDoc | undefined)?.slug
  const paths = ['/blogs']
  if (slug) paths.push(`/blogs/${slug}`)

  void revalidate(...paths)
  return doc
}
