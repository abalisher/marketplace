import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260716090932 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "order_lifecycle" add column if not exists "delivery_method" text check ("delivery_method" in ('delivery', 'pickup', 'counter')) not null default 'delivery', add column if not exists "delivery_code" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "order_lifecycle" drop column if exists "delivery_method", drop column if exists "delivery_code";`);
  }

}
