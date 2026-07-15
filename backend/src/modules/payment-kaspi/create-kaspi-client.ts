import { MedusaError } from "@medusajs/framework/utils"
import type { KaspiClient } from "./types"
import { KaspiMockClient } from "./kaspi-mock-client"

// Опции провайдера (из medusa-config.ts) + env. Секреты — только через env.
export interface KaspiProviderOptions {
  mode?: "mock" | "live"
  merchant_id?: string
  api_key?: string
}

// Выбор транспорта: явный `mode` из опций → env `KASPI_MODE` → авто (live, если
// заданы ключи мерчанта, иначе mock). Так оформление и тесты не зависят от
// наличия реального договора эквайринга (публичной песочницы Kaspi нет).
function resolveMode(options: KaspiProviderOptions): "mock" | "live" {
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
    // Живой транспорт KaspiHttpClient — подзадача №3 (порт флоу tapter-dev за
    // адаптером). Пока честно сообщаем, а не молча уходим в мок.
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "KASPI_MODE=live requested, but KaspiHttpClient is not implemented yet (payment-kaspi subtask #3). Use KASPI_MODE=mock."
    )
  }
  return new KaspiMockClient()
}
