import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    // No `crop`: the admin crop tool needs `sharp` to apply the crop, and
    // `sharp` isn't wired to Payload (it can't run in workerd) — so it was a
    // dead control. `focalPoint` is kept; the normalise helpers use it.
    focalPoint: true,
    adminThumbnail: 'thumbnail',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 225, position: 'centre' },
      { name: 'card', width: 1080, height: 608, position: 'centre' },
      { name: 'banner', width: 1600, height: 900, position: 'centre' },
    ],
  },
}
