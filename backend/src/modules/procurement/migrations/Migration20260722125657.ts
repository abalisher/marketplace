import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260722125657 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "procurement_batch" ("id" text not null, "variant_id" text not null, "receipt_line_id" text not null, "quantity_received" real not null, "quantity_remaining" real not null, "unit_cost" integer not null default 0, "received_at" timestamptz not null, "expires_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "procurement_batch_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_procurement_batch_deleted_at" ON "procurement_batch" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "receipt" ("id" text not null, "supplier_id" text null, "location_id" text not null, "reference" text null, "status" text check ("status" in ('draft', 'posted')) not null default 'draft', "source" text check ("source" in ('manual', 'invoice_ai', 'photo_ai')) not null default 'manual', "document_file_id" text null, "received_at" timestamptz null, "total_cost" integer not null default 0, "note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "receipt_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_receipt_deleted_at" ON "receipt" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "receipt_line" ("id" text not null, "variant_id" text null, "recognized_title" text null, "material_kind" text null, "quantity" real not null, "unit" text not null, "unit_cost" integer not null default 0, "line_cost" integer not null default 0, "expires_at" timestamptz null, "receipt_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "receipt_line_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_receipt_line_receipt_id" ON "receipt_line" ("receipt_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_receipt_line_deleted_at" ON "receipt_line" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "supplier" ("id" text not null, "name" text not null, "bin" text null, "contact_phone" text null, "contact_email" text null, "note" text null, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "supplier_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_supplier_deleted_at" ON "supplier" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "receipt_line" add constraint "receipt_line_receipt_id_foreign" foreign key ("receipt_id") references "receipt" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "receipt_line" drop constraint if exists "receipt_line_receipt_id_foreign";`);

    this.addSql(`drop table if exists "procurement_batch" cascade;`);

    this.addSql(`drop table if exists "receipt" cascade;`);

    this.addSql(`drop table if exists "receipt_line" cascade;`);

    this.addSql(`drop table if exists "supplier" cascade;`);
  }

}
