import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Водитель как актор перехода заказа (T5.2b): вручение отмечает водитель-gig из
// своего приложения, и в логе заказа должен стоять `driver`, а не `admin`.
// Проверочное ограничение перечисляет значения enum'а — расширяем его.
export class Migration20260904121500 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "order_lifecycle_event" drop constraint if exists "order_lifecycle_event_actor_type_check";`);
    this.addSql(`alter table if exists "order_lifecycle_event" add constraint "order_lifecycle_event_actor_type_check" check ("actor_type" in ('buyer', 'seller', 'driver', 'admin', 'system'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "order_lifecycle_event" drop constraint if exists "order_lifecycle_event_actor_type_check";`);
    this.addSql(`alter table if exists "order_lifecycle_event" add constraint "order_lifecycle_event_actor_type_check" check ("actor_type" in ('buyer', 'seller', 'admin', 'system'));`);
  }

}
