import { MedusaContainer } from "@medusajs/framework/types"
import { deleteLineItemsWorkflow } from "@medusajs/medusa/core-flows"
import { AssistantContext, AssistantTool } from "../types"
import { listCartLines } from "./cart-line-lookup"
import { emptyCartSummary, summarizeCart } from "./cart-summary"

// Инструмент ассистента «очистить корзину» (T2.3a — фикс блокера Ф-прогона:
// задвоенную корзину было нечем «обнулить», ассистент только обещал исправить).
// Тонкая обёртка над ядровым deleteLineItemsWorkflow по всем строкам корзины.

export const clearCartTool: AssistantTool = {
  declaration: {
    name: "clear_cart",
    description:
      "Полностью очистить корзину покупателя (убрать все позиции). Используй, " +
      "когда покупатель просит начать сборку заново или состав безнадёжно " +
      "разошёлся с желаемым. Возвращает пустую корзину.",
    parameters: {
      type: "OBJECT",
      properties: {},
      required: [],
    },
  },
  execute: async (
    container: MedusaContainer,
    _args: Record<string, unknown>,
    context: AssistantContext
  ): Promise<Record<string, unknown>> => {
    if (!context.cartId) {
      return {
        cart: emptyCartSummary(),
        hint: "Корзины ещё нет — очищать нечего.",
      }
    }

    const lines = await listCartLines(container, context.cartId)
    if (lines.length > 0) {
      await deleteLineItemsWorkflow(container).run({
        input: {
          cart_id: context.cartId,
          ids: lines.map((l) => l.item_id),
        },
      })
    }

    const summary = await summarizeCart(container, context.cartId)
    if (!summary) {
      // Очистка УЖЕ применена — не называем это ошибкой (ревью T2.3a).
      return {
        applied: true,
        warning:
          "Корзина очищена, но перечитать её не удалось — вызови view_cart " +
          "и говори по его результату.",
      }
    }
    return { cart: summary }
  },
}
