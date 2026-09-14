import { MedusaContainer } from "@medusajs/framework/types"
import { deleteLineItemsWorkflow } from "@medusajs/medusa/core-flows"
import { AssistantContext, AssistantTool } from "../types"
import { listCartLines } from "./cart-line-lookup"
import { summarizeCart } from "./cart-summary"

// Инструмент ассистента «убрать позицию из корзины» (T2.3a — фикс блокера
// Ф-прогона: без правки корзины «исправление» шло повторным add_to_cart).
// Тонкая обёртка над ядровым deleteLineItemsWorkflow; позиция ищется по
// variant_id, внутренний id строки наружу не отдаётся (принцип #8). Удаляются
// ВСЕ строки варианта: в задвоенной корзине «убрал одну из двух» соврало бы
// покупателю о состоянии (ревью T2.3a).

export const removeFromCartTool: AssistantTool = {
  declaration: {
    name: "remove_from_cart",
    description:
      "Убрать позицию из корзины целиком (variant_id из состава корзины). " +
      "Используй, когда покупатель отказывается от позиции или просит заменить " +
      "её другой. Возвращает обновлённый состав корзины.",
    parameters: {
      type: "OBJECT",
      properties: {
        variant_id: {
          type: "STRING",
          description: "Идентификатор варианта позиции в корзине.",
        },
      },
      required: ["variant_id"],
    },
  },
  execute: async (
    container: MedusaContainer,
    args: Record<string, unknown>,
    context: AssistantContext
  ): Promise<Record<string, unknown>> => {
    if (!context.cartId) {
      return { error: "Корзины ещё нет — нечего убирать." }
    }
    const variantId =
      typeof args.variant_id === "string" ? args.variant_id.trim() : ""
    if (!variantId) {
      return { error: "Не указан variant_id позиции корзины." }
    }

    const lines = (await listCartLines(container, context.cartId)).filter(
      (l) => l.variant_id === variantId
    )
    if (lines.length === 0) {
      return {
        error:
          "Такой позиции в корзине нет. Сначала посмотри состав через view_cart.",
      }
    }

    await deleteLineItemsWorkflow(container).run({
      input: { cart_id: context.cartId, ids: lines.map((l) => l.item_id) },
    })

    const summary = await summarizeCart(container, context.cartId)
    if (!summary) {
      // Удаление УЖЕ применено — не называем это ошибкой (ревью T2.3a).
      return {
        applied: true,
        warning:
          "Позиция убрана, но состав корзины прочитать не удалось — вызови " +
          "view_cart и говори по его результату.",
      }
    }
    return { cart: summary, removed: lines[0].title || variantId }
  },
}
