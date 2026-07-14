import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260714122906 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "order_lifecycle" ("id" text not null, "status" text check ("status" in ('new', 'confirmed', 'assembling', 'partially_assembled', 'assembled', 'in_delivery', 'delivered', 'closed', 'canceled', 'returned')) not null default 'new', "previous_status" text check ("previous_status" in ('new', 'confirmed', 'assembling', 'partially_assembled', 'assembled', 'in_delivery', 'delivered', 'closed', 'canceled', 'returned')) null, "note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "order_lifecycle_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_lifecycle_deleted_at" ON "order_lifecycle" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "order_lifecycle_event" ("id" text not null, "from_status" text check ("from_status" in ('new', 'confirmed', 'assembling', 'partially_assembled', 'assembled', 'in_delivery', 'delivered', 'closed', 'canceled', 'returned')) null, "to_status" text check ("to_status" in ('new', 'confirmed', 'assembling', 'partially_assembled', 'assembled', 'in_delivery', 'delivered', 'closed', 'canceled', 'returned')) not null, "actor_type" text check ("actor_type" in ('buyer', 'seller', 'admin', 'system')) not null, "actor_id" text null, "reason" text null, "order_lifecycle_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "order_lifecycle_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_lifecycle_event_order_lifecycle_id" ON "order_lifecycle_event" ("order_lifecycle_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_lifecycle_event_deleted_at" ON "order_lifecycle_event" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "order_lifecycle_event" add constraint "order_lifecycle_event_order_lifecycle_id_foreign" foreign key ("order_lifecycle_id") references "order_lifecycle" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "order_lifecycle_event" drop constraint if exists "order_lifecycle_event_order_lifecycle_id_foreign";`);

    this.addSql(`drop table if exists "order_lifecycle" cascade;`);

    this.addSql(`drop table if exists "order_lifecycle_event" cascade;`);
  }

}
