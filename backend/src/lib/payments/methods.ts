import type {
  KaspiMode,
  SelectablePaymentMethod,
} from "../../modules/order-payment/models/values"

// Какие способы оплаты продавец предлагает покупателю. Чистые функции: их
// вызывают выбор способа на витрине и в чате, проверка перед оформлением
// заказа и экран настроек — правило одно.

// Настройки продавца в той форме, в какой их читают правила (строка модели
// payment_settings или значения по умолчанию).
export type PaymentSettingsView = {
  kaspi_qr_enabled: boolean
  kaspi_mode: KaspiMode
  kaspi_merchant_id: string | null
  has_kaspi_api_key: boolean
  // Постоянный QR магазина (ссылка из него) — Kaspi QR без API.
  kaspi_static_qr_url: string | null
  transfer_enabled: boolean
  transfer_phone: string | null
  transfer_recipient: string | null
  transfer_note: string | null
  debt_enabled: boolean
  debt_max_amount: number | null
  debt_term_days: number
}

// Продавец, который ничего не настраивал, принимает только Kaspi QR — так
// магазин работал до появления способов оплаты.
export const DEFAULT_PAYMENT_SETTINGS: PaymentSettingsView = {
  kaspi_qr_enabled: true,
  kaspi_mode: "mock",
  kaspi_merchant_id: null,
  has_kaspi_api_key: false,
  kaspi_static_qr_url: null,
  transfer_enabled: false,
  transfer_phone: null,
  transfer_recipient: null,
  transfer_note: null,
  debt_enabled: false,
  debt_max_amount: null,
  debt_term_days: 14,
}

type SettingsRow = {
  kaspi_qr_enabled: boolean
  kaspi_mode: KaspiMode
  kaspi_merchant_id: string | null
  kaspi_api_key_cipher: string | null
  kaspi_static_qr_url?: string | null
  transfer_enabled: boolean
  transfer_phone: string | null
  transfer_recipient: string | null
  transfer_note: string | null
  debt_enabled: boolean
  debt_max_amount: unknown
  debt_term_days: number
}

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null
  }
  if (typeof value === "object" && "numeric" in (value as object)) {
    return toNumber((value as { numeric: unknown }).numeric)
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

export const settingsView = (row: SettingsRow | null): PaymentSettingsView =>
  row
    ? {
        kaspi_qr_enabled: row.kaspi_qr_enabled,
        kaspi_mode: row.kaspi_mode,
        kaspi_merchant_id: row.kaspi_merchant_id,
        has_kaspi_api_key: !!row.kaspi_api_key_cipher,
        kaspi_static_qr_url: row.kaspi_static_qr_url?.trim() || null,
        transfer_enabled: row.transfer_enabled,
        transfer_phone: row.transfer_phone,
        transfer_recipient: row.transfer_recipient,
        transfer_note: row.transfer_note,
        debt_enabled: row.debt_enabled,
        debt_max_amount: toNumber(row.debt_max_amount),
        debt_term_days: row.debt_term_days,
      }
    : DEFAULT_PAYMENT_SETTINGS

// Почему способ сейчас недоступен — код для клиента, текст рисует он сам.
export type PaymentMethodUnavailable =
  | "disabled"
  | "kaspi_not_connected"
  | "transfer_no_phone"
  | "debt_over_limit"

export type PaymentMethodOption = {
  method: SelectablePaymentMethod
  available: boolean
  reason: PaymentMethodUnavailable | null
}

// Принять оплату Kaspi QR можно на стенде (KASPI_MODE=mock в окружении — счёт
// всегда тестовый, см. kaspiModeFor) или в рабочем режиме с ключами продавца:
// тестовый счёт в рабочем окружении никто не оплатит.
const kaspiReady = (settings: PaymentSettingsView, envMode: string | undefined) =>
  envMode === "mock" ||
  !!kaspiStaticQrUrl(settings) ||
  (settings.kaspi_mode === "live" &&
    !!settings.kaspi_merchant_id &&
    settings.has_kaspi_api_key)

// Kaspi QR продавца работает через его постоянный QR (без API Kaspi): ссылка
// задана, а рабочих ключей API нет. Ключи есть — счёт через API (сумма в нём,
// оплату подтверждает банк); иначе постоянный QR сильнее тестового режима
// стенда: это настоящий QR магазина, деньги по нему настоящие.
export const kaspiStaticQrUrl = (
  settings: Pick<
    PaymentSettingsView,
    "kaspi_static_qr_url" | "kaspi_mode" | "kaspi_merchant_id" | "has_kaspi_api_key"
  >
): string | null =>
  settings.kaspi_static_qr_url &&
  !(settings.kaspi_mode === "live" && settings.kaspi_merchant_id && settings.has_kaspi_api_key)
    ? settings.kaspi_static_qr_url
    : null

// Ссылка постоянного Kaspi QR — только https на домене Kaspi: её покупатель
// открывает, чтобы заплатить, подменить её на чужую страницу нельзя.
export const isKaspiQrUrl = (value: string): boolean => {
  try {
    const url = new URL(value.trim())
    return (
      url.protocol === "https:" &&
      (url.hostname === "kaspi.kz" || url.hostname.endsWith(".kaspi.kz"))
    )
  } catch {
    return false
  }
}

// Режим Kaspi для продавца. KASPI_MODE=mock в окружении (стенд, разработка)
// сильнее настройки продавца: на стенде настоящих денег не бывает, даже если
// кто-то ввёл рабочие ключи.
export const kaspiModeFor = (
  settings: Pick<PaymentSettingsView, "kaspi_mode">,
  envMode: string | undefined
): KaspiMode => (envMode === "mock" ? "mock" : settings.kaspi_mode)

export const paymentMethodOptions = (
  settings: PaymentSettingsView,
  amount: number,
  envMode: string | undefined = process.env.KASPI_MODE
): PaymentMethodOption[] => {
  const option = (
    method: SelectablePaymentMethod,
    reason: PaymentMethodUnavailable | null
  ): PaymentMethodOption => ({ method, available: !reason, reason })

  return [
    option(
      "kaspi_qr",
      !settings.kaspi_qr_enabled
        ? "disabled"
        : !kaspiReady(settings, envMode)
        ? "kaspi_not_connected"
        : null
    ),
    option(
      "kaspi_transfer",
      !settings.transfer_enabled
        ? "disabled"
        : !settings.transfer_phone?.trim()
        ? "transfer_no_phone"
        : null
    ),
    option(
      "debt",
      !settings.debt_enabled
        ? "disabled"
        : settings.debt_max_amount !== null && amount > settings.debt_max_amount
        ? "debt_over_limit"
        : null
    ),
  ]
}

// Способ доступен — null, иначе причина.
export const paymentMethodUnavailable = (
  settings: PaymentSettingsView,
  method: SelectablePaymentMethod,
  amount: number,
  envMode: string | undefined = process.env.KASPI_MODE
): PaymentMethodUnavailable | null => {
  const option = paymentMethodOptions(settings, amount, envMode).find(
    (candidate) => candidate.method === method
  )
  return option ? option.reason : "disabled"
}

// Реквизиты перевода, которые видит покупатель: номер, получатель, пояснение.
export type TransferDetails = {
  phone: string
  recipient: string | null
  note: string | null
}

export const transferDetails = (
  settings: PaymentSettingsView
): TransferDetails | null =>
  settings.transfer_enabled && settings.transfer_phone?.trim()
    ? {
        phone: settings.transfer_phone.trim(),
        recipient: settings.transfer_recipient?.trim() || null,
        note: settings.transfer_note?.trim() || null,
      }
    : null
