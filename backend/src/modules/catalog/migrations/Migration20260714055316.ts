import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260714055316 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_card" ("id" text not null, "segment" text check ("segment" in ('economy', 'comfort', 'business')) not null, "unit" text not null, "certificates" jsonb null, "rejection_reason" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_card_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_card_deleted_at" ON "product_card" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_card" cascade;`);
  }

}
