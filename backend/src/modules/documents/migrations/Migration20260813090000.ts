import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// T4.9: отметка «документ отправлен покупателю». Канал отправки не выбран
// (развилка №0), отметку ставит продавец руками — управляющему нужно видеть,
// ушёл ли счёт клиенту.
export class Migration20260813090000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "document" add column if not exists "sent_to_buyer_at" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "document" drop column if exists "sent_to_buyer_at";`);
  }

}
