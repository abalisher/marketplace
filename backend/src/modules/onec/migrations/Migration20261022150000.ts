import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Источник каталога компании: HTTP-сервис 1С или Excel-файл, который загружают
// с экрана. У файлового подключения нет адреса, логина и пароля — колонки
// становятся необязательными. Прогон из файла — свой вид запуска, с именем
// файла в журнале.
export class Migration20261022150000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "onec_connection" add column if not exists "source" text check ("source" in ('http', 'file')) not null default 'http';`);
    this.addSql(`alter table if exists "onec_connection" alter column "base_url" drop not null;`);
    this.addSql(`alter table if exists "onec_connection" alter column "login" drop not null;`);
    this.addSql(`alter table if exists "onec_connection" alter column "password_cipher" drop not null;`);

    this.addSql(`alter table if exists "onec_sync_run" drop constraint if exists "onec_sync_run_trigger_check";`);
    this.addSql(`alter table if exists "onec_sync_run" add constraint "onec_sync_run_trigger_check" check ("trigger" in ('schedule', 'manual', 'file'));`);
    this.addSql(`alter table if exists "onec_sync_run" add column if not exists "file_name" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "onec_sync_run" drop column if exists "file_name";`);
    this.addSql(`alter table if exists "onec_sync_run" drop constraint if exists "onec_sync_run_trigger_check";`);
    this.addSql(`alter table if exists "onec_sync_run" add constraint "onec_sync_run_trigger_check" check ("trigger" in ('schedule', 'manual'));`);
    this.addSql(`alter table if exists "onec_connection" drop column if exists "source";`);
  }

}
