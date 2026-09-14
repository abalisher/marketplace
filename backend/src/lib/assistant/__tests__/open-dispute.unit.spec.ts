import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { REVIEWS_MODULE } from "../../../modules/reviews"
import { openDisputeTool } from "../tools/open-dispute"

// Unit: guard-путь претензии по заказу. Всё, что можно отсеять ДО обращения к БД
// (нет заказа диалога, чужая категория, описание в два слова), инструмент
// отсеивает сам и контейнер не трогает. Создание претензии (workflow + событие)
// проверяется live-smoke на стенде — как у request_avr и track_order.

const trapContainer = new Proxy(
  {},
  {
    get() {
      throw new Error("container must not be used before the guards pass")
    },
  }
) as unknown as MedusaContainer

const valid = {
  category: "damaged",
  description: "Привезли 20 мешков, четыре порваны, цемент высыпался",
}

describe("assistant open_dispute guards", () => {
  it("without a last order returns an error and skips the container", async () => {
    const out = await openDisputeTool.execute(trapContainer, valid, {})
    expect(typeof out.error).toEqual("string")
  })

  it("rejects an unknown category before touching the container", async () => {
    const out = await openDisputeTool.execute(
      trapContainer,
      { ...valid, category: "refund" },
      { lastOrderId: "order_1" }
    )
    expect(out.error).toContain("refund")
  })

  // Оператор работает по тексту претензии: «брак» без подробностей — это ещё
  // один ход переписки, а не заявка.
  it("rejects a too short description before touching the container", async () => {
    const out = await openDisputeTool.execute(
      trapContainer,
      { ...valid, description: "брак" },
      { lastOrderId: "order_1" }
    )
    expect(typeof out.error).toEqual("string")
  })
})

// Контейнер-заглушка: заказ (с покупателем или без) и список активных претензий.
const containerWith = (
  order: Record<string, unknown> | undefined,
  disputes: Record<string, unknown>[]
): MedusaContainer =>
  ({
    resolve: (key: string) => {
      if (key === ContainerRegistrationKeys.QUERY) {
        return { graph: async () => ({ data: order ? [order] : [] }) }
      }
      if (key === REVIEWS_MODULE) {
        return { listDisputes: async () => disputes }
      }
      throw new Error(`unexpected resolve: ${key}`)
    },
  }) as unknown as MedusaContainer

describe("assistant open_dispute", () => {
  it("returns an error for an order without a customer", async () => {
    const out = await openDisputeTool.execute(
      containerWith({ id: "order_1", display_id: 44, customer_id: null }, []),
      valid,
      { lastOrderId: "order_1" }
    )
    expect(typeof out.error).toEqual("string")
  })

  // «Я же уже жаловался» — вопрос о статусе, а не ошибка: отдаём существующую
  // претензию вместо второй (сервис второй активной и не пустил бы).
  it("returns the active dispute instead of opening a second one", async () => {
    const out = await openDisputeTool.execute(
      containerWith({ id: "order_1", display_id: 44, customer_id: "cus_1" }, [
        {
          category: "damaged",
          status: "in_review",
          description: "Четыре мешка порваны",
          resolution: null,
        },
      ]),
      valid,
      { lastOrderId: "order_1" }
    )

    expect(out.already_open).toBe(true)
    expect(out.error).toBeUndefined()
    expect(out.dispute).toMatchObject({
      order_display_id: 44,
      status: "in_review",
      status_text: "Претензию рассматривают",
    })
  })
})
