import type { CollectionConfig } from 'payload';
import { revalidateCacheTags } from '@/lib/revalidate';

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'date'],
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        // Revalidate homepage, events page, and specific event detail page
        const tags = ['homepage', 'events-page', 'events', `event-${doc.slug}`];
        await revalidateCacheTags(tags);
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Event featured image',
      },
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'venueName',
          type: 'text',
        },
        {
          name: 'address',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
        },
        {
          name: 'state',
          type: 'text',
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      admin: {
        description: 'Full event description',
      },
    },
    {
      name: 'eventLinks',
      type: 'array',
      admin: {
        description: 'External links for tickets, registration, or more info',
      },
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            description: 'Link URL',
          },
        },
        {
          name: 'text',
          type: 'text',
          required: true,
          admin: {
            description: 'Link text',
          },
          defaultValue: 'Event Link',
        },
        {
          name: 'icon',
          type: 'text',
          admin: {
            description:
              'Optional icon name from lucide-react (e.g., Ticket, ExternalLink, Calendar, ShoppingCart)',
          },
        },
      ],
    },
  ],
};
