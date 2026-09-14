import { MedusaContainer } from "@medusajs/framework/types"
import { requestAvrTool } from "../tools/request-avr"

// Unit: guard-путь запроса АВР. Без lastOrderId в контексте инструмент отвечает
// ошибкой сразу и НЕ трогает контейнер/БД. Живой путь (чтение выпущенного АВР
// либо идемпотентный выпуск для заказа юрлица) — live-smoke на сидированных данных.

const trapContainer = new Proxy(
  {},
  {
    get() {
      throw new Error("container must not be used without an order")
    },
  }
) as unknown as MedusaContainer

describe("assistant request_avr guard", () => {
  it("without a last order returns an error and skips the container", async () => {
    const out = await requestAvrTool.execute(trapContainer, {}, {})
    expect(typeof out.error).toEqual("string")
  })

  it("with an empty context returns an error and skips the container", async () => {
    const out = await requestAvrTool.execute(trapContainer, {}, { lastOrderId: "" })
    expect(typeof out.error).toEqual("string")
  })
})
