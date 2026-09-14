import { MedusaContainer } from "@medusajs/framework/types"
import { AssistantContext, AssistantTool } from "../types"
import { emptyCartSummary, summarizeCart } from "./cart-summary"

// Инструмент ассистента «показать корзину» (срез 3). Только чтение: отдаёт текущий
// состав корзины из контекста хода. Пустой контекст (корзины ещё нет) — не ошибка,
// а нормальное состояние в начале диалога: возвращаем пустой список с подсказкой,
// чтобы модель предложила добавить товары.

export const viewCartTool: AssistantTool = {
  declaration: {
    name: "view_cart",
    description:
      "Показать текущий состав корзины покупателя (позиции, количество, суммы). " +
      "Используй, когда покупатель спрашивает, что уже в корзине, или просит " +
      "подвести итог перед оформлением.",
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
        hint: "Корзина пуста. Предложи покупателю добавить товары.",
      }
    }

    const summary = await summarizeCart(container, context.cartId)
    if (!summary) {
      // id есть, но корзина не читается (удалена) — сбрасываем и просим начать
      // заново, а не показываем «сломанную» корзину.
      context.cartId = undefined
      return {
        cart: emptyCartSummary(),
        hint: "Корзина не найдена. Предложи покупателю собрать её заново.",
      }
    }
    return { cart: summary }
  },
}
