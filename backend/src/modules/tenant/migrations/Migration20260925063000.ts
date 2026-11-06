import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260925063000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "tenant" (
      "id" text not null,
      "name" text not null,
      "slug" text not null,
      "bin" text null,
      "status" text check ("status" in ('active', 'suspended')) not null default 'active',
      "domain" text null,
      "logo_url" text null,
      "phone" text null,
      "email" text null,
      "address" text null,
      "sales_channel_id" text null,
      "stock_location_id" text null,
      "publishable_key_id" text null,
      "publishable_key_token" text null,
      "kaspi_merchant_id" text null,
      "kaspi_api_key" text null,
      "kaspi_webhook_secret" text null,
      "delivery_price" numeric not null default 2000,
      "delivery_free_threshold" numeric null,
      "delivery_description" text not null default 'Доставка по Астане',
      "bank_name" text null,
      "bank_bik" text null,
      "bank_iban" text null,
      "bank_kbe" text not null default '17',
      "bank_knp" text not null default '710',
      "director_name" text null,
      "footer_note" text null,
      "created_at" timestamptz not null default now(),
      "updated_at" timestamptz not null default now(),
      "deleted_at" timestamptz null,
      constraint "tenant_pkey" primary key ("id")
    );`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tenant_slug_unique" ON "tenant" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tenant_deleted_at" ON "tenant" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tenant_sales_channel_id" ON "tenant" ("sales_channel_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "tenant" cascade;`);
  }

}
