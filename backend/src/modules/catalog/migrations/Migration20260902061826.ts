import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260902061826 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "price_change" ("id" text not null, "variant_id" text not null, "product_id" text null, "product_title" text not null, "variant_title" text null, "sku" text null, "currency_code" text null, "old_price" numeric null, "new_price" numeric null, "location_id" text null, "old_stock" integer null, "new_stock" integer null, "changed_by" text null, "changed_by_name" text null, "source" text check ("source" in ('manual', 'import')) not null default 'manual', "raw_old_price" jsonb null, "raw_new_price" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "price_change_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_price_change_deleted_at" ON "price_change" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_price_change_variant_id" ON "price_change" ("variant_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "price_change" cascade;`);
  }

}
