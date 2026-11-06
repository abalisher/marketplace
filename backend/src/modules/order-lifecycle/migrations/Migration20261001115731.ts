import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Канал продаж заказа в lifecycle (мультипродавец): очередь, дашборд и отгрузка
// показывают продавцу компании только её заказы прямым фильтром. Существующим
// заказам канал проставляет скрипт migrate-tenant-isolation.
export class Migration20261001115731 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "order_lifecycle" add column if not exists "sales_channel_id" text null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_lifecycle_sales_channel_id" ON "order_lifecycle" ("sales_channel_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_order_lifecycle_sales_channel_id";`);
    this.addSql(`alter table if exists "order_lifecycle" drop column if exists "sales_channel_id";`);
  }

}
