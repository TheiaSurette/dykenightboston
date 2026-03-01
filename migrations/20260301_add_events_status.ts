import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_events_status" AS ENUM('draft', 'published');
  ALTER TABLE "events" ADD COLUMN "status" "enum_events_status" DEFAULT 'draft';
  UPDATE "events" SET "status" = 'published' WHERE "status" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "events" DROP COLUMN "status";
  DROP TYPE "public"."enum_events_status";`)
}
