import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260722095700 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "delivery_tariff" ("id" text not null, "zone" text not null, "base_price" integer not null default 0, "price_per_kg" real not null default 0, "price_per_m3" real not null default 0, "active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "delivery_tariff_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_delivery_tariff_deleted_at" ON "delivery_tariff" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "gps_ping" ("id" text not null, "trip_id" text not null, "driver_id" text not null, "lat" real not null, "lng" real not null, "recorded_at" timestamptz not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "gps_ping_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_gps_ping_deleted_at" ON "gps_ping" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "trip" ("id" text not null, "driver_id" text not null, "location_id" text not null, "status" text check ("status" in ('planned', 'loading', 'en_route', 'completed', 'canceled')) not null default 'planned', "started_at" timestamptz null, "finished_at" timestamptz null, "note" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "trip_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_trip_deleted_at" ON "trip" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "trip_stop" ("id" text not null, "order_id" text not null, "type" text check ("type" in ('delivery', 'return_pickup')) not null default 'delivery', "sequence" integer not null default 0, "status" text check ("status" in ('pending', 'arrived', 'done', 'failed')) not null default 'pending', "address_snapshot" jsonb null, "proof" jsonb null, "checklist" jsonb null, "note" text null, "trip_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "trip_stop_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_trip_stop_trip_id" ON "trip_stop" ("trip_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_trip_stop_deleted_at" ON "trip_stop" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "trip_stop" add constraint "trip_stop_trip_id_foreign" foreign key ("trip_id") references "trip" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "trip_stop" drop constraint if exists "trip_stop_trip_id_foreign";`);

    this.addSql(`drop table if exists "delivery_tariff" cascade;`);

    this.addSql(`drop table if exists "gps_ping" cascade;`);

    this.addSql(`drop table if exists "trip" cascade;`);

    this.addSql(`drop table if exists "trip_stop" cascade;`);
  }

}
