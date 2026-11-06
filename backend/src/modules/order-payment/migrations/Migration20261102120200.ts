import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Номер заказа для людей (ORG-26-0007) рядом с числовым display_id: журнал
// оплат, долги и чеки показывают и ищут заказ по нему.
export class Migration20261102120200 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "order_payment" add column if not exists "order_number" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "order_payment" drop column if exists "order_number";`);
  }

}
