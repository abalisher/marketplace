import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260721045616 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "dispute" ("id" text not null, "order_id" text not null, "customer_id" text not null, "category" text check ("category" in ('not_delivered', 'damaged', 'wrong_item', 'quality', 'other')) not null, "description" text not null, "status" text check ("status" in ('open', 'in_review', 'resolved', 'rejected')) not null default 'open', "resolution" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "dispute_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_dispute_deleted_at" ON "dispute" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "review" ("id" text not null, "order_id" text not null, "customer_id" text not null, "target" text check ("target" in ('supplier', 'delivery')) not null, "rating" integer not null, "comment" text null, "status" text check ("status" in ('published', 'hidden')) not null default 'published', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_review_deleted_at" ON "review" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "dispute" cascade;`);

    this.addSql(`drop table if exists "review" cascade;`);
  }

}
