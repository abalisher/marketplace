import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260713083529 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "company" drop constraint if exists "company_bin_unique";`);
    this.addSql(`create table if not exists "company" ("id" text not null, "name" text not null, "bin" text not null, "status" text check ("status" in ('pending', 'approved', 'rejected')) not null default 'pending', "rejection_reason" text null, "documents" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "company_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_company_bin_unique" ON "company" ("bin") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_company_deleted_at" ON "company" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "employee" ("id" text not null, "role" text check ("role" in ('admin', 'member')) not null default 'member', "company_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "employee_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_employee_company_id" ON "employee" ("company_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_employee_deleted_at" ON "employee" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "spend_limit" ("id" text not null, "amount" numeric not null, "currency_code" text not null default 'kzt', "period" text check ("period" in ('order', 'day', 'week', 'month')) not null, "employee_id" text not null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "spend_limit_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_spend_limit_employee_id" ON "spend_limit" ("employee_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_spend_limit_deleted_at" ON "spend_limit" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "employee" add constraint "employee_company_id_foreign" foreign key ("company_id") references "company" ("id") on update cascade;`);

    this.addSql(`alter table if exists "spend_limit" add constraint "spend_limit_employee_id_foreign" foreign key ("employee_id") references "employee" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "employee" drop constraint if exists "employee_company_id_foreign";`);

    this.addSql(`alter table if exists "spend_limit" drop constraint if exists "spend_limit_employee_id_foreign";`);

    this.addSql(`drop table if exists "company" cascade;`);

    this.addSql(`drop table if exists "employee" cascade;`);

    this.addSql(`drop table if exists "spend_limit" cascade;`);
  }

}
