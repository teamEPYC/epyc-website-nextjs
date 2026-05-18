import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { lexicalEditor, HeadingFeature, LinkFeature } from '@payloadcms/richtext-lexical'
import { revalidateBlog, revalidateBlogDelete } from '../lib/payload/revalidate-blogs.ts'

export const Blogs: CollectionConfig = {
  slug: 'blogs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'publishedAt', '_status'],
    group: 'Content',
    listSearchableFields: ['title', 'slug'],
  },
  versions: {
    drafts: {
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
  defaultSort: '-publishedAt',
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
      name: 'publishedAt',
      type: 'date',
      index: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        position: 'sidebar',
        description: 'Leave blank for undated entries; they sort to the bottom of the index.',
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'authors',
      required: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'readTime',
      type: 'text',
      admin: {
        description: 'Free-form, e.g. "5 Mins Read". Optional.',
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary; also used as default SEO description.',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: { description: 'Banner image used on the card and at the top of the detail page.' },
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
          LinkFeature({}),
        ],
      }),
    },
    {
      type: 'group',
      name: 'meta',
      admin: {
        position: 'sidebar',
        description: 'Override SEO defaults; falls back to title and excerpt.',
      },
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateBlog],
    afterDelete: [revalidateBlogDelete],
  },
  timestamps: true,
}
