import type { ContentState } from './types'

type Environment = Record<string, string | undefined>

/** Draft access needs two explicit preview flags. Any invalid configuration fails closed. */
export function getContentState(env: Environment = process.env): ContentState {
  return env.CMS_MODE === 'draft' && env.DEPLOYMENT_ROLE === 'preview' ? 'draft' : 'published'
}

export function isPreviewDeployment(env: Environment = process.env): boolean {
  return env.DEPLOYMENT_ROLE === 'preview'
}
