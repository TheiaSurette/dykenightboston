import type { GlobalConfig } from 'payload';
import { revalidateCacheTags } from '@/lib/revalidate';

export const About: GlobalConfig = {
  slug: 'about',
  admin: {
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async () => {
        // Revalidate about page
        const tags = ['about-page'];
        await revalidateCacheTags(tags);
      },
    ],
  },
  fields: [
    {
      name: 'aboutSection',
      type: 'group',
      label: 'About Dyke Night',
      fields: [
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
      ],
    },
    {
      name: 'houseRulesSection',
      type: 'group',
      label: 'House Rules',
      fields: [
        {
          name: 'rules',
          type: 'array',
          required: true,
          fields: [
            {
              name: 'rule',
              type: 'textarea',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'cruisingSection',
      type: 'group',
      label: 'What is Cruising?',
      fields: [
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
      ],
    },
    {
      name: 'flaggingSection',
      type: 'group',
      label: 'What is Flagging?',
      fields: [
        {
          name: 'content',
          type: 'richText',
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Flagging chart image',
          },
        },
      ],
    },
  ],
};

