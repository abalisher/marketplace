import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260904063339 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "driver" drop constraint if exists "driver_phone_unique";`);
    this.addSql(`create table if not exists "driver" ("id" text not null, "phone" text not null, "full_name" text null, "vehicle_model" text null, "vehicle_plate" text null, "capacity_kg" integer null, "status" text check ("status" in ('pending', 'active', 'blocked')) not null default 'pending', "status_note" text null, "status_changed_at" timestamptz null, "status_changed_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "driver_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_driver_deleted_at" ON "driver" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_driver_phone_unique" ON "driver" ("phone") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "driver" cascade;`);
  }

}
