import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Наценки на учётную цену больше нет (решение владельца 2026-10-27): цену
// продажи ставит продавец компании сам, учётная цена 1С — только справка
// («Себестоимость» на «Ценах и остатках»).
export class Migration20261027100000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "onec_connection" drop column if exists "markup_percent";`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "onec_connection" add column if not exists "markup_percent" integer null;`);
  }

}
