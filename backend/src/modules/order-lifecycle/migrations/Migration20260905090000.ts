import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Слот доставки у заказа (T5.6): дата в астанинских сутках + окно приезда.
// До этой миграции домен не знал, КОГДА везти: покупатель оплачивал заказ и не
// узнавал срок, продавец в очереди видел вместо слота адрес.
// Колонки nullable — у ранее оформленных заказов слота нет и не будет.
export class Migration20260905090000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "order_lifecycle" add column if not exists "delivery_date" text null, add column if not exists "delivery_window" text check ("delivery_window" in ('morning', 'day', 'evening')) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "order_lifecycle" drop column if exists "delivery_date";`);
    this.addSql(`alter table if exists "order_lifecycle" drop column if exists "delivery_window";`);
  }

}
