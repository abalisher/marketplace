import {
  confirmBlock,
  defaultDueDate,
  initialKaspiAction,
  initialPaymentFacts,
  isDebtOverdue,
  orderPaymentStatus,
  outstandingAmount,
  paymentChangeBlock,
  receiveError,
  refundDueAmount,
  refundError,
} from "../order-payment-state"

describe("состояние оплаты заказа", () => {
  it("после оформления: QR и бонусы оплачены, перевод ждём, долг просят", () => {
    expect(orderPaymentStatus(initialPaymentFacts("kaspi_qr", 5000))).toBe("paid")
    expect(orderPaymentStatus(initialPaymentFacts("bonus", 0))).toBe("paid")
    expect(orderPaymentStatus(initialPaymentFacts("kaspi_transfer", 5000))).toBe("awaiting")
    expect(orderPaymentStatus(initialPaymentFacts("debt", 5000))).toBe("debt_requested")
  })

  it("Kaspi при оформлении: журнал — только у QR, оплаченного до заказа", () => {
    expect(initialKaspiAction("kaspi_qr", 2505, false, false)).toBe("entry")
    expect(initialKaspiAction("kaspi_qr", 2505, true, false)).toBe("invoice")
    // Постоянный QR магазина: денег ещё нет — ни счёта, ни поступления.
    expect(initialKaspiAction("kaspi_qr", 2505, true, true)).toBe("none")
    expect(initialKaspiAction("kaspi_transfer", 2505, false, false)).toBe("none")
    expect(initialKaspiAction("kaspi_qr", 0, false, false)).toBe("none")
    // Журнал и состояние оплаты сходятся: «none»/«invoice» — оплачено 0.
    expect(initialPaymentFacts("kaspi_qr", 2505, true).paid_amount).toBe(0)
  })

  it("перевод: получено всё — оплачен; частично — ещё ждём", () => {
    const facts = initialPaymentFacts("kaspi_transfer", 5000)
    expect(orderPaymentStatus({ ...facts, paid_amount: 3000 })).toBe("awaiting")
    expect(outstandingAmount({ ...facts, paid_amount: 3000 })).toBe(2000)
    expect(orderPaymentStatus({ ...facts, paid_amount: 5000 })).toBe("paid")
  })

  it("долг: одобрен — debt, гасится частями, погашен — paid", () => {
    const facts = { ...initialPaymentFacts("debt", 120_000), approved: true }
    expect(orderPaymentStatus(facts)).toBe("debt")
    expect(orderPaymentStatus({ ...facts, paid_amount: 50_000 })).toBe("debt")
    expect(outstandingAmount({ ...facts, paid_amount: 50_000 })).toBe(70_000)
    expect(orderPaymentStatus({ ...facts, paid_amount: 120_000 })).toBe("paid")
  })

  it("отмена: без денег — canceled, с деньгами — к возврату, вернули — refunded", () => {
    const transfer = initialPaymentFacts("kaspi_transfer", 5000)
    expect(orderPaymentStatus({ ...transfer, canceled: true })).toBe("canceled")
    const paid = { ...transfer, paid_amount: 5000, canceled: true }
    expect(orderPaymentStatus(paid)).toBe("refund_due")
    expect(refundDueAmount(paid)).toBe(5000)
    expect(outstandingAmount(paid)).toBe(0)
    expect(orderPaymentStatus({ ...paid, refunded_amount: 5000 })).toBe("refunded")
  })

  it("поступление: не больше остатка и только пока заказ не оплачен", () => {
    const facts = initialPaymentFacts("kaspi_transfer", 5000)
    expect(receiveError("awaiting", facts, 0)).toBe("not_positive")
    expect(receiveError("awaiting", facts, 5000.01)).toBe("over_outstanding")
    expect(receiveError("awaiting", facts, 5000)).toBeNull()
    expect(receiveError("paid", { ...facts, paid_amount: 5000 }, 1)).toBe("not_receivable")
    expect(receiveError("canceled", { ...facts, canceled: true }, 1)).toBe("not_receivable")
    // Покупатель вернул долг раньше, чем продавец его одобрил, — принимаем.
    expect(receiveError("debt_requested", initialPaymentFacts("debt", 900), 900)).toBeNull()
  })

  it("возврат: только по отменённому заказу и не больше полученного", () => {
    const facts = initialPaymentFacts("kaspi_transfer", 5000)
    expect(refundError({ ...facts, paid_amount: 5000 }, 100)).toBe("not_refundable")
    const canceled = { ...facts, paid_amount: 5000, canceled: true }
    expect(refundError(canceled, 6000)).toBe("over_refund_due")
    expect(refundError(canceled, 5000)).toBeNull()
  })

  it("перевод без денег в сборку не пускаем; остальное подтверждается", () => {
    expect(confirmBlock("kaspi_transfer", "awaiting")).toBe("transfer_not_received")
    expect(confirmBlock("kaspi_transfer", "paid")).toBeNull()
    expect(confirmBlock("debt", "debt_requested")).toBeNull()
    expect(confirmBlock("kaspi_qr", "paid")).toBeNull()
  })

  it("срок долга и просрочка", () => {
    const from = new Date("2026-10-29T10:00:00.000Z")
    expect(defaultDueDate(from, 14).toISOString()).toBe("2026-11-12T10:00:00.000Z")
    const now = new Date("2026-11-13T00:00:00.000Z")
    expect(isDebtOverdue("debt", "2026-11-12T10:00:00.000Z", now)).toBe(true)
    expect(isDebtOverdue("debt", "2026-11-20T10:00:00.000Z", now)).toBe(false)
    expect(isDebtOverdue("paid", "2026-11-12T10:00:00.000Z", now)).toBe(false)
    expect(isDebtOverdue("debt", null, now)).toBe(false)
  })
})

describe("смена способа оплаты оформленного заказа", () => {
  const facts = initialPaymentFacts("kaspi_transfer", 5000)

  it("можно, пока заказ не подтверждён и денег не было", () => {
    expect(paymentChangeBlock("new", "awaiting", facts)).toBeNull()
    expect(paymentChangeBlock("new", "debt_requested", initialPaymentFacts("debt", 5000))).toBeNull()
  })

  it("нельзя после подтверждения, при отмеченных деньгах и у оплаченного", () => {
    expect(paymentChangeBlock("confirmed", "awaiting", facts)).toBe("confirmed")
    expect(paymentChangeBlock("new", "awaiting", { ...facts, paid_amount: 100 })).toBe("has_money")
    expect(paymentChangeBlock("new", "paid", initialPaymentFacts("kaspi_qr", 5000))).toBe("has_money")
    expect(paymentChangeBlock("new", "canceled", facts)).toBe("not_changeable")
  })

  it("неоплаченный Kaspi QR заказа в сборку не пускаем", () => {
    expect(confirmBlock("kaspi_qr", "awaiting")).toBe("kaspi_not_paid")
  })
})
