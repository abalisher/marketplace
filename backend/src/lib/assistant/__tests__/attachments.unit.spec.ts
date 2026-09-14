import { dedupeAttachments } from "../attachments"
import { AssistantAttachment } from "../types"

// Unit: свёртка вставок хода — одна вставка на состояние, свежая побеждает.

const payment = (status: string): AssistantAttachment => ({
  type: "payment",
  provider: "kaspi",
  status,
  paid: status === "authorized",
  amount: 5200,
  currency: "kzt",
  qr_payload: "kaspi://pay",
  payment_url: null,
})

const orderStatus = (): AssistantAttachment => ({
  type: "order_status",
  display_id: 24,
  status_text: "Оформлен",
  delivery_stage: "new",
  courier_note: null,
  delivery_code: null,
  delivery_date: null,
  delivery_window: null,
})

const authPrompt = (): AssistantAttachment => ({
  type: "auth_prompt",
  reason: "checkout",
})

describe("dedupeAttachments", () => {
  // T10.8: guard'ов оформления за ход может сработать несколько (профиль →
  // доставка → оплата), а кнопка входа покупателю нужна одна и последней.
  it("оставляет одну карточку входа и ставит её в конец", () => {
    const out = dedupeAttachments([
      authPrompt(),
      payment("pending"),
      authPrompt(),
    ])

    expect(out.map((a) => a.type)).toEqual(["payment", "auth_prompt"])
  })

  it("keeps only the freshest payment state of the turn", () => {
    const out = dedupeAttachments([payment("pending"), payment("authorized")])

    expect(out).toHaveLength(1)
    expect((out[0] as { status: string }).status).toEqual("authorized")
  })

  it("puts payment before order status", () => {
    const out = dedupeAttachments([orderStatus(), payment("pending")])

    expect(out.map((a) => a.type)).toEqual(["payment", "order_status"])
  })

  it("returns an empty list untouched", () => {
    expect(dedupeAttachments([])).toEqual([])
  })

  it("убирает платёжную карточку, если заказ оформлен на этом ходе", () => {
    const out = dedupeAttachments([payment("authorized"), orderStatus()], {
      orderPlaced: true,
    })

    expect(out.map((a) => a.type)).toEqual(["order_status"])
  })
})
