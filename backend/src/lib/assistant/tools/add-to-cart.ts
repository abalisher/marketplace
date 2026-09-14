import { MedusaContainer } from "@medusajs/framework/types"
import {
  addToCartWorkflow,
  createCartWorkflow,
} from "@medusajs/medusa/core-flows"
import { resolveCartCreationContext } from "../cart-write"
import { AssistantContext, AssistantTool } from "../types"
import {
  parseQuantity,
  roundingNote,
  strongRoundingGuard,
} from "./cart-quantity"
import { summarizeCart } from "./cart-summary"

// Инструмент ассистента «добавить в корзину» (срез 3 — первый инструмент,
// меняющий состояние). Тонкая обёртка над ядровыми workflow'ами корзины
// (createCartWorkflow / addToCartWorkflow) — логику корзины НЕ дублируем
// (CLAUDE.md). Первое добавление создаёт корзину и проставляет её id в контекст
// хода (клиент держит cart_id между ходами, идиома messages — stateless-ассистент,
// решение 2026-07-23, DECISIONS); последующие добавляют позиции в ту же корзину.

// Количество округляется ВВЕРХ (Math.ceil): корзина ядра хранит целое, а
// материалы (м³/тонны) считаются дробно — округление вниз недопоставляло бы
// (площадку не зальёшь; решение владельца 2026-07-24). Разбор и guard'ы —
// общий хелпер cart-quantity.ts (T2.3a).
//
// Создание корзины чата (регион/канал/валюта) живёт в общем cart-write.ts:
// корзину заводит и этот инструмент, и роут счётчиков на карточках (T10.15) —
// правило «как рождается корзина чата» обязано быть одно.

export const addToCartTool: AssistantTool = {
  declaration: {
    name: "add_to_cart",
    description:
      "Добавить товар в корзину покупателя по идентификатору варианта " +
      "(variant_id из результатов search_products). Используй, когда покупатель " +
      "подтвердил, что хочет добавить конкретную позицию. Если корзины ещё нет — " +
      "она создаётся автоматически. Возвращает обновлённый состав корзины.",
    parameters: {
      type: "OBJECT",
      properties: {
        variant_id: {
          type: "STRING",
          description:
            "Идентификатор варианта товара (поле variant_id из search_products).",
        },
        quantity: {
          type: "NUMBER",
          description:
            "Количество РОВНО как назвал покупатель, включая дробное " +
            "(например 0.11) — НЕ округляй сам: округление и подтверждение " +
            "покупателя ведёт инструмент. По умолчанию 1.",
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
    const variantId =
      typeof args.variant_id === "string" ? args.variant_id.trim() : ""
    if (!variantId) {
      return {
        error:
          "Не указан variant_id. Сначала найди товар через search_products и " +
          "возьми variant_id из результата.",
      }
    }
    const parsed = parseQuantity(args.quantity, { defaultToOne: true })
    if (!parsed.ok) {
      return { error: parsed.error }
    }
    const requested = parsed.requested
    const guard = strongRoundingGuard(context, variantId, requested)
    if (guard) {
      return guard
    }
    const quantity = Math.ceil(requested)

    if (!context.cartId) {
      // Первое добавление — создаём корзину и запоминаем её id в контексте хода.
      const { regionId, salesChannelId, currency } =
        await resolveCartCreationContext(container)
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: salesChannelId,
          currency_code: currency,
          ...(context.customerId
            ? { customer_id: context.customerId }
            : {}),
          items: [{ variant_id: variantId, quantity }],
        },
      })
      context.cartId = cart.id
    } else {
      await addToCartWorkflow(container).run({
        input: {
          cart_id: context.cartId,
          items: [{ variant_id: variantId, quantity }],
        },
      })
    }

    const summary = await summarizeCart(container, context.cartId)
    if (!summary) {
      // Добавление УЖЕ применено — не называем это ошибкой, иначе модель скажет
      // «не получилось» и слова снова разойдутся с состоянием (ревью T2.3a).
      return {
        applied: true,
        warning:
          "Товар добавлен, но состав корзины прочитать не удалось — вызови " +
          "view_cart и говори по его результату.",
      }
    }
    return { cart: summary, ...roundingNote(requested, quantity) }
  },
}
