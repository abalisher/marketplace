import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Оплаты заказов: способы оплаты продавца (по каналу продаж), оплата каждого
// заказа и журнал движений денег (см. модели модуля order_payment).
export class Migration20261029090000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "payment_settings" ("id" text not null, "sales_channel_id" text not null, "kaspi_qr_enabled" boolean not null default true, "kaspi_mode" text check ("kaspi_mode" in ('mock', 'live')) not null default 'mock', "kaspi_merchant_id" text null, "kaspi_api_key_cipher" text null, "kaspi_webhook_secret_cipher" text null, "transfer_enabled" boolean not null default false, "transfer_phone" text null, "transfer_recipient" text null, "transfer_note" text null, "debt_enabled" boolean not null default false, "debt_max_amount" numeric null, "raw_debt_max_amount" jsonb null, "debt_term_days" integer not null default 14, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payment_settings_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payment_settings_sales_channel_id_unique" ON "payment_settings" ("sales_channel_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_settings_deleted_at" ON "payment_settings" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "order_payment" ("id" text not null, "order_id" text not null, "order_display_id" integer null, "sales_channel_id" text null, "customer_id" text null, "customer_name" text null, "customer_phone" text null, "method" text check ("method" in ('kaspi_qr', 'kaspi_transfer', 'debt', 'bonus')) not null, "status" text check ("status" in ('awaiting', 'debt_requested', 'debt', 'paid', 'canceled', 'refund_due', 'refunded')) not null, "currency_code" text not null default 'kzt', "amount" numeric not null, "raw_amount" jsonb not null, "paid_amount" numeric not null default 0, "raw_paid_amount" jsonb not null default '{"value":"0","precision":20}', "refunded_amount" numeric not null default 0, "raw_refunded_amount" jsonb not null default '{"value":"0","precision":20}', "due_date" timestamptz null, "approved_at" timestamptz null, "approved_by" text null, "canceled_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "order_payment_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_order_payment_order_id_unique" ON "order_payment" ("order_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_payment_deleted_at" ON "order_payment" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_payment_sales_channel_id" ON "order_payment" ("sales_channel_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_payment_customer_id" ON "order_payment" ("customer_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_payment_method_status" ON "order_payment" ("method", "status") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "payment_entry" ("id" text not null, "kind" text check ("kind" in ('payment', 'refund')) not null, "channel" text check ("channel" in ('kaspi_qr', 'kaspi_transfer', 'cash', 'card', 'other')) not null, "amount" numeric not null, "raw_amount" jsonb not null, "sales_channel_id" text null, "actor_type" text check ("actor_type" in ('system', 'seller', 'admin')) not null, "actor_id" text null, "note" text null, "occurred_at" timestamptz not null, "order_payment_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payment_entry_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_entry_order_payment_id" ON "payment_entry" ("order_payment_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_entry_deleted_at" ON "payment_entry" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_entry_sales_channel_id_occurred_at" ON "payment_entry" ("sales_channel_id", "occurred_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "payment_entry" add constraint "payment_entry_order_payment_id_foreign" foreign key ("order_payment_id") references "order_payment" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "payment_entry" drop constraint if exists "payment_entry_order_payment_id_foreign";`);
    this.addSql(`drop table if exists "payment_entry" cascade;`);
    this.addSql(`drop table if exists "order_payment" cascade;`);
    this.addSql(`drop table if exists "payment_settings" cascade;`);
  }

}
