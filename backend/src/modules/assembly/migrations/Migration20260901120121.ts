import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260901120121 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "assembly_task" drop constraint if exists "assembly_task_order_id_category_handle_unique";`);
    this.addSql(`create table if not exists "assembly_task" ("id" text not null, "order_id" text not null, "category_handle" text not null, "category_name" text not null, "status" text check ("status" in ('pending', 'picking', 'assembled', 'shortage')) not null default 'pending', "assignee_id" text null, "started_at" timestamptz null, "completed_at" timestamptz null, "completed_by" text null, "note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "assembly_task_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_assembly_task_deleted_at" ON "assembly_task" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_assembly_task_order_id_category_handle_unique" ON "assembly_task" ("order_id", "category_handle") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "assembly_task_item" ("id" text not null, "order_item_id" text not null, "variant_id" text null, "title" text not null, "sku" text null, "quantity" integer not null, "picked_quantity" integer not null default 0, "status" text check ("status" in ('pending', 'picked', 'partial', 'missing')) not null default 'pending', "marked_at" timestamptz null, "marked_by" text null, "note" text null, "task_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "assembly_task_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_assembly_task_item_task_id" ON "assembly_task_item" ("task_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_assembly_task_item_deleted_at" ON "assembly_task_item" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "assembly_task_item" add constraint "assembly_task_item_task_id_foreign" foreign key ("task_id") references "assembly_task" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "assembly_task_item" drop constraint if exists "assembly_task_item_task_id_foreign";`);

    this.addSql(`drop table if exists "assembly_task" cascade;`);

    this.addSql(`drop table if exists "assembly_task_item" cascade;`);
  }

}
