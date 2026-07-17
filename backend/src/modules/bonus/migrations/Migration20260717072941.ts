import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260717072941 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "bonus_config" add column if not exists "expiry_notice_days" integer not null default 7;`);

    this.addSql(`alter table if exists "bonus_transaction" add column if not exists "expiry_notified_at" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "bonus_config" drop column if exists "expiry_notice_days";`);

    this.addSql(`alter table if exists "bonus_transaction" drop column if exists "expiry_notified_at";`);
  }

}
