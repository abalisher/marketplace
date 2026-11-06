import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Канал продаж компании обязателен и уникален: по нему компания находится из
// заказа, корзины и publishable key, и два владельца одного канала сделали бы
// доступ продавца неоднозначным. Устаревшие колонки (склад, ключ витрины,
// ключи Kaspi, цена доставки) удаляет скрипт migrate-tenant-isolation —
// после того как перенесёт их данные в ядро.
export class Migration20261001100000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`drop index if exists "IDX_tenant_sales_channel_id";`);
    this.addSql(`alter table if exists "tenant" alter column "sales_channel_id" set not null;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tenant_sales_channel_id_unique" ON "tenant" ("sales_channel_id") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_tenant_sales_channel_id_unique";`);
    this.addSql(`alter table if exists "tenant" alter column "sales_channel_id" drop not null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_tenant_sales_channel_id" ON "tenant" ("sales_channel_id") WHERE deleted_at IS NULL;`);
  }

}
