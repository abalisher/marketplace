import { MedusaContainer } from "@medusajs/framework/types"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows"

// Цена варианта в рабочей валюте: ставим новую, компенсация возвращает прежнюю.
export type VariantPriceLine = {
  variant_id: string
  currency_code: string
  new_price: number
  // Прежняя цена; null — цены в этой валюте не было (компенсация её уберёт).
  old_price: number | null
  // Цены в ДРУГИХ валютах у этого варианта: ядро принимает список цен целиком и
  // не упомянутые удаляет, поэтому проносим их через правку без изменений.
  carry_prices: { amount: number; currency_code: string }[]
}

export type SetVariantPricesStepInput = { prices: VariantPriceLine[] }

// Список цен варианта для ядрового upsert: прочие валюты как были + рабочая с
// нужной суммой. amount = null означает «цены в валюте нет» — тогда её просто
// нет в списке.
const priceList = (line: VariantPriceLine, amount: number | null) => [
  ...line.carry_prices.map((price) => ({
    amount: Number(price.amount),
    currency_code: price.currency_code,
  })),
  ...(amount == null
    ? []
    : [{ amount: Number(amount), currency_code: line.currency_code }]),
]

const apply = async (
  container: MedusaContainer,
  variants: { id: string; prices: { amount: number; currency_code: string }[] }[]
) => {
  if (!variants.length) {
    return
  }
  await updateProductVariantsWorkflow(container).run({
    input: { product_variants: variants },
    throwOnError: true,
  })
}

// Правка цены идёт ядровым workflow (тем же, что и админка Medusa), а не
// записью в price set руками: цена варианта живёт в модуле pricing и связана с
// вариантом ссылкой, и обход ядра оставил бы кэши и события несогласованными.
//
// Ядровый workflow эмитит `product-variant.updated`, а НЕ `product.updated`,
// поэтому подписчик повторной модерации (subscribers/product-updated.ts) на
// смену цены не срабатывает: цена — не изменение карточки товара.
export const setVariantPricesStep = createStep(
  "set-variant-prices",
  async (input: SetVariantPricesStepInput, { container }) => {
    const lines = input.prices ?? []
    await apply(
      container,
      lines.map((line) => ({
        id: line.variant_id,
        prices: priceList(line, line.new_price),
      }))
    )
    return new StepResponse<{ updated: number }, SetVariantPricesStepInput>(
      { updated: lines.length },
      { prices: lines }
    )
  },
  async (compensation, { container }) => {
    const lines = compensation?.prices ?? []
    await apply(
      container,
      lines.map((line) => ({
        id: line.variant_id,
        prices: priceList(line, line.old_price),
      }))
    )
  }
)
