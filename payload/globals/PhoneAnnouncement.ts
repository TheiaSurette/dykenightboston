import type { GlobalConfig } from 'payload';
import { hasValidAnnouncementCharacters } from '@/lib/phoneAnnouncement';

export const PhoneAnnouncement: GlobalConfig = {
  slug: 'phone-announcement',
  label: 'Phone announcement',
  admin: { group: 'Content' },
  access: {
    read: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
  },
  fields: [
    {
      name: 'message',
      type: 'textarea',
      label: 'Announcement text',
      required: true,
      maxLength: 1500,
      admin: {
        description: 'Plain text, up to 1,500 characters (about two minutes). Saving makes this message live for the next caller.',
      },
      validate: (value) => {
        if (typeof value !== 'string' || !value.trim()) return 'Enter an announcement containing text.';
        if (!hasValidAnnouncementCharacters(value)) return 'This announcement contains characters that cannot be read aloud. Remove them and try again.';
        if (value.length > 1500) return 'Keep the announcement to 1,500 characters or fewer.';
        return true;
      },
    },
  ],
};
