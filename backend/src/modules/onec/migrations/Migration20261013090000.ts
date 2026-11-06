import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Наценка на учётную цену 1С: цена продажи = учётная × (1 + наценка).
export class Migration20261013090000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "onec_connection" add column if not exists "markup_percent" integer null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "onec_connection" drop column if exists "markup_percent";`);
  }

}
