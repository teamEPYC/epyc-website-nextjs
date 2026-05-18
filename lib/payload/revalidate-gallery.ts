import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'

async function revalidate(...paths: string[]) {
  const { revalidatePath } = await import('next/cache')
  for (const p of paths) revalidatePath(p)
}

export const revalidateGallery: CollectionAfterChangeHook = ({ doc, req }) => {
  const context = req?.context as { disableRevalidate?: boolean } | undefined
  if (context?.disableRevalidate) return doc
  const slug = (doc as { slug?: string }).slug
  void revalidate('/gallery', ...(slug ? [`/gallery/${slug}`] : []))
  return doc
}

export const revalidateGalleryDelete: CollectionAfterDeleteHook = ({
  doc,
  req,
}) => {
  const context = req?.context as { disableRevalidate?: boolean } | undefined
  if (context?.disableRevalidate) return doc
  const slug = (doc as { slug?: string }).slug
  void revalidate('/gallery', ...(slug ? [`/gallery/${slug}`] : []))
  return doc
}
