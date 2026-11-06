import { Migration } from "@medusajs/framework/mikro-orm/migrations";

// Копии диалогов покупателя с ассистентом — одна лента на всех устройствах.
export class Migration20261029150000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "chat_conversation" ("id" text not null, "customer_id" text not null, "sales_channel_id" text not null, "client_id" text not null, "title" text not null, "title_custom" boolean not null default false, "messages" jsonb not null, "cards" jsonb null, "cart_id" text null, "order_id" text null, "client_updated_at" numeric not null, "raw_client_updated_at" jsonb not null, "removed_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "chat_conversation_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_chat_conversation_customer_id_sales_channel_id_client_id_unique" ON "chat_conversation" ("customer_id", "sales_channel_id", "client_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_chat_conversation_deleted_at" ON "chat_conversation" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "chat_conversation" cascade;`);
  }

}
