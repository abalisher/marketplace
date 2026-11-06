import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Остаток в журнале правок — дробный (numeric), как и цена: остатки из 1С в
// м³, т, м² дробные и должны совпадать с 1С точь-в-точь.
export class Migration20261022090000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "price_change" alter column "old_stock" type numeric using ("old_stock"::numeric);`);
    this.addSql(`alter table if exists "price_change" alter column "new_stock" type numeric using ("new_stock"::numeric);`);
    this.addSql(`alter table if exists "price_change" add column if not exists "raw_old_stock" jsonb null;`);
    this.addSql(`alter table if exists "price_change" add column if not exists "raw_new_stock" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "price_change" drop column if exists "raw_old_stock";`);
    this.addSql(`alter table if exists "price_change" drop column if exists "raw_new_stock";`);
    this.addSql(`alter table if exists "price_change" alter column "old_stock" type integer using (round("old_stock")::integer);`);
    this.addSql(`alter table if exists "price_change" alter column "new_stock" type integer using (round("new_stock")::integer);`);
  }

}
