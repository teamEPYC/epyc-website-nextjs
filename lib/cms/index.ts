import { getContentState } from './config'
import { PayloadProvider } from './payload-provider'
import type { CMSProvider } from './types'

let provider: CMSProvider | undefined

export function getCMS(): CMSProvider {
  if (provider) return provider
  provider = new PayloadProvider({ draft: getContentState() === 'draft' })
  return provider
}

export type { Author, Blog, CMSProvider, ContentState, GalleryItem, Media, Project } from './types'
