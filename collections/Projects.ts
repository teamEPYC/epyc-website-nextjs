import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { revalidateProject, revalidateProjectDelete } from '../lib/payload/revalidate-projects.ts'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'industry', 'platform', 'featured', '_status'],
    group: 'Content',
    listSearchableFields: ['title', 'slug'],
  },
  versions: {
    drafts: {
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  defaultSort: '-createdAt',
  access: {
    read: ({ req: { user } }) =>
      user ? true : { _status: { equals: 'published' } },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    slugField({ useAsSlug: 'title' }),
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Card thumbnail; rendered at 16:9.' },
    },
    {
      name: 'type',
      type: 'select',
      hasMany: true,
      required: true,
      admin: { description: 'Services / technologies used.' },
      options: [
        { label: 'Webflow', value: 'WEBFLOW' },
        { label: 'WordPress', value: 'WORDPRESS' },
        { label: 'Framer', value: 'FRAMER' },
        { label: 'Bubble.io', value: 'BUBBLE_IO' },
        { label: 'Shopify', value: 'SHOPIFY' },
        { label: 'Development', value: 'DEVELOPMENT' },
        { label: 'UI/UX', value: 'UI_UX' },
        { label: 'Interactions', value: 'INTERACTIONS' },
        { label: 'Branding', value: 'BRANDING' },
        { label: '3D', value: '3D' },
        { label: 'SEO', value: 'SEO' },
        { label: 'Automations', value: 'AUTOMATIONS' },
        { label: 'Viral Loops', value: 'VIRAL_LOOPS' },
      ],
    },
    {
      name: 'industry',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Venture Capital', value: 'vc' },
        { label: 'SaaS', value: 'saas' },
        { label: 'Finance', value: 'finance' },
        { label: 'Healthcare', value: 'healthcare' },
        { label: 'Ed-Tech', value: 'edtech' },
        { label: 'Web3', value: 'web3' },
        { label: 'E-Commerce', value: 'ecommerce' },
        { label: 'Services', value: 'services' },
        { label: 'Community', value: 'community-initiative' },
        { label: 'NGO', value: 'ngo' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'platform',
      type: 'radio',
      required: true,
      defaultValue: 'website',
      options: [
        { label: 'Website', value: 'website' },
        { label: 'App', value: 'app' },
      ],
    },
    {
      name: 'redirectLink',
      type: 'text',
      required: true,
      admin: { description: 'Full URL the card links to (include https://).' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Featured projects sort to the top of the index.',
      },
    },
  ],
  hooks: {
    afterChange: [revalidateProject],
    afterDelete: [revalidateProjectDelete],
  },
  timestamps: true,
}
