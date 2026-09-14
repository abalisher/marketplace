import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Перенос слота доставки в логе заказа (T5.6b): род записи + слот до и после.
// До этой миграции лог знал только переходы статуса, и записать «кто и почему
// подвинул доставку» было некуда — слот менялся бы молча.
// Существующие записи — переходы статуса: `kind` получает default 'status',
// слотовые колонки у них остаются пустыми.
export class Migration20260906100000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "order_lifecycle_event" add column if not exists "kind" text check ("kind" in ('status', 'slot')) not null default 'status', add column if not exists "from_slot_date" text null, add column if not exists "from_slot_window" text check ("from_slot_window" in ('morning', 'day', 'evening')) null, add column if not exists "to_slot_date" text null, add column if not exists "to_slot_window" text check ("to_slot_window" in ('morning', 'day', 'evening')) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "order_lifecycle_event" drop column if exists "kind";`);
    this.addSql(`alter table if exists "order_lifecycle_event" drop column if exists "from_slot_date";`);
    this.addSql(`alter table if exists "order_lifecycle_event" drop column if exists "from_slot_window";`);
    this.addSql(`alter table if exists "order_lifecycle_event" drop column if exists "to_slot_date";`);
    this.addSql(`alter table if exists "order_lifecycle_event" drop column if exists "to_slot_window";`);
  }

}
