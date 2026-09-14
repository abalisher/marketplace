import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260904074116 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "trip_stop" drop constraint if exists "trip_stop_order_id_type_unique";`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_trip_stop_order_id_type_unique" ON "trip_stop" ("order_id", "type") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_trip_stop_order_id_type_unique";`);
  }

}
