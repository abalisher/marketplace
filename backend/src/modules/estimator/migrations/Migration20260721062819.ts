import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260721062819 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "material_norm" add column if not exists "category_id" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "material_norm" drop column if exists "category_id";`);
  }

}
