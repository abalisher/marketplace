import { model } from "@medusajs/framework/utils"
import { KASPI_MODES } from "./values"

// Способы оплаты продавца. Ключ — канал продаж: продавец заказа и корзины —
// это её канал (компания или сама площадка), так что настройки находятся из
// корзины без поиска компании. Строки нет — действуют значения по умолчанию
// (только Kaspi QR, см. lib/payments/methods.ts).
//
// Деньги идут на счёт продавца (решение владельца 2026-10-27), поэтому ключи
// Kaspi — у каждого продавца свои. Ключи лежат шифром (lib/onec/secret.ts) и
// наружу не отдаются: экран знает только, заданы ли они.
const PaymentSettings = model.define("payment_settings", {
  id: model.id({ prefix: "payset" }).primaryKey(),
  sales_channel_id: model.text().unique(),

  // Kaspi QR: счёт на сумму заказа, оплату подтверждает банк.
  kaspi_qr_enabled: model.boolean().default(true),
  kaspi_mode: model.enum([...KASPI_MODES]).default("mock"),
  kaspi_merchant_id: model.text().nullable(),
  kaspi_api_key_cipher: model.text().nullable(),
  kaspi_webhook_secret_cipher: model.text().nullable(),
  // Постоянный Kaspi QR магазина (наклейка из Kaspi Pay) — ссылка, зашитая в
  // QR. Без API Kaspi: покупатель сканирует QR или открывает ссылку на
  // телефоне, сумму вводит сам; оплату подтверждают чек и продавец. Задан и
  // нет рабочих ключей API — Kaspi QR этого продавца работает так.
  kaspi_static_qr_url: model.text().nullable(),

  // Перевод по номеру Kaspi: покупатель переводит сам, продавец отмечает
  // поступление.
  transfer_enabled: model.boolean().default(false),
  transfer_phone: model.text().nullable(),
  // Имя получателя, как его покажет Kaspi при переводе («Нурлан Б.»): по нему
  // покупатель убеждается, что переводит туда.
  transfer_recipient: model.text().nullable(),
  transfer_note: model.text().nullable(),

  // В долг: покупатель просит, продавец решает при подтверждении заказа.
  debt_enabled: model.boolean().default(false),
  // Наибольшая сумма заказа в долг; null — без ограничения.
  debt_max_amount: model.bigNumber().nullable(),
  // Срок погашения по умолчанию (дней от одобрения).
  debt_term_days: model.number().default(14),
})

export default PaymentSettings
