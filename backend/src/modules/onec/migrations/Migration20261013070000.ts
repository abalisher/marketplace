import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Второй сервис подключения к 1С — выгрузка остатков (и цен), отдельная от
// номенклатуры.
export class Migration20261013070000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "onec_connection" add column if not exists "stock_url" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "onec_connection" drop column if exists "stock_url";`);
  }

}
