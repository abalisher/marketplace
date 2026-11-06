import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Код компании в номере заказа: «ORG» → ORG-26-0007.
export class Migration20261102120100 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "tenant" add column if not exists "order_prefix" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "tenant" drop column if exists "order_prefix";`);
  }

}
