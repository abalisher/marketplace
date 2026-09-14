import { MedusaContainer } from "@medusajs/framework/types"
import { addToCartTool } from "../tools/add-to-cart"
import { clearCartTool } from "../tools/clear-cart"
import { removeFromCartTool } from "../tools/remove-from-cart"
import { updateCartItemTool } from "../tools/update-cart-item"
import { AssistantContext } from "../types"

// Unit: guard-пути инструментов правки корзины (T2.3a) и guard сильного
// округления add_to_cart — НЕ должны трогать контейнер/БД. Живая правка
// (ядровые workflow'ы update/delete line items) — live-smoke.

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

describe("assistant cart edit tools guards", () => {
  it("update_cart_item without a cart returns an error", async () => {
    const out = await updateCartItemTool.execute(
      trapContainer,
      { variant_id: "var_1", quantity: 2 },
      {}
    )
    expect(typeof out.error).toEqual("string")
  })

  it("update_cart_item without variant_id returns an error", async () => {
    const out = await updateCartItemTool.execute(
      trapContainer,
      { quantity: 2 },
      { cartId: "cart_1" }
    )
    expect(typeof out.error).toEqual("string")
  })

  it("update_cart_item with a non-positive quantity suggests remove_from_cart", async () => {
    const out = await updateCartItemTool.execute(
      trapContainer,
      { variant_id: "var_1", quantity: 0 },
      { cartId: "cart_1" }
    )
    expect(String(out.error)).toContain("remove_from_cart")
  })

  it("update_cart_item fires the strong-rounding guard (0.11 → 1) before touching the cart", async () => {
    // Блокер ревью T2.3a: «поменяй на 0.11 тонны» не должно молча стать тонной.
    const context = { cartId: "cart_1" }
    const out = await updateCartItemTool.execute(
      trapContainer,
      { variant_id: "var_rebar", quantity: 0.11 },
      context
    )
    expect(typeof out.error).toEqual("string")
    expect(out.rounded_quantity).toEqual(1)
  })

  it("quantity that does not parse is an error, not a silent 1", async () => {
    // «0,11» с запятой (ru-локаль модели) → переспросить, а не добавить 1 шт.
    const comma = await addToCartTool.execute(
      trapContainer,
      { variant_id: "var_1", quantity: "0,11" },
      {}
    )
    expect(String(comma.error)).toContain("не распознано")

    const negative = await addToCartTool.execute(
      trapContainer,
      { variant_id: "var_1", quantity: -5 },
      {}
    )
    expect(String(negative.error)).toContain("remove_from_cart")

    const huge = await addToCartTool.execute(
      trapContainer,
      { variant_id: "var_1", quantity: 1_000_000 },
      {}
    )
    expect(String(huge.error)).toContain("велико")
  })

  it("remove_from_cart without a cart returns an error", async () => {
    const out = await removeFromCartTool.execute(
      trapContainer,
      { variant_id: "var_1" },
      {}
    )
    expect(typeof out.error).toEqual("string")
  })

  it("remove_from_cart without variant_id returns an error", async () => {
    const out = await removeFromCartTool.execute(
      trapContainer,
      {},
      { cartId: "cart_1" }
    )
    expect(typeof out.error).toEqual("string")
  })

  it("clear_cart without a cart returns an empty cart with a hint", async () => {
    const out = await clearCartTool.execute(trapContainer, {}, {})
    const cart = out.cart as { items: unknown[]; total: number }
    expect(cart.items).toEqual([])
    expect(cart.total).toEqual(0)
    expect(typeof out.hint).toEqual("string")
  })

  it("add_to_cart asks for confirmation when rounding up strongly (0.11 → 1)", async () => {
    const context: AssistantContext = {}
    const out = await addToCartTool.execute(
      trapContainer,
      { variant_id: "var_rebar", quantity: 0.11 },
      context
    )
    // Молчаливой тонны арматуры больше нет: корзина не создаётся, модель обязана
    // предупредить покупателя и добавить уже подтверждённое целое.
    expect(typeof out.error).toEqual("string")
    expect(out.requested_quantity).toEqual(0.11)
    expect(out.rounded_quantity).toEqual(1)
    expect(context.cartId).toBeUndefined()
  })

  it("add_to_cart blocks a same-turn retry after the rounding guard fired", async () => {
    // Контекст БЕЗ заранее созданного Set — guard обязан лениво завести его сам
    // (не зависеть от дисциплины оркестратора, ревью T2.3a).
    const context: AssistantContext = {}
    const first = await addToCartTool.execute(
      trapContainer,
      { variant_id: "var_rebar", quantity: 0.11 },
      context
    )
    expect(typeof first.error).toEqual("string")
    // Модель «передумала» и повторяет с целым количеством в том же ходе —
    // блокируем детерминированно, без обращения к контейнеру.
    const retry = await addToCartTool.execute(
      trapContainer,
      { variant_id: "var_rebar", quantity: 1 },
      context
    )
    expect(typeof retry.error).toEqual("string")
    expect(context.cartId).toBeUndefined()
    // Другой вариант тем же ходом guard не задевает (доходит до workflow —
    // ловушка контейнера это фиксирует).
    await expect(
      addToCartTool.execute(
        trapContainer,
        { variant_id: "var_other", quantity: 2 },
        context
      )
    ).rejects.toThrow("container must not be used")
  })

  it("add_to_cart keeps mild rounding as a note path (0.9 → 1 is within the guard)", async () => {
    // 0.9 → 1 — рост меньше x1.25: guard подтверждения НЕ срабатывает, инструмент
    // идёт добавлять (контейнер-ловушка это и фиксирует — дошли до workflow).
    await expect(
      addToCartTool.execute(
        trapContainer,
        { variant_id: "var_cement", quantity: 0.9 },
        {}
      )
    ).rejects.toThrow("container must not be used")
  })
})
