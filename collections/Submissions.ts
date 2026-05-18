import type { CollectionConfig } from 'payload'

export const Submissions: CollectionConfig = {
  slug: 'submissions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'budget', 'source', 'createdAt'],
    group: 'Inbox',
    listSearchableFields: ['name', 'email'],
    description: 'Enquiries from /contact. Read-only — do not edit submissions.',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true,
    update: () => false,
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'budget', type: 'number', required: true, min: 0 },
    { name: 'details', type: 'textarea', required: true },
    {
      name: 'source',
      type: 'select',
      required: true,
      options: [
        { label: 'LinkedIn', value: 'LINKEDIN' },
        { label: 'Facebook', value: 'FACEBOOK' },
        { label: 'X (Twitter)', value: 'X' },
        { label: 'Instagram', value: 'INSTAGRAM' },
      ],
    },
  ],
  timestamps: true,
}
