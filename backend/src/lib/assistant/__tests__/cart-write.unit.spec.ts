import { MedusaContainer } from "@medusajs/framework/types"
import { applyCartQuantities, assertCartWritable } from "../cart-write"

// Unit: guard-пути записи в корзину кнопками «−/+» (T10.15). Живая запись
// (ядровые workflow'ы создания корзины и правки строк) — live-smoke; здесь
// проверяем ровно то, что должно отрабатывать ДО обращения к базе: разбор
// количества и право писать в корзину.

// Контейнер-ловушка: любой доступ падает. Доказывает, что guard-путь не
// резолвит сервисы и не запускает workflow.
const trapContainer = new Proxy(
  {},
  {
    get() {
      throw new Error("container must not be used on the guard path")
    },
  }
) as unknown as MedusaContainer

// Контейнер, отвечающий на query.graph по сущности: cart → carts[0], customer →
// customers[0].
const containerWith = (rows: {
  cart?: Record<string, unknown>
  customer?: Record<string, unknown>
}): MedusaContainer =>
  ({
    resolve: () => ({
      graph: async ({ entity }: { entity: string }) => ({
        data:
          entity === "cart"
            ? rows.cart
              ? [rows.cart]
              : []
            : rows.customer
              ? [rows.customer]
              : [],
      }),
    }),
  }) as unknown as MedusaContainer

describe("applyCartQuantities — разбор количества", () => {
  it("дробное количество отвергается, база не трогается", async () => {
    // Кнопки шлют только целые: дробное здесь — сломанный клиент, а не повод
    // домыслить округление (деньги).
    await expect(
      applyCartQuantities(trapContainer, {
        items: [{ variant_id: "var_1", quantity: 0.5 }],
      })
    ).rejects.toThrow(/Invalid quantity/)
  })

  it("отрицательное и сверхбольшое количество отвергаются", async () => {
    await expect(
      applyCartQuantities(trapContainer, {
        items: [{ variant_id: "var_1", quantity: -1 }],
      })
    ).rejects.toThrow(/Invalid quantity/)

    await expect(
      applyCartQuantities(trapContainer, {
        items: [{ variant_id: "var_1", quantity: 1_000_000 }],
      })
    ).rejects.toThrow(/Invalid quantity/)
  })

  it("пустой variant_id отвергается", async () => {
    await expect(
      applyCartQuantities(trapContainer, {
        items: [{ variant_id: "   ", quantity: 1 }],
      })
    ).rejects.toThrow(/variant_id/)
  })

  it("нулевое количество без корзины не создаёт корзину", async () => {
    // «−» на карточке, которой нет в корзине: убирать нечего, заводить корзину
    // ради этого тем более незачем.
    const out = await applyCartQuantities(trapContainer, {
      items: [{ variant_id: "var_1", quantity: 0 }],
    })
    expect(out.cartId).toBeUndefined()
    expect(out.summary.items).toEqual([])
    expect(out.summary.total).toEqual(0)
  })
})

describe("assertCartWritable — право писать в корзину", () => {
  it("корзины нет — NOT_FOUND", async () => {
    await expect(
      assertCartWritable(containerWith({}), "cart_1")
    ).rejects.toThrow(/not found/i)
  })

  it("корзина уже оформлена — писать нельзя", async () => {
    await expect(
      assertCartWritable(
        containerWith({
          cart: { id: "cart_1", completed_at: "2026-08-31T00:00:00.000Z" },
        }),
        "cart_1"
      )
    ).rejects.toThrow(/completed/i)
  })

  it("гостевая корзина правится по владению её id", async () => {
    // Тот же принцип, что у всего чата: cart_id — капабилити-токен клиента.
    // Гостевая учётка (has_account = false) — это корзина, собранная до входа.
    await expect(
      assertCartWritable(
        containerWith({
          cart: { id: "cart_1", customer_id: "cus_guest" },
          customer: { id: "cus_guest", has_account: false },
        }),
        "cart_1"
      )
    ).resolves.toBeUndefined()
  })

  it("корзина другого зарегистрированного покупателя — отказ", async () => {
    await expect(
      assertCartWritable(
        containerWith({
          cart: { id: "cart_1", customer_id: "cus_other" },
          customer: { id: "cus_other", has_account: true },
        }),
        "cart_1",
        "cus_me"
      )
    ).rejects.toThrow(/another customer/i)
  })

  it("своя корзина правится без обращения к учёткам", async () => {
    await expect(
      assertCartWritable(
        containerWith({ cart: { id: "cart_1", customer_id: "cus_me" } }),
        "cart_1",
        "cus_me"
      )
    ).resolves.toBeUndefined()
  })
})
