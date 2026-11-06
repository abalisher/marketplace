import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { ORDER_PAYMENT_MODULE } from "../../../modules/order-payment"
import OrderPaymentModuleService from "../../../modules/order-payment/service"
import type { KaspiMode } from "../../../modules/order-payment/models/values"
import { normalizePhone } from "../../../modules/auth-phone/normalize-phone"
import { encryptSecret } from "../../../lib/onec/secret"
import { DEFAULT_PAYMENT_SETTINGS, isKaspiQrUrl } from "../../../lib/payments/methods"

// Частичная правка способов оплаты продавца. Ключи Kaspi приходят открытым
// текстом и сразу шифруются; пустая строка или null — стереть ключ, отсутствие
// поля — оставить сохранённый (экран ключей не получает).
export type UpsertPaymentSettingsStepInput = {
  sales_channel_id: string
  kaspi_qr_enabled?: boolean
  kaspi_mode?: KaspiMode
  kaspi_merchant_id?: string | null
  kaspi_api_key?: string | null
  kaspi_webhook_secret?: string | null
  kaspi_static_qr_url?: string | null
  transfer_enabled?: boolean
  transfer_phone?: string | null
  transfer_recipient?: string | null
  transfer_note?: string | null
  debt_enabled?: boolean
  debt_max_amount?: number | null
  debt_term_days?: number
}

const SNAPSHOT_FIELDS = [
  "kaspi_qr_enabled",
  "kaspi_mode",
  "kaspi_merchant_id",
  "kaspi_api_key_cipher",
  "kaspi_webhook_secret_cipher",
  "kaspi_static_qr_url",
  "transfer_enabled",
  "transfer_phone",
  "transfer_recipient",
  "transfer_note",
  "debt_enabled",
  "debt_max_amount",
  "debt_term_days",
] as const

const text = (value: string | null | undefined) =>
  value === undefined ? undefined : value?.trim() || null

const secret = (value: string | null | undefined) =>
  value === undefined ? undefined : value?.trim() ? encryptSecret(value.trim()) : null

export const upsertPaymentSettingsStep = createStep(
  "upsert-payment-settings",
  async (input: UpsertPaymentSettingsStepInput, { container }) => {
    const service = container.resolve<OrderPaymentModuleService>(ORDER_PAYMENT_MODULE)
    const existing = await service.getSettingsByChannel(input.sales_channel_id)

    const staticQr = text(input.kaspi_static_qr_url)
    if (staticQr && !isKaspiQrUrl(staticQr)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Ссылка Kaspi QR — та, что зашита в QR магазина: https://…kaspi.kz/…"
      )
    }

    let phone = text(input.transfer_phone)
    if (phone) {
      const normalized = normalizePhone(phone)
      if (!normalized) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Номер Kaspi для перевода — мобильный номер Казахстана, например +7 701 234 56 78"
        )
      }
      phone = normalized
    }

    const fields: Record<string, unknown> = Object.fromEntries(
      Object.entries({
        kaspi_qr_enabled: input.kaspi_qr_enabled,
        kaspi_mode: input.kaspi_mode,
        kaspi_merchant_id: text(input.kaspi_merchant_id),
        kaspi_api_key_cipher: secret(input.kaspi_api_key),
        kaspi_webhook_secret_cipher: secret(input.kaspi_webhook_secret),
        kaspi_static_qr_url: staticQr,
        transfer_enabled: input.transfer_enabled,
        transfer_phone: phone,
        transfer_recipient: text(input.transfer_recipient),
        transfer_note: text(input.transfer_note),
        debt_enabled: input.debt_enabled,
        debt_max_amount: input.debt_max_amount,
        debt_term_days: input.debt_term_days,
      }).filter(([, value]) => value !== undefined)
    )

    // Итог правки целиком — проверяем согласованность уже его.
    const merged: Record<string, unknown> = {
      ...DEFAULT_PAYMENT_SETTINGS,
      ...(existing ?? {}),
      ...fields,
    }
    if (merged.transfer_enabled && !merged.transfer_phone) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Чтобы принимать перевод, укажите номер Kaspi, на который переводить"
      )
    }
    if (
      merged.kaspi_mode === "live" &&
      // QR магазина без ключей — уже настоящие деньги: «рабочий» ему не мешает.
      !merged.kaspi_static_qr_url &&
      (!merged.kaspi_merchant_id || !merged.kaspi_api_key_cipher)
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Рабочий режим Kaspi включается с ключами от Kaspi: укажите ID мерчанта и ключ API"
      )
    }

    if (!existing) {
      const created = await service.createPaymentSettings({
        sales_channel_id: input.sales_channel_id,
        ...fields,
      })
      return new StepResponse(created, { created_id: created.id } as {
        created_id?: string
        previous?: Record<string, unknown>
      })
    }

    const previous = Object.fromEntries(
      SNAPSHOT_FIELDS.map((key) => [key, (existing as Record<string, unknown>)[key]])
    )
    const updated = await service.updatePaymentSettings({ id: existing.id, ...fields })
    return new StepResponse(updated, {
      previous: { id: existing.id, ...previous },
    } as { created_id?: string; previous?: Record<string, unknown> })
  },
  async (undo, { container }) => {
    if (!undo) {
      return
    }
    const service = container.resolve<OrderPaymentModuleService>(ORDER_PAYMENT_MODULE)
    if (undo.created_id) {
      await service.deletePaymentSettings(undo.created_id)
    } else if (undo.previous) {
      await service.updatePaymentSettings(undo.previous as { id: string })
    }
  }
)
