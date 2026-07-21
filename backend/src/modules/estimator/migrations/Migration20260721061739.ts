import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260721061739 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "material_norm" drop constraint if exists "material_norm_code_unique";`);
    this.addSql(`create table if not exists "estimate" ("id" text not null, "customer_id" text null, "source" text check ("source" in ('manual', 'file', 'voice')) not null default 'manual', "status" text check ("status" in ('draft', 'calculated')) not null default 'draft', "params" jsonb null, "file_id" text null, "note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "estimate_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_estimate_deleted_at" ON "estimate" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "estimate_line" ("id" text not null, "material_kind" text not null, "quantity" integer not null, "unit" text not null, "norm_code" text null, "segment" text check ("segment" in ('economy', 'comfort', 'business')) null, "product_id" text null, "unit_price" numeric null, "total" numeric null, "estimate_id" text not null, "raw_unit_price" jsonb null, "raw_total" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "estimate_line_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_estimate_line_estimate_id" ON "estimate_line" ("estimate_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_estimate_line_deleted_at" ON "estimate_line" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "material_norm" ("id" text not null, "code" text not null, "name" text not null, "work_type" text not null, "material_kind" text not null, "base" text check ("base" in ('area', 'volume', 'length', 'count')) not null, "consumption_per_unit" integer not null, "unit" text not null, "active" boolean not null default true, "note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "material_norm_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_material_norm_code_unique" ON "material_norm" ("code") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_material_norm_deleted_at" ON "material_norm" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "estimate_line" add constraint "estimate_line_estimate_id_foreign" foreign key ("estimate_id") references "estimate" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "estimate_line" drop constraint if exists "estimate_line_estimate_id_foreign";`);

    this.addSql(`drop table if exists "estimate" cascade;`);

    this.addSql(`drop table if exists "estimate_line" cascade;`);

    this.addSql(`drop table if exists "material_norm" cascade;`);
  }

}
