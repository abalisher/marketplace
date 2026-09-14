import { MedusaContainer } from "@medusajs/framework/types"
import { setDeliveryTool } from "../tools/set-delivery"
import { AssistantContext } from "../types"

// Unit: guard-пути инструмента доставки (срез 5.1 + гейт входа T10.8). Живое
// сохранение адреса, подбор способа доставки и запись профиля — ядровые
// workflow'ы, покрыты live-smoke на сидированной инфраструктуре доставки.

// Контейнер-ловушка: любой доступ падает.
const trapContainer = new Proxy(
  {},
  {
    get() {
      throw new Error("container must not be used on the guard path")
    },
  }
) as unknown as MedusaContainer

// Контейнер с подставленным профилем покупателя (query.graph по customer).
const containerWithCustomer = (
  customer: Record<string, unknown>
): MedusaContainer =>
  ({
    resolve: () => ({
      graph: async () => ({ data: [customer] }),
    }),
  }) as unknown as MedusaContainer

describe("setDeliveryTool guards", () => {
  it("returns an error and skips the container when there is no cart", async () => {
    const out = await setDeliveryTool.execute(
      trapContainer,
      {
        first_name: "Иван",
        last_name: "П",
        phone: "1",
        address_1: "ул. 1",
        city: "Астана",
      },
      {}
    )
    expect(typeof out.error).toEqual("string")
  })

  // T10.8: оформление доступно только вошедшему покупателю. Гость получает
  // ошибку-подсказку и карточку входа в ленте — БЕЗ обращения к контейнеру.
  it("просит гостя войти и кладёт в ленту карточку входа", async () => {
    const context: AssistantContext = { cartId: "cart_1", attachments: [] }
    const out = await setDeliveryTool.execute(
      trapContainer,
      { address_1: "пр. Туран 55" },
      context
    )

    expect(out.login_required).toEqual(true)
    expect(String(out.error)).toContain("вход")
    expect(context.attachments).toEqual([
      { type: "auth_prompt", reason: "checkout" },
    ])
  })

  it("считает пустой customerId гостем", async () => {
    const context: AssistantContext = {
      cartId: "cart_1",
      customerId: "",
      attachments: [],
    }
    const out = await setDeliveryTool.execute(trapContainer, {}, context)
    expect(out.login_required).toEqual(true)
  })

  // Спрашиваем только то, чего нет ни в реплике, ни в профиле: у новой учётки
  // «только телефон» это ФИО и улица.
  it("перечисляет недостающие поля и не трогает корзину", async () => {
    const context: AssistantContext = {
      cartId: "cart_1",
      customerId: "cus_1",
      attachments: [],
    }
    const out = await setDeliveryTool.execute(
      containerWithCustomer({ id: "cus_1", phone: "+77011234567" }),
      { first_name: "Ерлан" },
      context
    )

    expect(String(out.error)).toContain("last_name")
    expect(String(out.error)).toContain("address_1")
    expect(out.missing_fields).toEqual(["last_name", "address_1"])
    // Телефон берётся из учётки — его не переспрашиваем.
    expect(String(out.error)).not.toContain("phone")
    // Город обязательным НЕ является (подставляется Астана).
    expect(String(out.error)).not.toContain("city")
  })

  it("не переспрашивает ничего, если профиль заполнен", async () => {
    const context: AssistantContext = {
      cartId: "cart_1",
      customerId: "cus_1",
      attachments: [],
    }
    // Профиль полон → guard'ы пройдены, инструмент уходит в ядровые workflow
    // (на этом контейнере они падают). Важно только, что вопроса о недостающих
    // полях больше нет: повторный заказ ничего не спрашивает.
    const outcome = await setDeliveryTool
      .execute(
        containerWithCustomer({
          id: "cus_1",
          phone: "+77011234567",
          first_name: "Ерлан",
          last_name: "Сериков",
          addresses: [
            {
              id: "addr_1",
              first_name: "Ерлан",
              last_name: "Сериков",
              phone: "+77011234567",
              address_1: "пр. Туран 55",
              city: "Астана",
              is_default_shipping: true,
            },
          ],
        }),
        {},
        context
      )
      .then(
        (result) => String(result.error ?? ""),
        (error: Error) => error.message
      )

    expect(outcome).not.toContain("Не хватает данных адреса")
  })

  it("does not require city: single store works in Astana", () => {
    const params = setDeliveryTool.declaration.parameters as {
      required: string[]
      properties: Record<string, { description?: string }>
    }
    expect(params.required).not.toContain("city")
    expect(params.properties.city.description).toContain("Астана")
  })

  // T10.8: email покупателя не спрашиваем вовсе — на корзину идёт служебный
  // адрес из номера телефона. Прежний параметр убран, чтобы модель не могла
  // выдумать почту (прогон 2026-08-13: «marat@example.com» на заказ 930 000 ₸).
  it("больше не принимает email от модели", () => {
    const params = setDeliveryTool.declaration.parameters as {
      properties: Record<string, unknown>
    }
    expect(params.properties.email).toBeUndefined()
  })
})
