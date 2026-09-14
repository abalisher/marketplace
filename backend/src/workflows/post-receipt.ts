import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { adjustInventoryLevelsStep } from "@medusajs/medusa/core-flows"
import { ensureInventoryLevelsStep } from "./steps/ensure-inventory-levels"
import { postReceiptStep } from "./steps/post-receipt"
import { resolveReceiptInventoryStep } from "./steps/resolve-receipt-inventory"

export type PostReceiptWorkflowInput = {
  receipt_id: string
}

// Проводка прихода: (1) модуль — draft→posted + партии (postReceiptStep,
// валидирует и компенсирует); (2) резолв variant_id → inventory item ядра;
// (3) заводим нулевой уровень остатка там, где позиция на этом складе ещё не
// заводилась (ensureInventoryLevelsStep — иначе ядровая корректировка падает,
// см. T4.7); (4) ядро — увеличить stocked_quantity на складе
// (adjustInventoryLevelsStep, самокомпенсирующийся). Порядок как в
// set-trip-stop-status: наш модульный шаг первым, ошибка ядрового шага
// откатывает партии/статус. Увеличение остатка ЯДРА живёт ТОЛЬКО здесь (модуль
// ядро не импортирует — изоляция).
export const postReceiptWorkflow = createWorkflow(
  "post-receipt",
  (input: WorkflowData<PostReceiptWorkflowInput>) => {
    const posted = postReceiptStep(input)

    const adjustments = resolveReceiptInventoryStep(
      transform({ posted }, (d) => ({
        location_id: d.posted.location_id,
        lines: d.posted.batches.map((b) => ({
          variant_id: b.variant_id,
          quantity: b.quantity_received,
        })),
      }))
    )

    ensureInventoryLevelsStep(
      transform({ posted, adjustments }, (d) => ({
        levels: d.adjustments.map((a) => ({
          location_id: d.posted.location_id,
          inventory_item_id: a.inventory_item_id,
        })),
      }))
    )

    adjustInventoryLevelsStep(adjustments)

    return new WorkflowResponse(posted)
  }
)
