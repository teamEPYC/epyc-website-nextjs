import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

async function revalidate(...paths: string[]) {
  const { revalidatePath } = await import('next/cache')
  for (const p of paths) revalidatePath(p)
}

export const revalidateProject: CollectionAfterChangeHook = ({ doc, req }) => {
  const context = req?.context as { disableRevalidate?: boolean } | undefined
  if (context?.disableRevalidate) return doc
  void revalidate('/projects')
  return doc
}

export const revalidateProjectDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  const context = req?.context as { disableRevalidate?: boolean } | undefined
  if (context?.disableRevalidate) return doc
  void revalidate('/projects')
  return doc
}
