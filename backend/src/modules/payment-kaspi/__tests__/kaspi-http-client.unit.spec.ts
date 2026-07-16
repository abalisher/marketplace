import { createHmac } from "crypto"
import {
  KaspiHttpClient,
  mapKaspiStatus,
  type KaspiFetch,
  type KaspiHttpResponse,
} from "../kaspi-http-client"
import { createKaspiClient } from "../create-kaspi-client"
import { KaspiMockClient } from "../kaspi-mock-client"

// Unit-тесты живого транспорта Kaspi НА МОКАХ HTTP: fetch инжектируется фейком,
// сеть не задействована (решение — DECISIONS, payment-kaspi подзадача 3).
// Формат запросов/ответов — по референсу tapter-dev (docs/modules/payment-kaspi.md).

const OPTIONS = {
  base_url: "https://kaspi-bridge.example.kz",
  merchant_id: "merchant-1",
  api_key: "api-key-1",
  webhook_secret: "webhook-secret-1",
}

interface RecordedCall {
  url: string
  method: string
  headers: Record<string, string>
  body?: unknown
}

// Фейковый fetch: записывает вызовы, отдаёт заранее заданные ответы по порядку.
function fakeFetch(responses: Array<{ status?: number; body: unknown }>) {
  const calls: RecordedCall[] = []
  const fetchImpl: KaspiFetch = async (url, init) => {
    calls.push({
      url,
      method: init.method,
      headers: init.headers,
      body: init.body !== undefined ? JSON.parse(init.body) : undefined,
    })
    const next = responses[Math.min(calls.length - 1, responses.length - 1)]
    const status = next.status ?? 200
    const response: KaspiHttpResponse = {
      ok: status >= 200 && status < 300,
      status,
      json: async () => next.body,
    }
    return response
  }
  return { calls, fetchImpl }
}

function okEnvelope(data: Record<string, unknown>) {
  return { StatusCode: 0, Data: data }
}

function newClient(responses: Array<{ status?: number; body: unknown }>) {
  const { calls, fetchImpl } = fakeFetch(responses)
  return { calls, client: new KaspiHttpClient({ ...OPTIONS, fetch: fetchImpl }) }
}

function sign(rawBody: string, secret = OPTIONS.webhook_secret): string {
  return `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`
}

describe("KaspiHttpClient", () => {
  describe("createInvoice", () => {
    it("POSTs /api/qr/create with auth headers and maps the QR response", async () => {
      const { calls, client } = newClient([
        {
          body: okEnvelope({
            QrOperationId: 789012,
            QrToken: "https://pay.kaspi.kz/pay/abc",
            ExpireDate: "2026-07-16T12:05:00",
          }),
        },
      ])
      const invoice = await client.createInvoice({
        amount: 5000,
        currency_code: "kzt",
        reference: "cart_123",
      })

      expect(calls).toHaveLength(1)
      expect(calls[0].url).toEqual("https://kaspi-bridge.example.kz/api/qr/create")
      expect(calls[0].method).toEqual("POST")
      expect(calls[0].headers["x-token-sn"]).toEqual("merchant-1")
      expect(calls[0].headers["x-profile-id"]).toEqual("merchant-1")
      expect(calls[0].headers["x-vtoken-secret"]).toEqual("api-key-1")
      expect(calls[0].body).toEqual({ amount: 5000, comment: "cart_123" })

      expect(invoice).toEqual({
        invoice_id: "789012",
        qr_payload: "https://pay.kaspi.kz/pay/abc",
        payment_url: "https://pay.kaspi.kz/pay/abc",
        state: "pending",
        amount: 5000,
        currency_code: "kzt",
      })
    })

    it("normalizes BigNumber-like amounts to plain numbers", async () => {
      const { calls, client } = newClient([
        { body: okEnvelope({ QrOperationId: 1, QrToken: "https://pay.kaspi.kz/1" }) },
      ])
      await client.createInvoice({ amount: { value: "4500" }, currency_code: "kzt" })
      expect((calls[0].body as Record<string, unknown>).amount).toEqual(4500)
    })

    it("throws when the response is missing QrOperationId/QrToken", async () => {
      const { client } = newClient([{ body: okEnvelope({}) }])
      await expect(
        client.createInvoice({ amount: 100, currency_code: "kzt" })
      ).rejects.toThrow(/QrOperationId/)
    })
  })

  describe("getInvoiceStatus", () => {
    it("GETs /api/qr/status with the operation id in the query", async () => {
      const { calls, client } = newClient([{ body: okEnvelope({ Status: "Processed" }) }])
      const state = await client.getInvoiceStatus("789012")
      expect(calls[0].url).toEqual(
        "https://kaspi-bridge.example.kz/api/qr/status?qrOperationId=789012"
      )
      expect(calls[0].method).toEqual("GET")
      expect(state).toEqual("paid")
    })
  })

  describe("refund", () => {
    it("POSTs /api/refund/create and returns the refund result", async () => {
      const { calls, client } = newClient([
        { body: okEnvelope({ ReturnOperationId: 555 }) },
      ])
      const result = await client.refund("789012", 2000)
      expect(calls[0].url).toEqual("https://kaspi-bridge.example.kz/api/refund/create")
      expect(calls[0].body).toEqual({ qrOperationId: 789012, returnAmount: 2000 })
      expect(result).toEqual({ refund_id: "555", invoice_id: "789012", amount: 2000 })
    })

    it("generates a traceable refund id when the response has none", async () => {
      const { client } = newClient([{ body: okEnvelope({}) }])
      const result = await client.refund("789012", 2000)
      expect(result.refund_id).toMatch(/^kaspi_refund_/)
    })
  })

  describe("cancel", () => {
    it("POSTs /api/invoice/cancel with the operation id", async () => {
      const { calls, client } = newClient([{ body: okEnvelope({}) }])
      await client.cancel("789012")
      expect(calls[0].url).toEqual("https://kaspi-bridge.example.kz/api/invoice/cancel")
      expect(calls[0].body).toEqual({ operationId: "789012" })
    })
  })

  describe("error handling", () => {
    it("throws on non-2xx HTTP responses", async () => {
      const { client } = newClient([{ status: 502, body: {} }])
      await expect(client.getInvoiceStatus("1")).rejects.toThrow(/HTTP 502/)
    })

    it("throws on a non-zero StatusCode with the acquirer message", async () => {
      const { client } = newClient([
        { body: { StatusCode: -1404, Message: "Operation not found" } },
      ])
      await expect(client.getInvoiceStatus("1")).rejects.toThrow(
        /StatusCode -1404: Operation not found/
      )
    })
  })

  describe("parseWebhook", () => {
    const webhookBody = {
      event: "payment.success",
      paymentId: "789012",
      type: "qr",
      status: "Processed",
      amount: 5000,
    }

    function payload(body: unknown, headers?: Record<string, unknown>) {
      const raw = JSON.stringify(body)
      return {
        data: body as Record<string, unknown>,
        rawData: raw,
        headers: headers ?? { "X-Webhook-Signature": sign(raw) },
      }
    }

    it("accepts a correctly signed webhook and maps it to a domain event", () => {
      const { client } = newClient([])
      expect(client.parseWebhook(payload(webhookBody))).toEqual({
        invoice_id: "789012",
        state: "paid",
        amount: 5000,
      })
    })

    it("rejects a webhook without a signature header", () => {
      const { client } = newClient([])
      expect(() => client.parseWebhook(payload(webhookBody, {}))).toThrow(
        /X-Webhook-Signature/
      )
    })

    it("rejects a webhook whose body does not match the signature", () => {
      const { client } = newClient([])
      const tampered = payload(webhookBody)
      tampered.rawData = JSON.stringify({ ...webhookBody, amount: 999999 })
      expect(() => client.parseWebhook(tampered)).toThrow(/signature verification/)
    })

    it("rejects a webhook signed with a different secret", () => {
      const { client } = newClient([])
      const raw = JSON.stringify(webhookBody)
      const forged = {
        data: webhookBody as Record<string, unknown>,
        rawData: raw,
        headers: { "x-webhook-signature": sign(raw, "other-secret") },
      }
      expect(() => client.parseWebhook(forged)).toThrow(/signature verification/)
    })

    it("maps the raw Kaspi status first, falling back to the event name", () => {
      const { client } = newClient([])
      const canceled = { ...webhookBody, event: "payment.failed", status: "CancelledByUser" }
      expect(client.parseWebhook(payload(canceled)).state).toEqual("canceled")

      const noStatus = { ...webhookBody, event: "payment.expired", status: "UnknownNew" }
      expect(client.parseWebhook(payload(noStatus)).state).toEqual("canceled")
    })

    it("throws when paymentId is missing", () => {
      const { client } = newClient([])
      const body = { event: "payment.success", status: "Processed" }
      expect(() => client.parseWebhook(payload(body))).toThrow(/paymentId/)
    })
  })
})

describe("mapKaspiStatus", () => {
  it("counts money only on an explicit Processed", () => {
    expect(mapKaspiStatus("Processed")).toEqual("paid")
  })

  it("maps expiry/cancellation and rejection/error statuses", () => {
    for (const status of ["Expired", "QrTokenDiscarded", "CancelledByUser", "RemotePaymentCanceled"]) {
      expect(mapKaspiStatus(status)).toEqual("canceled")
    }
    for (const status of ["Rejected", "RemotePaymentRejected", "Error"]) {
      expect(mapKaspiStatus(status)).toEqual("error")
    }
  })

  it("treats unknown statuses as pending (keep polling, never authorize)", () => {
    expect(mapKaspiStatus("RemotePaymentCreated")).toEqual("pending")
    expect(mapKaspiStatus("SomethingNew")).toEqual("pending")
  })
})

describe("createKaspiClient (live mode)", () => {
  const KASPI_ENV = [
    "KASPI_MODE",
    "KASPI_API_URL",
    "KASPI_MERCHANT_ID",
    "KASPI_API_KEY",
    "KASPI_WEBHOOK_SECRET",
  ] as const
  let savedEnv: Record<string, string | undefined>

  beforeEach(() => {
    savedEnv = {}
    for (const name of KASPI_ENV) {
      savedEnv[name] = process.env[name]
      delete process.env[name]
    }
  })

  afterEach(() => {
    for (const name of KASPI_ENV) {
      if (savedEnv[name] === undefined) {
        delete process.env[name]
      } else {
        process.env[name] = savedEnv[name]
      }
    }
  })

  it("builds a KaspiHttpClient when the live config is complete", () => {
    const client = createKaspiClient({ mode: "live", ...OPTIONS })
    expect(client).toBeInstanceOf(KaspiHttpClient)
  })

  it("reads the live config from KASPI_* env vars", () => {
    process.env.KASPI_MODE = "live"
    process.env.KASPI_API_URL = OPTIONS.base_url
    process.env.KASPI_MERCHANT_ID = OPTIONS.merchant_id
    process.env.KASPI_API_KEY = OPTIONS.api_key
    process.env.KASPI_WEBHOOK_SECRET = OPTIONS.webhook_secret
    expect(createKaspiClient()).toBeInstanceOf(KaspiHttpClient)
  })

  it("lists every missing variable instead of silently falling back to mock", () => {
    expect(() => createKaspiClient({ mode: "live", base_url: OPTIONS.base_url })).toThrow(
      /KASPI_MERCHANT_ID, KASPI_API_KEY, KASPI_WEBHOOK_SECRET/
    )
  })

  it("still defaults to the mock client when no mode and no keys are set", () => {
    expect(createKaspiClient()).toBeInstanceOf(KaspiMockClient)
  })
})
