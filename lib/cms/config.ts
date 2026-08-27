import type { ContentState } from './types'

export type CMSProviderName = 'strapi' | 'payload'

type Environment = Record<string, string | undefined>

export function getCMSProviderName(env: Environment = process.env): CMSProviderName {
  return env.CMS_PROVIDER === 'payload' ? 'payload' : 'strapi'
}

/** Draft access needs two explicit preview flags. Any invalid configuration fails closed. */
export function getContentState(env: Environment = process.env): ContentState {
  return env.CMS_MODE === 'draft' && env.DEPLOYMENT_ROLE === 'preview' ? 'draft' : 'published'
}

export function isPreviewDeployment(env: Environment = process.env): boolean {
  return env.DEPLOYMENT_ROLE === 'preview'
}
