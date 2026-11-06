import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Журнал правок цены и остатка различает третий источник — синхронизацию с 1С
// компании (lib/onec/sync.ts).
export class Migration20261009120500 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "price_change" drop constraint if exists "price_change_source_check";`);
    this.addSql(`alter table if exists "price_change" add constraint "price_change_source_check" check ("source" in ('manual', 'import', 'onec'));`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "price_change" drop constraint if exists "price_change_source_check";`);
    this.addSql(`alter table if exists "price_change" add constraint "price_change_source_check" check ("source" in ('manual', 'import'));`);
  }

}
