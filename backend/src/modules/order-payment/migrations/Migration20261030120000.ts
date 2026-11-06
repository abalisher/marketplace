import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// История смены способа оплаты покупателем у оплаты заказа.
export class Migration20261030120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "order_payment" add column if not exists "method_history" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "order_payment" drop column if exists "method_history";`);
  }

}
