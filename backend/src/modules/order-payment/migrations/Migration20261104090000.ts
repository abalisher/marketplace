import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Постоянный Kaspi QR магазина у способов оплаты продавца.
export class Migration20261104090000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "payment_settings" add column if not exists "kaspi_static_qr_url" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "payment_settings" drop column if exists "kaspi_static_qr_url";`);
  }

}
