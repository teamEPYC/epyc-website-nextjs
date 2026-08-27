import { getCMSProviderName, getContentState } from './config'
import { PayloadProvider } from './payload-provider'
import { StrapiProvider } from './strapi-provider'
import type { CMSProvider } from './types'

let provider: CMSProvider | undefined

export function getCMS(): CMSProvider {
  if (provider) return provider
  provider = getCMSProviderName() === 'payload'
    ? new PayloadProvider({ draft: getContentState() === 'draft' })
    : new StrapiProvider()
  return provider
}

export type { Author, Blog, CMSProvider, ContentState, GalleryItem, Media, Project } from './types'
