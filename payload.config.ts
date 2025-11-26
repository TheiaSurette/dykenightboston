import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
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
    // Use migrations instead of push for production
    push: false,
    // Specify migration directory for CLI commands (payload migrate)
    migrationDir: path.resolve(dirname, 'migrations'),
    // Import migrations directly for runtime (Vercel/serverless compatibility)
    // Migrations will run automatically when Payload initializes
    prodMigrations: migrations,
  }),
  sharp,
});

