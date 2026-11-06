import { MedusaContainer } from "@medusajs/framework/types"
import { checkoutPaymentTool } from "../tools/checkout-payment"
import { placeOrderTool } from "../tools/place-order"
import { AssistantContext } from "../types"

// Unit: guard-пути оформления/оплаты (срез 5.2–5.3 + гейт входа T10.8), которые
// НЕ должны трогать контейнер/БД/workflow. Без корзины — ошибка сразу; с
// корзиной, но без входа — просьба войти и карточка входа в ленте.
// Живые пути (init/sync Kaspi, placeOrder) — тонкие обёртки над уже
// протестированными workflow'ами (payment-kaspi/order тесты) + live-smoke.

const trapContainer = new Proxy(
  {},
  {
    get() {
      throw new Error("container must not be used without a cart")
    },
  }
) as unknown as MedusaContainer

describe("assistant checkout/order guards", () => {
  it("checkout_payment without a cart returns an error and skips the container", async () => {
    const out = await checkoutPaymentTool.execute(trapContainer, { action: "select", method: "kaspi_qr" }, {})
    expect(typeof out.error).toEqual("string")
  })

  it("checkout_payment check without a cart returns an error and skips the container", async () => {
    const out = await checkoutPaymentTool.execute(trapContainer, { action: "check" }, {})
    expect(typeof out.error).toEqual("string")
  })

  it("place_order without a cart returns an error and skips the container", async () => {
    const out = await placeOrderTool.execute(trapContainer, {}, {})
    expect(typeof out.error).toEqual("string")
  })

  // T10.8: деньги и заказ принадлежат учётке — гостевой checkout отменён.
  it("checkout_payment требует входа: гостю — карточка входа, БД не трогаем", async () => {
    const context: AssistantContext = { cartId: "cart_1", attachments: [] }
    const out = await checkoutPaymentTool.execute(
      trapContainer,
      { action: "select", method: "kaspi_qr" },
      context
    )

    expect(out.login_required).toEqual(true)
    expect(context.attachments).toEqual([
      { type: "auth_prompt", reason: "checkout" },
    ])
  })

  it("place_order требует входа: гостю — карточка входа, заказ не создаётся", async () => {
    const context: AssistantContext = { cartId: "cart_1", attachments: [] }
    const out = await placeOrderTool.execute(trapContainer, {}, context)

    expect(out.login_required).toEqual(true)
    expect(context.attachments).toEqual([
      { type: "auth_prompt", reason: "checkout" },
    ])
  })
})
