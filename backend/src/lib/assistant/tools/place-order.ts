import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { placeOrderWorkflow } from "../../../workflows/place-order"
import { AssistantContext, AssistantTool } from "../types"
import { requireLogin } from "./buyer-identity"

// Инструмент ассистента «оформить заказ» (срез 5, подзадача 3 — финал пути,
// НЕОБРАТИМО). Тонкая обёртка над существующим placeOrderWorkflow (завершает
// корзину ядром + заводит жизненный цикл заказа). Логику НЕ дублируем.
// Предусловия (проверяем дружелюбно ДО запуска workflow, чтобы дать понятную
// подсказку, а не техническую ошибку шага): корзина есть, покупатель вошёл
// (T10.8), корзина не оформлена, задан email, оплата Kaspi подтверждена
// (authorized). После успеха корзина «потрачена» → сбрасываем cartId, чтобы
// следующий заказ начинался с чистой корзины.

type CartCheckRow = {
  id: string
  email?: string | null
  completed_at?: string | null
  payment_collection?: { payment_sessions?: { status: string }[] } | null
}

export const placeOrderTool: AssistantTool = {
  declaration: {
    name: "place_order",
    description:
      "Оформить заказ: завершает корзину и создаёт заказ. Вызывай ТОЛЬКО когда " +
      "оплата подтверждена (checkout_kaspi с action='check' вернул paid=true) и " +
      "задан адрес доставки. Возвращает номер заказа. Действие необратимо.",
    parameters: { type: "OBJECT", properties: {}, required: [] },
  },
  execute: async (
    container: MedusaContainer,
    _args: Record<string, unknown>,
    context: AssistantContext
  ): Promise<Record<string, unknown>> => {
    if (!context.cartId) {
      return { error: "Нет корзины — оформлять нечего." }
    }

    // Гейт входа (T10.8): заказ без учётки не оформляется — покупателю иначе
    // некуда вернуться за статусом, документами и претензией.
    if (!context.customerId) {
      return requireLogin(
        context,
        "Заказ оформляется только на вошедшего покупателя. Кнопка входа по " +
          "номеру уже показана в чате — попроси его войти, корзина сохранится."
      )
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "cart",
      fields: [
        "id",
        "email",
        "completed_at",
        "payment_collection.payment_sessions.status",
      ],
      filters: { id: context.cartId },
    })
    const cart = (data as CartCheckRow[])[0]

    if (!cart) {
      return { error: "Корзина не найдена." }
    }
    if (cart.completed_at) {
      return { error: "Заказ по этой корзине уже оформлен." }
    }
    if (!cart.email) {
      // Email на корзину проставляет set_delivery (служебный адрес из номера —
      // T10.8), поэтому пустое поле значит только одно: доставку ещё не оформили.
      return {
        error:
          "Адрес доставки ещё не сохранён. Вызови set_delivery — он же проставит " +
          "контакт для оформления.",
      }
    }
    const authorized = (cart.payment_collection?.payment_sessions ?? []).some(
      (s) => s.status === "authorized"
    )
    if (!authorized) {
      return {
        error:
          "Оплата ещё не подтверждена. Проверь статус через checkout_kaspi " +
          "(action='check'); оформляй заказ только когда paid=true.",
      }
    }

    const { result } = await placeOrderWorkflow(container).run({
      input: { cart_id: context.cartId, delivery_method: "delivery" },
      throwOnError: true,
    })

    const order = (result as { order: { id: string; status?: string } }).order

    // Человекочитаемый номер берём ЧИТКОЙ заказа: в результате workflow
    // (completeCartWorkflow ядра) поля display_id нет, и `?? null` отдавал
    // ассистенту пустоту — модель выдумывала номер («№ 24» на заказ №32,
    // найдено при live-прогоне T8.6). Номер — единственное, чем покупатель
    // потом ссылается на заказ, поэтому промаха здесь быть не должно.
    const { data: placed } = await query.graph({
      entity: "order",
      fields: ["id", "display_id", "status"],
      filters: { id: order.id },
    })
    const placedOrder = (
      placed as { display_id?: number | string; status?: string }[]
    )[0]

    // Корзина превратилась в заказ — сбрасываем, чтобы следующий заказ начинался
    // с чистой корзины (cart_id уходит из ответа, клиент его забывает). Взамен
    // запоминаем id заказа: клиент держит его как cart_id и шлёт обратно, чтобы
    // отслеживать статус через track_order (внутренний id — капабилити-токен).
    context.cartId = undefined
    context.lastOrderId = order.id
    return {
      order: {
        id: order.id,
        display_id: placedOrder?.display_id ?? null,
        status: placedOrder?.status ?? order.status ?? null,
      },
    }
  },
}
