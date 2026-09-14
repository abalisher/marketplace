import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260814111326 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "company" add column if not exists "resubmitted_at" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "company" drop column if exists "resubmitted_at";`);
  }

}
