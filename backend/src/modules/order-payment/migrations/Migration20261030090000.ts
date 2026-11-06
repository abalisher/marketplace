import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Чеки Kaspi от покупателей (перевод, погашение долга): файл, распознанные
// поля, проверка и решение продавца; у оплаты заказа — признак «чек ждёт».
export class Migration20261030090000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "order_payment" add column if not exists "receipt_pending" boolean not null default false;`);

    this.addSql(`create table if not exists "payment_receipt" ("id" text not null, "sales_channel_id" text null, "file_id" text null, "file_url" text null, "file_name" text null, "mime_type" text not null, "file_hash" text not null, "amount" numeric null, "raw_amount" jsonb null, "paid_at" timestamptz null, "receipt_number" text null, "recipient_name" text null, "recipient_phone" text null, "sender_name" text null, "comment" text null, "parsed" jsonb null, "checks" jsonb null, "verdict" text check ("verdict" in ('ok', 'warning', 'fail')) not null, "status" text check ("status" in ('pending', 'flagged', 'accepted', 'rejected')) not null, "reviewed_by" text null, "reviewed_at" timestamptz null, "review_note" text null, "entry_id" text null, "order_payment_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payment_receipt_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_receipt_order_payment_id" ON "payment_receipt" ("order_payment_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_receipt_deleted_at" ON "payment_receipt" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_receipt_receipt_number" ON "payment_receipt" ("receipt_number") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_receipt_file_hash" ON "payment_receipt" ("file_hash") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payment_receipt_sales_channel_id_status" ON "payment_receipt" ("sales_channel_id", "status") WHERE deleted_at IS NULL;`);
    this.addSql(`alter table if exists "payment_receipt" add constraint "payment_receipt_order_payment_id_foreign" foreign key ("order_payment_id") references "order_payment" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "payment_receipt" drop constraint if exists "payment_receipt_order_payment_id_foreign";`);
    this.addSql(`drop table if exists "payment_receipt" cascade;`);
    this.addSql(`alter table if exists "order_payment" drop column if exists "receipt_pending";`);
  }

}
