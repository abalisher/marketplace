import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { LOGISTICS_MODULE } from "../../../modules/logistics"
import { REVIEWS_MODULE } from "../../../modules/reviews"
import { trackOrderTool } from "../tools/track-order"
import { AssistantAttachment, OrderStatusAttachment } from "../types"

// Unit: guard-путь отслеживания заказа. Без lastOrderId в контексте инструмент
// отвечает ошибкой сразу и НЕ трогает контейнер/БД. Живой путь (чтение статуса
// order-lifecycle + прогресс курьера logistics) — live-smoke на сидированных данных.

const trapContainer = new Proxy(
  {},
  {
    get() {
      throw new Error("container must not be used without an order")
    },
  }
) as unknown as MedusaContainer

describe("assistant track_order guard", () => {
  it("without a last order returns an error and skips the container", async () => {
    const out = await trackOrderTool.execute(trapContainer, {}, {})
    expect(typeof out.error).toEqual("string")
  })

  it("with an empty context returns an error and skips the container", async () => {
    const out = await trackOrderTool.execute(trapContainer, {}, { lastOrderId: "" })
    expect(typeof out.error).toEqual("string")
  })
})

// Контейнер-заглушка: заказ со статусом жизненного цикла, точка рейса курьера
// (пустой список = курьера ещё нет) и претензии по заказу.
const containerWith = (
  status: string,
  stops: { status: string }[],
  disputes: Record<string, unknown>[] = [],
  slot: { delivery_date: string; delivery_window: string } | null = null
): MedusaContainer =>
  ({
    resolve: (key: string) => {
      if (key === ContainerRegistrationKeys.QUERY) {
        return {
          graph: async () => ({
            data: [
              {
                id: "order_1",
                display_id: 43,
                order_lifecycle: { status, delivery_code: null, ...slot },
              },
            ],
          }),
        }
      }
      if (key === LOGISTICS_MODULE) {
        return { listTripStops: async () => stops }
      }
      if (key === REVIEWS_MODULE) {
        return { listDisputes: async () => disputes }
      }
      throw new Error(`unexpected resolve: ${key}`)
    },
  }) as unknown as MedusaContainer

describe("assistant track_order attachment", () => {
  // Находка гейта U T3.9: в `delivery_stage` лежала фраза о курьере, поэтому у
  // свежего заказа степпер клиента не рисовался вовсе.
  it("puts the lifecycle status code into delivery_stage of a fresh order", async () => {
    const attachments: AssistantAttachment[] = []
    await trackOrderTool.execute(
      containerWith("new", []),
      {},
      { lastOrderId: "order_1", attachments }
    )

    expect(attachments).toHaveLength(1)
    const fresh = attachments[0] as OrderStatusAttachment
    expect(fresh.delivery_stage).toEqual("new")
    expect(fresh.courier_note).toBeNull()
  })

  it("keeps the courier progress in courier_note once a trip stop exists", async () => {
    const attachments: AssistantAttachment[] = []
    await trackOrderTool.execute(
      containerWith("in_delivery", [{ status: "arrived" }]),
      {},
      { lastOrderId: "order_1", attachments }
    )

    const delivering = attachments[0] as OrderStatusAttachment
    expect(delivering.delivery_stage).toEqual("in_delivery")
    expect(delivering.courier_note).toEqual("Курьер прибыл по адресу доставки")
  })

  // T5.6a: слот доехал до заказа, но в ленте чата его не было — покупатель
  // видел карточку статуса без срока приезда машины.
  it("puts the delivery slot into the attachment as codes", async () => {
    const attachments: AssistantAttachment[] = []
    // Слот берём из будущего: readSlot отбрасывает окна, которые уже прошли.
    const date = new Date(Date.now() + 3 * 24 * 3600_000)
      .toISOString()
      .slice(0, 10)
    await trackOrderTool.execute(
      containerWith("confirmed", [], [], {
        delivery_date: date,
        delivery_window: "day",
      }),
      {},
      { lastOrderId: "order_1", attachments }
    )

    const withSlot = attachments[0] as OrderStatusAttachment
    expect(withSlot.delivery_date).toEqual(date)
    expect(withSlot.delivery_window).toEqual("day")
  })

  it("leaves the slot empty for an order placed before slots existed", async () => {
    const attachments: AssistantAttachment[] = []
    await trackOrderTool.execute(
      containerWith("new", []),
      {},
      { lastOrderId: "order_1", attachments }
    )

    const noSlot = attachments[0] as OrderStatusAttachment
    expect(noSlot.delivery_date).toBeNull()
    expect(noSlot.delivery_window).toBeNull()
  })
})

// Ф-прогон 2026-08-13 (М5): на «что там с моей претензией» ассистенту нечего было
// ответить — про диспуты он не знал вовсе.
describe("assistant track_order dispute", () => {
  it("returns null when the order has no dispute", async () => {
    const out = await trackOrderTool.execute(
      containerWith("delivered", []),
      {},
      { lastOrderId: "order_1" }
    )
    expect(out.dispute).toBeNull()
  })

  it("returns the latest dispute with its status text, resolution and outcome", async () => {
    const out = await trackOrderTool.execute(
      containerWith("delivered", [], [
        {
          category: "damaged",
          status: "resolved",
          resolution: "Заменили четыре мешка",
          outcome: "replacement",
        },
      ]),
      {},
      { lastOrderId: "order_1" }
    )

    // Последствие решения приходит словами: канала уведомлений нет, и «что мне
    // за это будет» покупатель узнаёт только из чата (T4.11).
    expect(out.dispute).toEqual({
      category: "damaged",
      status: "resolved",
      status_text: "Претензия решена",
      resolution: "Заменили четыре мешка",
      outcome: "replacement",
      outcome_text: "Магазин меняет товар",
    })
  })
})
