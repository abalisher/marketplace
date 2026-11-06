import {
  DEFAULT_PAYMENT_SETTINGS,
  isKaspiQrUrl,
  kaspiStaticQrUrl,
  kaspiModeFor,
  paymentMethodOptions,
  paymentMethodUnavailable,
  PaymentSettingsView,
  settingsView,
  transferDetails,
} from "../methods"
import { methodByProvider, METHOD_PROVIDER } from "../providers"

const settings = (patch: Partial<PaymentSettingsView> = {}): PaymentSettingsView => ({
  ...DEFAULT_PAYMENT_SETTINGS,
  ...patch,
})

describe("способы оплаты продавца", () => {
  it("продавец без настроек принимает только Kaspi QR (как до способов оплаты)", () => {
    expect(settingsView(null)).toEqual(DEFAULT_PAYMENT_SETTINGS)
    expect(
      paymentMethodOptions(settings(), 50_000, "mock").map((o) => [o.method, o.available])
    ).toEqual([
      ["kaspi_qr", true],
      ["kaspi_transfer", false],
      ["debt", false],
    ])
  })

  it("перевод доступен только с номером", () => {
    expect(
      paymentMethodUnavailable(settings({ transfer_enabled: true }), "kaspi_transfer", 1000, "mock")
    ).toBe("transfer_no_phone")
    expect(
      paymentMethodUnavailable(
        settings({ transfer_enabled: true, transfer_phone: "+77011234567" }),
        "kaspi_transfer",
        1000,
        "mock"
      )
    ).toBeNull()
  })

  it("в долг — в пределах лимита продавца; без лимита — любая сумма", () => {
    const limited = settings({ debt_enabled: true, debt_max_amount: 100_000 })
    expect(paymentMethodUnavailable(limited, "debt", 100_000, "mock")).toBeNull()
    expect(paymentMethodUnavailable(limited, "debt", 100_001, "mock")).toBe("debt_over_limit")
    expect(
      paymentMethodUnavailable(settings({ debt_enabled: true }), "debt", 9_000_000, "mock")
    ).toBeNull()
    expect(paymentMethodUnavailable(settings(), "debt", 1, "mock")).toBe("disabled")
  })

  it("на стенде Kaspi всегда тестовый; в рабочем окружении нужен ключ продавца", () => {
    expect(kaspiModeFor({ kaspi_mode: "live" }, "mock")).toBe("mock")
    expect(kaspiModeFor({ kaspi_mode: "live" }, "live")).toBe("live")
    expect(paymentMethodUnavailable(settings(), "kaspi_qr", 1, "mock")).toBeNull()
    expect(paymentMethodUnavailable(settings(), "kaspi_qr", 1, "live")).toBe(
      "kaspi_not_connected"
    )
    expect(
      paymentMethodUnavailable(
        settings({ kaspi_mode: "live", kaspi_merchant_id: "M1", has_kaspi_api_key: true }),
        "kaspi_qr",
        1,
        "live"
      )
    ).toBeNull()
    expect(
      paymentMethodUnavailable(settings({ kaspi_qr_enabled: false }), "kaspi_qr", 1, "mock")
    ).toBe("disabled")
  })

  it("реквизиты перевода — только когда перевод включён и номер задан", () => {
    expect(transferDetails(settings({ transfer_phone: "+77011234567" }))).toBeNull()
    expect(
      transferDetails(
        settings({
          transfer_enabled: true,
          transfer_phone: " +77011234567 ",
          transfer_recipient: " Нурлан Б. ",
          transfer_note: "",
        })
      )
    ).toEqual({ phone: "+77011234567", recipient: "Нурлан Б.", note: null })
  })

  it("строка настроек: ключ наружу не уходит, лимит — числом", () => {
    const view = settingsView({
      kaspi_qr_enabled: true,
      kaspi_mode: "live",
      kaspi_merchant_id: "M1",
      kaspi_api_key_cipher: "v1:secret",
      transfer_enabled: false,
      transfer_phone: null,
      transfer_recipient: null,
      transfer_note: null,
      debt_enabled: true,
      debt_max_amount: { numeric: 250000 },
      debt_term_days: 30,
    })
    expect(view.has_kaspi_api_key).toBe(true)
    expect(JSON.stringify(view)).not.toContain("v1:secret")
    expect(view.debt_max_amount).toBe(250000)
  })

  it("способ ↔ провайдер ядра; системный провайдер способом не считается", () => {
    expect(methodByProvider(METHOD_PROVIDER.kaspi_transfer)).toBe("kaspi_transfer")
    expect(methodByProvider(METHOD_PROVIDER.debt)).toBe("debt")
    expect(methodByProvider("pp_kaspi_kaspi")).toBe("kaspi_qr")
    expect(methodByProvider("pp_system_default")).toBeNull()
    expect(methodByProvider(undefined)).toBeNull()
  })
})

describe("постоянный Kaspi QR магазина", () => {
  const url = "https://pay.kaspi.kz/pay/abc123"

  it("задан — Kaspi QR доступен и в рабочем окружении без ключей API", () => {
    const view = settings({ kaspi_static_qr_url: url })
    expect(paymentMethodUnavailable(view, "kaspi_qr", 1, "live")).toBeNull()
    expect(kaspiStaticQrUrl(view)).toBe(url)
  })

  it("рабочие ключи API сильнее постоянного QR", () => {
    expect(
      kaspiStaticQrUrl(
        settings({
          kaspi_static_qr_url: url,
          kaspi_mode: "live",
          kaspi_merchant_id: "M1",
          has_kaspi_api_key: true,
        })
      )
    ).toBeNull()
  })

  it("ссылка — только https на домене Kaspi", () => {
    expect(isKaspiQrUrl(url)).toBe(true)
    expect(isKaspiQrUrl("https://kaspi.kz/pay/x")).toBe(true)
    expect(isKaspiQrUrl("http://pay.kaspi.kz/pay/x")).toBe(false)
    expect(isKaspiQrUrl("https://kaspi.kz.evil.com/pay")).toBe(false)
    expect(isKaspiQrUrl("не ссылка")).toBe(false)
  })
})
