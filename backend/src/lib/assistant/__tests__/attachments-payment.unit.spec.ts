import { dedupeAttachments } from "../attachments"
import { PaymentAttachment } from "../types"

const kaspi: PaymentAttachment = {
  type: "payment",
  provider: "kaspi",
  status: "authorized",
  paid: true,
  amount: 5000,
  currency: "kzt",
  qr_payload: null,
  payment_url: null,
}

describe("карточка оплаты после оформления заказа", () => {
  it("счёт корзины уходит, карточка оплаты заказа (перевод) остаётся", () => {
    const order: PaymentAttachment = {
      ...kaspi,
      provider: "kaspi_transfer",
      status: "awaiting",
      paid: false,
      order_display_id: 42,
      transfer: { phone: "+77011234567", recipient: "Нурлан Б.", note: null },
    }
    expect(dedupeAttachments([kaspi], { orderPlaced: true })).toEqual([])
    expect(dedupeAttachments([kaspi, order], { orderPlaced: true })).toEqual([order])
  })
})

describe("кнопки способов оплаты", () => {
  const buttons = {
    type: "payment_methods" as const,
    amount: 2800,
    currency: "kzt",
    methods: [
      { method: "kaspi_qr" as const, available: true, reason: null },
      { method: "debt" as const, available: true, reason: null },
    ],
    debt_term_days: 14,
    debt_max_amount: null,
  }

  it("остаются, пока способ не выбран, и стоят первыми", () => {
    expect(dedupeAttachments([buttons])).toEqual([buttons])
  })

  it("уходят, когда способ выбран на том же ходе или заказ оформлен", () => {
    expect(dedupeAttachments([buttons, kaspi])).toEqual([kaspi])
    expect(dedupeAttachments([buttons], { orderPlaced: true })).toEqual([])
  })
})

describe("кнопки слотов доставки", () => {
  const slots = {
    type: "delivery_slots" as const,
    slots: [{ date: "2026-10-30", window: "evening" as const }],
  }

  it("остаются, пока слот не выбран", () => {
    expect(dedupeAttachments([slots])).toEqual([slots])
  })

  it("уходят, когда на том же ходе дошли до оплаты или оформили заказ", () => {
    expect(dedupeAttachments([slots, kaspi])).toEqual([kaspi])
    expect(dedupeAttachments([slots], { orderPlaced: true })).toEqual([])
  })
})

describe("карточка оплаты заказа", () => {
  it("остаётся и на ходе оформления заказа", () => {
    const card = { type: "order_payment" as const, order_id: "order_1", display_id: 4 }
    expect(dedupeAttachments([kaspi, card], { orderPlaced: true })).toEqual([card])
  })
})
