import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { adjustInventoryLevelsStep } from "@medusajs/medusa/core-flows"
import { PriceChangeSource } from "../modules/catalog/models/price-change"
import { ensureInventoryLevelsStep } from "./steps/ensure-inventory-levels"
import { recordPriceChangesStep } from "./steps/record-price-changes"
import { setVariantPricesStep } from "./steps/set-variant-prices"

// Одна позиция партии, уже сверенная с текущим состоянием каталога: что было и
// что должно стать. Разбор и проверка — на стороне роута
// (api/admin/price-stock/rows.ts): workflow пишет, а не решает.
//
// new_price / new_stock = null означает «эту величину не трогаем».
export type PriceStockLine = {
  variant_id: string
  product_id: string | null
  product_title: string
  variant_title: string | null
  sku: string | null
  currency_code: string
  old_price: number | null
  new_price: number | null
  carry_prices: { amount: number; currency_code: string }[]
  location_id: string | null
  inventory_item_id: string | null
  old_stock: number | null
  new_stock: number | null
}

export type ApplyPriceStockWorkflowInput = {
  lines: PriceStockLine[]
  changed_by: string | null
  changed_by_name: string | null
  source: PriceChangeSource
}

// Правка цен и остатков партией (T10.14). Партия — либо вся, либо ничего:
// продавец правит двадцать строк разом и должен точно знать, что применилось.
// Атомарность даёт компенсация шагов (цена возвращается прежней, остаток —
// обратной корректировкой, записи журнала удаляются).
//
// Порядок: сначала склад (заводим недостающий уровень и двигаем остаток), потом
// цена, потом журнал. Журнал последним — в нём только применённое.
//
// Остаток двигаем ДЕЛЬТОЙ (ядровый adjustInventoryLevelsStep,
// самокомпенсирующийся), хотя экран задаёт абсолютное число: дельта считается
// от снимка, сделанного при разборе правки, и одновременная приёмка на склад не
// затирается «моим» абсолютным значением целиком.
export const applyPriceStockWorkflow = createWorkflow(
  "apply-price-stock",
  (input: WorkflowData<ApplyPriceStockWorkflowInput>) => {
    const stock = transform({ input }, (d) =>
      d.input.lines
        .filter(
          (line) =>
            line.new_stock != null &&
            !!line.inventory_item_id &&
            !!line.location_id
        )
        .map((line) => ({
          inventory_item_id: line.inventory_item_id as string,
          location_id: line.location_id as string,
          // Остатки дробные (м³, т из 1С): разность — до тысячных, без
          // хвостов плавающей точки (34,95 − 34 = 0,9500000000000028).
          adjustment:
            Math.round(
              (Number(line.new_stock) - Number(line.old_stock ?? 0)) * 1000
            ) / 1000,
        }))
    )

    ensureInventoryLevelsStep(
      transform({ stock }, (d) => ({
        levels: d.stock.map((entry) => ({
          location_id: entry.location_id,
          inventory_item_id: entry.inventory_item_id,
        })),
      }))
    )

    // Нулевая дельта до ядра не доходит: уровень уже такой, каким его хотят
    // видеть (правили только цену или вернули прежнее число).
    adjustInventoryLevelsStep(
      transform({ stock }, (d) => d.stock.filter((entry) => entry.adjustment !== 0))
    )

    setVariantPricesStep(
      transform({ input }, (d) => ({
        prices: d.input.lines
          .filter((line) => line.new_price != null)
          .map((line) => ({
            variant_id: line.variant_id,
            currency_code: line.currency_code,
            new_price: Number(line.new_price),
            old_price: line.old_price == null ? null : Number(line.old_price),
            carry_prices: line.carry_prices ?? [],
          })),
      }))
    )

    const recorded = recordPriceChangesStep(
      transform({ input }, (d) => ({
        records: d.input.lines.map((line) => ({
          variant_id: line.variant_id,
          product_id: line.product_id,
          product_title: line.product_title,
          variant_title: line.variant_title,
          sku: line.sku,
          // Валюту пишем только у ценовой правки: у чисто складской строки
          // журнала цены нет, и «₸» рядом с пустой парой сбивал бы с толку.
          currency_code: line.new_price == null ? null : line.currency_code,
          old_price: line.new_price == null ? null : line.old_price,
          new_price: line.new_price,
          location_id: line.new_stock == null ? null : line.location_id,
          old_stock: line.new_stock == null ? null : line.old_stock,
          new_stock: line.new_stock,
        })),
        changed_by: d.input.changed_by,
        changed_by_name: d.input.changed_by_name,
        source: d.input.source,
      }))
    )

    return new WorkflowResponse(recorded)
  }
)
