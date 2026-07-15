import { PaymentActions, PaymentSessionStatus } from "@medusajs/framework/utils"
import type { Logger } from "@medusajs/framework/types"
import KaspiPaymentProvider from "../service"
import { KaspiMockClient } from "../kaspi-mock-client"
import { createKaspiClient } from "../create-kaspi-client"

// Unit-тесты провайдера Kaspi на детерминированном моке (без сети, без БД).
// Исход оплаты гоняется через data.kaspi_scenario платёжной сессии — мок
// стателесс (сценарий закодирован в invoice_id). Дизайн — docs/modules/payment-kaspi.md.

const noopLogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {},
} as unknown as Logger

function newProvider(): KaspiPaymentProvider {
  return new KaspiPaymentProvider({ logger: noopLogger }, { mode: "mock" })
}

async function initiate(
  provider: KaspiPaymentProvider,
  scenario?: string,
  amount = 5000
) {
  return provider.initiatePayment({
    amount,
    currency_code: "kzt",
    data: scenario ? { kaspi_scenario: scenario } : {},
  })
}

describe("KaspiPaymentProvider", () => {
  it("initiatePayment creates an invoice with QR and pending status by default", async () => {
    const provider = newProvider()
    const res = await initiate(provider)

    expect(res.id).toMatch(/^kaspi_mock_pending_/)
    expect(res.status).toEqual(PaymentSessionStatus.PENDING)
    const data = res.data as Record<string, unknown>
    expect(data.kaspi_invoice_id).toEqual(res.id)
    expect(data.qr_payload).toContain(res.id)
    expect(data.payment_url).toContain(res.id)
    expect(data.kaspi_state).toEqual("pending")
    expect(data.amount).toEqual(5000)
    expect(data.currency_code).toEqual("kzt")
  })

  it("initiatePayment with scenario 'paid' returns authorized", async () => {
    const res = await initiate(newProvider(), "paid")
    expect(res.status).toEqual(PaymentSessionStatus.AUTHORIZED)
    expect((res.data as Record<string, unknown>).kaspi_state).toEqual("paid")
  })

  it("authorizePayment stays pending until paid, then authorizes", async () => {
    const provider = newProvider()

    const pending = await initiate(provider, "pending")
    const stillPending = await provider.authorizePayment({ data: pending.data })
    expect(stillPending.status).toEqual(PaymentSessionStatus.PENDING)

    const paid = await initiate(provider, "paid")
    const authorized = await provider.authorizePayment({ data: paid.data })
    expect(authorized.status).toEqual(PaymentSessionStatus.AUTHORIZED)
  })

  it("getPaymentStatus reflects the Kaspi invoice state", async () => {
    const provider = newProvider()
    const paid = await initiate(provider, "paid")
    const status = await provider.getPaymentStatus({ data: paid.data })
    expect(status.status).toEqual(PaymentSessionStatus.AUTHORIZED)

    const canceled = await initiate(provider, "canceled")
    const cStatus = await provider.getPaymentStatus({ data: canceled.data })
    expect(cStatus.status).toEqual(PaymentSessionStatus.CANCELED)
  })

  it("capturePayment marks the session captured (QR settlement)", async () => {
    const provider = newProvider()
    const paid = await initiate(provider, "paid")
    const captured = await provider.capturePayment({ data: paid.data })
    expect((captured.data as Record<string, unknown>).captured).toBe(true)
  })

  it("refundPayment records a refund in session data", async () => {
    const provider = newProvider()
    const paid = await initiate(provider, "paid", 5000)
    const refunded = await provider.refundPayment({ amount: 2000, data: paid.data })
    const refunds = (refunded.data as Record<string, unknown>).refunds as Array<{
      amount: unknown
      invoice_id: string
    }>
    expect(refunds).toHaveLength(1)
    expect(refunds[0].amount).toEqual(2000)
    expect(refunds[0].invoice_id).toEqual(paid.id)
  })

  it("cancelPayment marks the invoice canceled", async () => {
    const provider = newProvider()
    const pending = await initiate(provider, "pending")
    const canceled = await provider.cancelPayment({ data: pending.data })
    expect((canceled.data as Record<string, unknown>).kaspi_state).toEqual("canceled")
  })

  it("throws when the session data is missing kaspi_invoice_id", async () => {
    const provider = newProvider()
    await expect(provider.authorizePayment({ data: {} })).rejects.toThrow(
      /kaspi_invoice_id/
    )
  })

  describe("getWebhookActionAndData", () => {
    const provider = newProvider()
    const webhook = (state: string, invoiceId = "kaspi_mock_x_1", amount = 5000) =>
      provider.getWebhookActionAndData({
        data: { invoice_id: invoiceId, state, amount },
        rawData: JSON.stringify({ invoice_id: invoiceId, state, amount }),
        headers: {},
      })

    it("maps paid → authorized with session id and amount", async () => {
      const res = await webhook("paid")
      expect(res.action).toEqual(PaymentActions.AUTHORIZED)
      expect(res.data?.session_id).toEqual("kaspi_mock_x_1")
      expect(res.data?.amount).toEqual(5000)
    })

    it("maps canceled → canceled and error → failed", async () => {
      expect((await webhook("canceled")).action).toEqual(PaymentActions.CANCELED)
      expect((await webhook("error")).action).toEqual(PaymentActions.FAILED)
    })
  })
})

describe("KaspiMockClient", () => {
  const client = new KaspiMockClient()

  it("createInvoice encodes the scenario into a deterministic-status invoice id", async () => {
    const invoice = await client.createInvoice({
      amount: 100,
      currency_code: "kzt",
      scenario: "paid",
    })
    expect(invoice.invoice_id).toMatch(/^kaspi_mock_paid_/)
    expect(invoice.state).toEqual("paid")
    expect(await client.getInvoiceStatus(invoice.invoice_id)).toEqual("paid")
  })

  it("defaults to pending when no scenario is given", async () => {
    const invoice = await client.createInvoice({ amount: 100, currency_code: "kzt" })
    expect(invoice.state).toEqual("pending")
  })

  it("treats an unknown invoice id format as error (desync guard)", async () => {
    expect(await client.getInvoiceStatus("garbage")).toEqual("error")
  })

  it("parseWebhook reads invoice id, state and amount from the payload", () => {
    const event = client.parseWebhook({
      data: { invoice_id: "kaspi_mock_paid_1", state: "paid", amount: 42 },
      rawData: "",
      headers: {},
    })
    expect(event).toEqual({ invoice_id: "kaspi_mock_paid_1", state: "paid", amount: 42 })
  })
})

describe("createKaspiClient", () => {
  it("returns a mock client in mock mode", () => {
    expect(createKaspiClient({ mode: "mock" })).toBeInstanceOf(KaspiMockClient)
  })

  it("throws for live mode until KaspiHttpClient exists (subtask #3)", () => {
    expect(() => createKaspiClient({ mode: "live" })).toThrow(/KaspiHttpClient/)
  })
})
