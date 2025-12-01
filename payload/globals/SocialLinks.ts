import type { GlobalConfig } from 'payload';
import { revalidateCacheTags } from '@/lib/revalidate';

export const SocialLinks: GlobalConfig = {
  slug: 'social-links',
  admin: {
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async () => {
        // Revalidate footer (appears on all pages)
        const tags = ['footer', 'homepage', 'about-page', 'events-page'];
        await revalidateCacheTags(tags);
      },
    ],
  },
  fields: [
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Links',
      admin: {
        description: 'Add social media links to display in the footer under "Connect"',
      },
      fields: [
        {
          name: 'platform',
          type: 'text',
          required: true,
          admin: {
            description: 'Platform name (e.g., Instagram, Facebook, Twitter, TikTok)',
          },
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            description: 'Full URL to the social media profile',
          },
        },
        {
          name: 'icon',
          type: 'text',
          admin: {
            description:
              'Optional icon name from lucide-react (e.g., Instagram, Facebook, Twitter, Youtube, Link)',
          },
        },
      ],
    },
  ],
};

