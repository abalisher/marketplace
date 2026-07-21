import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260719050925 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "document" ("id" text not null, "order_id" text not null, "type" text check ("type" in ('invoice', 'waybill', 'internal_avr')) not null, "number" text not null, "version" integer not null default 1, "is_latest" boolean not null default true, "file_id" text null, "file_url" text null, "snapshot" jsonb not null, "total_money" numeric not null, "total_bonus" numeric not null, "currency_code" text not null default 'kzt', "visible_to_buyer" boolean not null default true, "visible_to_seller" boolean not null default true, "note" text null, "raw_total_money" jsonb not null, "raw_total_bonus" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "document_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_document_deleted_at" ON "document" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "document_sequence" ("id" text not null, "key" text not null, "value" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "document_sequence_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_document_sequence_deleted_at" ON "document_sequence" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "document_setting" ("id" text not null, "seller_name" text not null default 'Marketplace', "seller_bin" text null, "seller_address" text null, "seller_phone" text null, "seller_email" text null, "seller_bank_name" text null, "seller_bank_bik" text null, "seller_iban" text null, "footer_note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "document_setting_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_document_setting_deleted_at" ON "document_setting" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "document" cascade;`);

    this.addSql(`drop table if exists "document_sequence" cascade;`);

    this.addSql(`drop table if exists "document_setting" cascade;`);
  }

}
