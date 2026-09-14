import {
  RawOrderPayments,
  selectPendingCaptures,
} from "../pending-captures"

type RawPayment = NonNullable<
  NonNullable<RawOrderPayments["payment_collections"]>[number]["payments"]
>[number]

// Выборка платежей, ждущих списания (T4.14): чистая функция, без БД.
describe("selectPendingCaptures", () => {
  const payment = (over: Partial<RawPayment> = {}): RawPayment => ({
    id: "pay_1",
    amount: 930000,
    currency_code: "kzt",
    captured_at: null,
    canceled_at: null,
    ...over,
  })

  const order = (payments: RawPayment[]): RawOrderPayments => ({
    id: "order_1",
    display_id: 44,
    payment_collections: [{ payments }],
  })

  it("берёт платёж, который ещё не списан", () => {
    expect(selectPendingCaptures([order([payment()])])).toEqual([
      {
        payment_id: "pay_1",
        order_id: "order_1",
        display_id: 44,
        amount: 930000,
        currency_code: "kzt",
      },
    ])
  })

  it("пропускает уже списанный и отменённый платёж", () => {
    const orders = [
      order([
        payment({ id: "pay_captured", captured_at: "2026-09-01T10:05:00.000Z" }),
        payment({ id: "pay_canceled", canceled_at: "2026-09-01T10:05:00.000Z" }),
      ]),
    ]
    expect(selectPendingCaptures(orders)).toEqual([])
  })

  it("читает сумму из BigNumber-объекта ядра", () => {
    const [pending] = selectPendingCaptures([
      order([payment({ amount: { value: "930000" } })]),
    ])
    expect(pending.amount).toBe(930000)
  })

  it("не спотыкается о заказ без платёжной коллекции (оплата бонусами)", () => {
    expect(
      selectPendingCaptures([{ id: "order_2", payment_collections: [] }])
    ).toEqual([])
    expect(selectPendingCaptures([{ id: "order_3" }])).toEqual([])
  })
})
