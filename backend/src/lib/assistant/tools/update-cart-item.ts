import { MedusaContainer } from "@medusajs/framework/types"
import { updateLineItemInCartWorkflow } from "@medusajs/medusa/core-flows"
import { AssistantContext, AssistantTool } from "../types"
import { listCartLines } from "./cart-line-lookup"
import {
  parseQuantity,
  roundingNote,
  strongRoundingGuard,
} from "./cart-quantity"
import { summarizeCart } from "./cart-summary"

// Инструмент ассистента «изменить количество позиции» (T2.3a — фикс блокера
// Ф-прогона: правка корзины повторным add_to_cart задваивала позиции). Тонкая
// обёртка над ядровым updateLineItemInCartWorkflow; позиция ищется по
// variant_id, внутренний id строки наружу не отдаётся (принцип #8). Правила
// количества (разбор + guard сильного округления) — общие с add_to_cart
// (cart-quantity.ts): «поменяй на 0.11 тонны» не должно молча стать тонной.

export const updateCartItemTool: AssistantTool = {
  declaration: {
    name: "update_cart_item",
    description:
      "Изменить количество УЖЕ добавленной позиции корзины (variant_id из " +
      "состава корзины). Используй для любой правки количества — НЕ добавляй " +
      "позицию повторно через add_to_cart. Количество — целое положительное; " +
      "чтобы убрать позицию совсем, используй remove_from_cart. Возвращает " +
      "обновлённый состав корзины.",
    parameters: {
      type: "OBJECT",
      properties: {
        variant_id: {
          type: "STRING",
          description: "Идентификатор варианта позиции в корзине.",
        },
        quantity: {
          type: "NUMBER",
          description:
            "Новое количество РОВНО как назвал покупатель, включая дробное " +
            "(например 0.11) — НЕ округляй сам: округление и подтверждение " +
            "ведёт инструмент. Чтобы убрать позицию — remove_from_cart.",
        },
      },
      required: ["variant_id", "quantity"],
    },
  },
  execute: async (
    container: MedusaContainer,
    args: Record<string, unknown>,
    context: AssistantContext
  ): Promise<Record<string, unknown>> => {
    if (!context.cartId) {
      return { error: "Корзины ещё нет — нечего изменять." }
    }
    const variantId =
      typeof args.variant_id === "string" ? args.variant_id.trim() : ""
    if (!variantId) {
      return { error: "Не указан variant_id позиции корзины." }
    }
    const parsed = parseQuantity(args.quantity)
    if (!parsed.ok) {
      return { error: parsed.error }
    }
    const requested = parsed.requested
    const guard = strongRoundingGuard(context, variantId, requested)
    if (guard) {
      return guard
    }
    const quantity = Math.ceil(requested)

    const lines = (await listCartLines(container, context.cartId)).filter(
      (l) => l.variant_id === variantId
    )
    if (lines.length === 0) {
      return {
        error:
          "Такой позиции в корзине нет. Сначала посмотри состав через view_cart.",
      }
    }
    if (lines.length > 1) {
      // Дубли одного варианта (задвоенная корзина): «обновить одну из строк»
      // соврало бы о состоянии — чиним состав явно.
      return {
        error:
          "В корзине несколько строк этой позиции (задвоение). Сначала убери " +
          "позицию целиком через remove_from_cart, затем добавь нужное " +
          "количество одним add_to_cart.",
      }
    }

    await updateLineItemInCartWorkflow(container).run({
      input: {
        cart_id: context.cartId,
        item_id: lines[0].item_id,
        update: { quantity },
      },
    })

    const summary = await summarizeCart(container, context.cartId)
    if (!summary) {
      // Изменение УЖЕ применено — не называем это ошибкой (ревью T2.3a).
      return {
        applied: true,
        warning:
          "Количество изменено, но состав корзины прочитать не удалось — " +
          "вызови view_cart и говори по его результату.",
      }
    }
    return { cart: summary, ...roundingNote(requested, quantity) }
  },
}
