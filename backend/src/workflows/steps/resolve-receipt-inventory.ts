import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

export type ResolveReceiptInventoryStepInput = {
  location_id: string
  lines: { variant_id: string; quantity: number }[]
}

export type InventoryAdjustment = {
  inventory_item_id: string
  location_id: string
  adjustment: number
}

// Сопоставить variant_id проведённых строк с inventory item ЯДРА и собрать
// корректировки остатка для adjustInventoryLevelsStep. Только чтение (query.graph),
// компенсация не нужна. Вариант без inventory item → ошибка (проводка откатится):
// приход не может лечь на несуществующий складской учёт. Модуль ядро не
// импортирует — резолв идёт здесь, на слое workflow (изоляция).
export const resolveReceiptInventoryStep = createStep(
  "resolve-receipt-inventory",
  async (input: ResolveReceiptInventoryStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const variantIds = [...new Set(input.lines.map((l) => l.variant_id))]

    const { data: variants } = await query.graph({
      entity: "variant",
      fields: ["id", "inventory_items.inventory_item_id"],
      filters: { id: variantIds },
    })

    const itemByVariant = new Map<string, string>()
    for (const variant of variants) {
      const itemId = variant?.inventory_items?.[0]?.inventory_item_id
      if (variant?.id && itemId) {
        itemByVariant.set(variant.id, itemId)
      }
    }

    const adjustments: InventoryAdjustment[] = input.lines.map((line) => {
      const inventoryItemId = itemByVariant.get(line.variant_id)
      if (!inventoryItemId) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Variant ${line.variant_id} has no inventory item to receive stock into`
        )
      }
      return {
        inventory_item_id: inventoryItemId,
        location_id: input.location_id,
        adjustment: line.quantity,
      }
    })

    return new StepResponse(adjustments)
  }
)
