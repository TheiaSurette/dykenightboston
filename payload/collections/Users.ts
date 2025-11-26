import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    group: 'System',
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'roles'],
    hidden: ({ user }) => {
      // Hide Users collection from editors
      return user?.role !== 'admin';
    },
  },
  auth: {
    // Require email verification
    verify: false, // Set to true to require email verification

    // Lock accounts after failed login attempts
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes in milliseconds

    // Token expiration
    tokenExpiration: 7200, // 2 hours in seconds

    // Custom forgot password email
    forgotPassword: {
      generateEmailHTML: (args) => {
        const token = args?.token || '';
        const userEmail = args?.user?.email || '';
        return `
          <h1>Reset Your Password</h1>
          <p>Hi ${userEmail},</p>
          <p>Click the link below to reset your password:</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/reset-password?token=${token}">
            Reset Password
          </a>
        `;
      },
    },
  },
  access: {
    // Only admins can read user list
    read: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin';
    },
    // Only admins can create users
    create: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin';
    },
    // Only admins can update users
    update: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin';
    },
    // Only admins can delete users (prevent deleting your own account handled in hook)
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin';
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
      ],
      access: {
        // Only admins can change roles
        update: ({ req: { user } }) => {
          return user?.role === 'admin';
        },
      },
    },
  ],
};

