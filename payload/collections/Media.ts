import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
  },
  access: {
    // Public read access - anyone can view media metadata and URLs
    read: () => true,
    // Admins and editors can create/upload new media files
    create: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin' || user.role === 'editor';
    },
    // Admins and editors can update media files
    update: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin' || user.role === 'editor';
    },
    // Admins and editors can delete media files
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin' || user.role === 'editor';
    },
  },
  upload: {
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'audio/*', 'video/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
};

