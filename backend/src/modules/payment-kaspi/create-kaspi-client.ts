import { randomBytes } from "crypto"
import { MedusaError } from "@medusajs/framework/utils"
import type { KaspiClient } from "./types"
import { KaspiMockClient } from "./kaspi-mock-client"
import { KaspiHttpClient } from "./kaspi-http-client"

// Опции провайдера (из medusa-config.ts) + env. Секреты — только через env.
export interface KaspiProviderOptions {
  mode?: "mock" | "live"
  merchant_id?: string
  api_key?: string
  base_url?: string
  webhook_secret?: string
}

// Выбор транспорта: явный `mode` из опций → env `KASPI_MODE` → авто (live, если
// заданы ключи мерчанта, иначе mock). Так оформление и тесты не зависят от
// наличия реального договора эквайринга (публичной песочницы Kaspi нет).
export function resolveMode(
  options: KaspiProviderOptions = {}
): "mock" | "live" {
  const explicit = options.mode ?? (process.env.KASPI_MODE as "mock" | "live" | undefined)
  if (explicit === "mock" || explicit === "live") {
    return explicit
  }
  const hasKeys = Boolean(
    (options.merchant_id ?? process.env.KASPI_MERCHANT_ID) &&
      (options.api_key ?? process.env.KASPI_API_KEY)
  )
  return hasKeys ? "live" : "mock"
}

export function createKaspiClient(options: KaspiProviderOptions = {}): KaspiClient {
  const mode = resolveMode(options)
  if (mode === "live") {
    return createLiveClient(options)
  }
  return new KaspiMockClient()
}

// Клиент площадки по умолчанию: в рабочем режиме он есть, только если в
// окружении заданы ключи площадки. Деньги идут на счёт продавца (решение
// владельца 2026-10-27), поэтому рабочий Kaspi без ключей площадки — норма:
// счёт выставляется ключами продавца (createSellerKaspiClient), а не падением
// процесса при старте.
export function createDefaultKaspiClient(
  options: KaspiProviderOptions = {}
): KaspiClient | null {
  if (resolveMode(options) === "mock") {
    return new KaspiMockClient()
  }
  const hasPlatformKeys = Boolean(
    (options.merchant_id ?? process.env.KASPI_MERCHANT_ID) &&
      (options.api_key ?? process.env.KASPI_API_KEY)
  )
  return hasPlatformKeys ? createLiveClient(options) : null
}

// Ключи Kaspi продавца (настройки оплаты его канала, расшифрованные). Адрес
// API — общий для всех продавцов, из окружения.
export type SellerKaspiCredentials = {
  merchant_id: string
  api_key: string
  webhook_secret: string | null
}

export function createSellerKaspiClient(
  credentials: SellerKaspiCredentials
): KaspiClient {
  return createLiveClient({
    merchant_id: credentials.merchant_id,
    api_key: credentials.api_key,
    // Секрета нет — webhook продавца не принимается вовсе: случайный ключ не
    // сойдётся ни с одной подписью, и статус оплаты узнаётся только опросом.
    webhook_secret: credentials.webhook_secret || randomBytes(32).toString("hex"),
  })
}

// Живой транспорт: конфигурация обязана быть полной — молча уходить в мок при
// KASPI_MODE=live нельзя (это «оплата», а не dev-заглушка). Webhook-секрет тоже
// обязателен: без проверки подписи webhook менял бы статус денег кому угодно.
function createLiveClient(options: KaspiProviderOptions): KaspiClient {
  const config = {
    base_url: options.base_url ?? process.env.KASPI_API_URL,
    merchant_id: options.merchant_id ?? process.env.KASPI_MERCHANT_ID,
    api_key: options.api_key ?? process.env.KASPI_API_KEY,
    webhook_secret: options.webhook_secret ?? process.env.KASPI_WEBHOOK_SECRET,
  }
  const missing = Object.entries({
    KASPI_API_URL: config.base_url,
    KASPI_MERCHANT_ID: config.merchant_id,
    KASPI_API_KEY: config.api_key,
    KASPI_WEBHOOK_SECRET: config.webhook_secret,
  })
    .filter(([, value]) => !value)
    .map(([name]) => name)
  if (missing.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_ARGUMENT,
      `KASPI_MODE=live requires: ${missing.join(", ")} (see backend/.env.example)`
    )
  }
  return new KaspiHttpClient({
    base_url: config.base_url!,
    merchant_id: config.merchant_id!,
    api_key: config.api_key!,
    webhook_secret: config.webhook_secret!,
  })
}
