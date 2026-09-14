import { MedusaContainer } from "@medusajs/framework/types"
import { addToCartTool } from "../tools/add-to-cart"
import { viewCartTool } from "../tools/view-cart"
import { AssistantContext } from "../types"

// Unit: guard-пути инструментов корзины ассистента (срез 3), которые НЕ должны
// трогать контейнер/БД. Живое создание/чтение корзины (ядровые workflow'ы) —
// покрыто http-тестом ассистента и live-smoke; здесь только границы входа.

// Контейнер-ловушка: любой доступ падает. Доказывает, что guard-путь не резолвит
// сервисы и не запускает workflow.
const trapContainer = new Proxy(
  {},
  {
    get() {
      throw new Error("container must not be used on the guard path")
    },
  }
) as unknown as MedusaContainer

describe("assistant cart tools guards", () => {
  it("add_to_cart without variant_id returns an error and skips the container", async () => {
    const context: AssistantContext = {}
    const out = await addToCartTool.execute(trapContainer, {}, context)
    expect(typeof out.error).toEqual("string")
    // Корзина не создавалась — контекст не изменился.
    expect(context.cartId).toBeUndefined()
  })

  it("add_to_cart with a blank variant_id is treated as missing", async () => {
    const out = await addToCartTool.execute(
      trapContainer,
      { variant_id: "   " },
      {}
    )
    expect(typeof out.error).toEqual("string")
  })

  it("view_cart with no cart in context returns an empty cart without touching the container", async () => {
    const out = await viewCartTool.execute(trapContainer, {}, {})
    const cart = out.cart as { items: unknown[]; item_count: number; total: number }
    expect(cart.items).toEqual([])
    expect(cart.item_count).toEqual(0)
    expect(cart.total).toEqual(0)
    expect(typeof out.hint).toEqual("string")
  })
})
