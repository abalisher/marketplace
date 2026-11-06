import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Ставка НДС компании-продавца: пусто — не плательщик НДС.
export class Migration20261105090000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "tenant" add column if not exists "vat_rate" integer null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "tenant" drop column if exists "vat_rate";`);
  }

}
