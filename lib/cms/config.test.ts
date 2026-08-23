import { describe, expect, it } from 'vitest'
import { getCMSProviderName, getContentState, isPreviewDeployment } from './config'

describe('CMS configuration', () => {
  it('fails closed to published content', () => {
    expect(getContentState({ CMS_MODE: 'draft', DEPLOYMENT_ROLE: 'production' })).toBe('published')
    expect(getContentState({ CMS_MODE: 'published', DEPLOYMENT_ROLE: 'preview' })).toBe('published')
    expect(getContentState({})).toBe('published')
  })

  it('allows drafts only on an explicitly configured preview deployment', () => {
    expect(getContentState({ CMS_MODE: 'draft', DEPLOYMENT_ROLE: 'preview' })).toBe('draft')
    expect(isPreviewDeployment({ DEPLOYMENT_ROLE: 'preview' })).toBe(true)
  })

  it('keeps Strapi as the rollback default', () => {
    expect(getCMSProviderName({})).toBe('strapi')
    expect(getCMSProviderName({ CMS_PROVIDER: 'payload' })).toBe('payload')
    expect(getCMSProviderName({ CMS_PROVIDER: 'unknown' })).toBe('strapi')
  })
})
