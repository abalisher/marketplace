import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Себестоимость позиции 1С (учётная цена, rate) — для колонки «Себестоимость»
// на «Ценах и остатках». Только в панели: в витрину не отдаётся.
export class Migration20261022120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "onec_item" add column if not exists "cost" numeric null;`);
    this.addSql(`alter table if exists "onec_item" add column if not exists "raw_cost" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "onec_item" drop column if exists "raw_cost";`);
    this.addSql(`alter table if exists "onec_item" drop column if exists "cost";`);
  }

}
