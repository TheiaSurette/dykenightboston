import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { s3Storage } from '@payloadcms/storage-s3';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { Events } from './payload/collections/Events';
import { Media } from './payload/collections/Media';
import { Users } from './payload/collections/Users';
import { About } from './payload/globals/About';
import { migrations } from './migrations';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Support both DATABASE_URI and POSTGRES_URL (Supabase Vercel integration provides POSTGRES_URL)
const databaseUriRaw = process.env.DATABASE_URI || process.env.POSTGRES_URL;
if (!databaseUriRaw) {
  throw new Error('DATABASE_URI or POSTGRES_URL environment variable is required');
}

// Check if Supabase Storage is configured
// Note: Storage is required for media uploads in production, but we don't fail here
// to allow the admin panel to load. Uploads will fail gracefully if storage isn't configured.
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const hasStorageConfig =
  process.env.SUPABASE_STORAGE_BUCKET &&
  process.env.SUPABASE_STORAGE_ACCESS_KEY_ID &&
  process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY &&
  process.env.SUPABASE_STORAGE_ENDPOINT;

if (isProduction && !hasStorageConfig) {
  console.warn(
    '⚠️  Supabase Storage is not configured. Media uploads will fail in production.\n' +
      'Please set the following environment variables:\n' +
      '- SUPABASE_STORAGE_BUCKET\n' +
      '- SUPABASE_STORAGE_ACCESS_KEY_ID\n' +
      '- SUPABASE_STORAGE_SECRET_ACCESS_KEY\n' +
      '- SUPABASE_STORAGE_ENDPOINT\n' +
      'See env.example for setup instructions.'
  );
}

// Ensure Supabase connections use SSL properly
// Even with Supabase Vercel integration, connection strings use sslmode=require
// which fails in Vercel's build environment due to certificate trust issues
// Solution: use sslmode=no-verify (still uses SSL encryption, just skips cert validation)
let databaseUri = databaseUriRaw;
const isSupabaseConnection = databaseUri.includes('supabase.com');
if (isSupabaseConnection) {
  // Replace sslmode=require with sslmode=no-verify for Supabase
  // This still uses SSL but doesn't validate the certificate chain
  // which is necessary for Supabase in build environments like Vercel
  if (databaseUri.includes('sslmode=require')) {
    databaseUri = databaseUri.replace('sslmode=require', 'sslmode=no-verify');
  } else if (!databaseUri.includes('sslmode=')) {
    // Add sslmode=no-verify if not present
    const separator = databaseUri.includes('?') ? '&' : '?';
    databaseUri = `${databaseUri}${separator}sslmode=no-verify`;
  }
}

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Events,
    Media,
    Users,
  ],
  globals: [
    About,
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri,
    },
    // During build, use push to create schema if it doesn't exist
    // This ensures tables exist before generateStaticParams runs
    // In production runtime, migrations handle schema changes
    push: process.env.VERCEL === '1' || process.env.NODE_ENV === 'production',
    // Specify migration directory for CLI commands
    migrationDir: path.resolve(dirname, 'migrations'),
    // Import migrations for runtime (after initial schema is created)
    prodMigrations: migrations,
  }),
  plugins: [
    // Configure Supabase Storage via S3-compatible API
    // Required in production, optional in development
    ...(hasStorageConfig
      ? [
          s3Storage({
            collections: {
              media: {
                // Use signed URLs for private bucket access
                // Set to false if bucket is public and you want direct access
                signedDownloads: process.env.SUPABASE_STORAGE_USE_SIGNED_URLS === 'true' ? {
                  shouldUseSignedURL: () => true, // Generate signed URLs for all files
                } : undefined,
              },
            },
            bucket: process.env.SUPABASE_STORAGE_BUCKET!,
            config: {
              credentials: {
                accessKeyId: process.env.SUPABASE_STORAGE_ACCESS_KEY_ID!,
                secretAccessKey: process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY!,
              },
              region: process.env.SUPABASE_STORAGE_REGION || 'us-east-1',
              endpoint: process.env.SUPABASE_STORAGE_ENDPOINT!,
              forcePathStyle: true, // Required for Supabase Storage S3 compatibility
            },
          }),
        ]
      : []),
  ],
  sharp,
});

