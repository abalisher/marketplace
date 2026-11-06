import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Интеграция с 1С: подключение компании, журнал синхронизаций и связь позиций
// номенклатуры 1С с товарами площадки (см. модели модуля onec).
export class Migration20261009120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "onec_connection" ("id" text not null, "tenant_id" text not null, "base_url" text not null, "login" text not null, "password_cipher" text not null, "enabled" boolean not null default false, "interval_minutes" integer not null default 30, "exclusive_catalog" boolean not null default true, "stock_location_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "onec_connection_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_onec_connection_tenant_id_unique" ON "onec_connection" ("tenant_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_onec_connection_deleted_at" ON "onec_connection" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "onec_sync_run" ("id" text not null, "tenant_id" text not null, "trigger" text check ("trigger" in ('schedule', 'manual')) not null, "status" text check ("status" in ('running', 'success', 'partial', 'empty', 'failed')) not null default 'running', "started_at" timestamptz not null, "finished_at" timestamptz null, "received" integer not null default 0, "created" integer not null default 0, "updated" integer not null default 0, "unchanged" integer not null default 0, "hidden" integer not null default 0, "detached" integer not null default 0, "failed" integer not null default 0, "error" text null, "issues" jsonb null, "user_id" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "onec_sync_run_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_onec_sync_run_deleted_at" ON "onec_sync_run" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_onec_sync_run_tenant_id_started_at" ON "onec_sync_run" ("tenant_id", "started_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "onec_item" ("id" text not null, "tenant_id" text not null, "external_key" text not null, "external_code" text null, "product_id" text not null, "variant_id" text not null, "present" boolean not null default true, "last_seen_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "onec_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_onec_item_deleted_at" ON "onec_item" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_onec_item_tenant_id_external_key_unique" ON "onec_item" ("tenant_id", "external_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_onec_item_product_id" ON "onec_item" ("product_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "onec_item" cascade;`);
    this.addSql(`drop table if exists "onec_sync_run" cascade;`);
    this.addSql(`drop table if exists "onec_connection" cascade;`);
  }

}
