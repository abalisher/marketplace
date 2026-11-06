import { model } from "@medusajs/framework/utils"

export const TENANT_STATUSES = ["active", "suspended"] as const
export type TenantStatus = (typeof TENANT_STATUSES)[number]

// Компания-продавец на площадке (мультипродавец). Своего склада, ключа витрины и
// цены доставки в модели нет: всё это — ядровые сущности её канала продаж.
// Канал ↔ склады — ядровая связь sales_channel_stock_location, канал ↔
// publishable key — publishable_api_key_sales_channel, доставка — shipping
// option на складе компании (см. src/lib/tenants). Модель держит только то,
// чего в ядре нет: витринные данные и реквизиты для документов.
//
// sales_channel_id — внешний id ядра, как order.sales_channel_id у самого
// ядра: по нему компания находится из заказа, корзины и publishable key.
// Уникален — один канал принадлежит ровно одной компании.
//
// Платёжных ключей Kaspi в модели нет: способы оплаты и ключи Kaspi продавца
// живут в настройках оплаты его канала (модуль order_payment) — деньги идут на
// счёт продавца (решение владельца 2026-10-27).
const Tenant = model.define("tenant", {
  id: model.id({ prefix: "ten" }).primaryKey(),
  name: model.text(),
  slug: model.text().unique(),
  // Код компании в номере заказа: «ORG» → ORG-26-0007. Пусто — код площадки.
  order_prefix: model.text().nullable(),
  status: model.enum([...TENANT_STATUSES]).default("active"),
  sales_channel_id: model.text().unique(),
  logo_url: model.text().nullable(),
  phone: model.text().nullable(),
  email: model.text().nullable(),
  // Реквизиты продавца в счёте, накладной и акте (см. lib/tenants/requisites.ts).
  bin: model.text().nullable(),
  address: model.text().nullable(),
  bank_name: model.text().nullable(),
  bank_bik: model.text().nullable(),
  bank_iban: model.text().nullable(),
  bank_kbe: model.text().default("17"),
  bank_knp: model.text().default("710"),
  director_name: model.text().nullable(),
  // Ставка НДС продавца, % (16 — базовая по НК РК 2026). Пусто — не плательщик
  // НДС: документы печатают «не облагается». Цены — с НДС, документ выделяет
  // его из суммы.
  vat_rate: model.number().nullable(),
  footer_note: model.text().nullable(),
})

export default Tenant
