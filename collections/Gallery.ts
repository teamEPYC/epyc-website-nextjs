import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import {
  revalidateGallery,
  revalidateGalleryDelete,
} from '../lib/payload/revalidate-gallery.ts'

/**
 * Gallery — short-form stills/clips/3D pieces shown on /gallery and
 * /gallery/[slug]. Items are either an image (re-hosted into Media) or a
 * remote video URL (hosted on files.epyc.in; we store the URL, not the file,
 * because Media only accepts image/* and these are short-loop mp4s served
 * elsewhere anyway).
 *
 * At least one of `thumbnail` or `videoUrl` must be present — validated in
 * beforeValidate below.
 */
export const Gallery: CollectionConfig = {
  slug: 'gallery',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'designers', 'year', '_status'],
    group: 'Content',
    listSearchableFields: ['title', 'slug', 'designers'],
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
      admin: {
        description:
          'Still image for this item. Optional when videoUrl is set; required when it is not.',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        description:
          'Direct URL to an .mp4 (e.g. https://files.epyc.in/videos/foo.mp4). When set, the card autoplays this video instead of showing the thumbnail.',
      },
    },
    {
      name: 'designers',
      type: 'text',
      admin: {
        description:
          'Comma-separated designer credits, e.g. "Ashish Kumar, Abhishek Aravind".',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description:
          'Single-paragraph body copy shown on the detail page below the title.',
      },
    },
    {
      name: 'previewLink',
      type: 'text',
      admin: {
        description:
          'External URL where this work was originally posted (Instagram, Behance, etc.). Hidden on the detail page when blank.',
      },
    },
    {
      name: 'year',
      type: 'text',
      admin: {
        description: 'Year the piece was made (free-form, e.g. "2022").',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) return data
        const hasMedia = Boolean(data.thumbnail) || Boolean(data.videoUrl?.trim?.())
        if (!hasMedia) {
          throw new Error(
            'Gallery item must have either a thumbnail upload or a videoUrl.',
          )
        }
        return data
      },
    ],
    afterChange: [revalidateGallery],
    afterDelete: [revalidateGalleryDelete],
  },
  timestamps: true,
}
