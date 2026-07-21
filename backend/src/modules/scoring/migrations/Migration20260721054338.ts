import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260721054338 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "score_card" ("id" text not null, "company_id" text not null, "score" integer not null default 0, "credit_limit" numeric not null default 0, "manual_limit" numeric null, "reserved" numeric not null default 0, "components" jsonb null, "note" text null, "raw_credit_limit" jsonb not null default '{"value":"0","precision":20}', "raw_manual_limit" jsonb null, "raw_reserved" jsonb not null default '{"value":"0","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "score_card_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_score_card_deleted_at" ON "score_card" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "scoring_config" ("id" text not null, "points_per_order" integer not null default 5, "max_orders_points" integer not null default 40, "volume_per_point" numeric not null default 100000, "max_volume_points" integer not null default 30, "days_per_point" integer not null default 30, "max_tenure_points" integer not null default 20, "penalty_per_return" integer not null default 10, "min_score_for_credit" integer not null default 30, "base_limit" numeric not null default 0, "limit_per_score_point" numeric not null default 5000, "max_limit" numeric not null default 5000000, "raw_volume_per_point" jsonb not null default '{"value":"100000","precision":20}', "raw_base_limit" jsonb not null default '{"value":"0","precision":20}', "raw_limit_per_score_point" jsonb not null default '{"value":"5000","precision":20}', "raw_max_limit" jsonb not null default '{"value":"5000000","precision":20}', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "scoring_config_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_scoring_config_deleted_at" ON "scoring_config" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "score_card" cascade;`);

    this.addSql(`drop table if exists "scoring_config" cascade;`);
  }

}
