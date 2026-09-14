import { MedusaContainer } from "@medusajs/framework/types"
import { estimateMaterialsTool } from "../tools/estimate-materials"

// Unit: guard инструмента расчёта материалов (ассистент, срез 2). Без единого
// валидного измерителя инструмент НЕ должен запускать workflow — возвращает
// подсказку, чтобы модель уточнила размеры. Живой расчёт (workflow + нормативы)
// покрыт тестами estimator и live-smoke; здесь — только граница входа.

// Контейнер-ловушка: любой доступ падает. Доказывает, что guard-путь не трогает
// контейнер (workflow не запускается).
const trapContainer = new Proxy(
  {},
  {
    get() {
      throw new Error("container must not be used when there are no measures")
    },
  }
) as unknown as MedusaContainer

describe("estimateMaterialsTool guard", () => {
  it("returns a hint and skips the workflow when no measures are given", async () => {
    const out = await estimateMaterialsTool.execute(trapContainer, {}, {})
    expect(out.lines).toEqual([])
    expect(typeof out.hint).toEqual("string")
  })

  it("treats zero, negative and non-numeric measures as absent", async () => {
    const out = await estimateMaterialsTool.execute(
      trapContainer,
      { area: 0, volume: -5, length: "abc", count: null },
      {}
    )
    expect(out.lines).toEqual([])
    expect(typeof out.hint).toEqual("string")
  })
})
