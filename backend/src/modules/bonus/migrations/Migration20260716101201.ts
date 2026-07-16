import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260716101201 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "bonus_account" ("id" text not null, "balance" numeric not null default 0, "currency_code" text not null default 'kzt', "raw_balance" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bonus_account_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bonus_account_deleted_at" ON "bonus_account" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "bonus_config" ("id" text not null, "accrual_percent" real not null default 1, "segment_percents" jsonb null, "max_spend_percent" real not null default 50, "expiry_days" integer null, "return_window_days" integer not null default 14, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bonus_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bonus_config_deleted_at" ON "bonus_config" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "bonus_transaction" ("id" text not null, "type" text check ("type" in ('accrual', 'spend', 'expiry', 'manual_credit', 'manual_debit')) not null, "amount" numeric not null, "remaining" numeric null, "expires_at" timestamptz null, "lot_breakdown" jsonb null, "note" text null, "account_id" text not null, "raw_amount" jsonb not null, "raw_remaining" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "bonus_transaction_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bonus_transaction_account_id" ON "bonus_transaction" ("account_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bonus_transaction_deleted_at" ON "bonus_transaction" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "bonus_transaction" add constraint "bonus_transaction_account_id_foreign" foreign key ("account_id") references "bonus_account" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "bonus_transaction" drop constraint if exists "bonus_transaction_account_id_foreign";`);

    this.addSql(`drop table if exists "bonus_account" cascade;`);

    this.addSql(`drop table if exists "bonus_config" cascade;`);

    this.addSql(`drop table if exists "bonus_transaction" cascade;`);
  }

}
