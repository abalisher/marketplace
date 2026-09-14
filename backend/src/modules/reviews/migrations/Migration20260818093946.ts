import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260818093946 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "dispute" add column if not exists "outcome" text check ("outcome" in ('refund', 'redelivery', 'replacement', 'bonus', 'none')) null, add column if not exists "source" text check ("source" in ('buyer', 'operator')) not null default 'buyer';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "dispute" drop column if exists "outcome", drop column if exists "source";`);
  }

}
