import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Номер заказа для людей: «ORG-26-0007» — код компании, год, порядковый номер
// внутри компании за год (lib/orders/order-number.ts). Счётчик — своя таблица:
// следующий номер выдаётся одним атомарным upsert'ом, без гонки двух заказов.
export class Migration20261102120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "order_lifecycle" add column if not exists "number" text null;`);
    this.addSql(`create unique index if not exists "IDX_order_lifecycle_number_unique" on "order_lifecycle" ("number") where deleted_at is null and "number" is not null;`);
    this.addSql(`create table if not exists "order_number_sequence" ("key" text not null, "value" integer not null default 0, "updated_at" timestamptz not null default now(), constraint "order_number_sequence_pkey" primary key ("key"));`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "order_number_sequence";`);
    this.addSql(`drop index if exists "IDX_order_lifecycle_number_unique";`);
    this.addSql(`alter table if exists "order_lifecycle" drop column if exists "number";`);
  }

}
