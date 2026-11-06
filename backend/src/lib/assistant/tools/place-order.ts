import { orderLabel } from "../../orders/order-number"
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { placeOrderWorkflow } from "../../../workflows/place-order"
import { loadCartPaymentView } from "../../payments/cart-payment-view"
import { loadBuyerOrderPayment } from "../../payments/order-payment-buyer-view"
import { AssistantContext, AssistantTool, PaymentAttachment } from "../types"
import { requireLogin } from "./buyer-identity"

// Инструмент ассистента «оформить заказ» (срез 5, подзадача 3 — финал пути,
// НЕОБРАТИМО). Тонкая обёртка над существующим placeOrderWorkflow (завершает
// корзину ядром + заводит жизненный цикл заказа). Логику НЕ дублируем.
// Предусловия (проверяем дружелюбно ДО запуска workflow, чтобы дать понятную
// подсказку, а не техническую ошибку шага): корзина есть, покупатель вошёл
// (T10.8), корзина не оформлена, задан email, способ оплаты выбран (Kaspi QR —
// оплачен; перевод и «в долг» — оформляются без денег). После успеха корзина
// «потрачена» → сбрасываем cartId, чтобы следующий заказ начинался с чистой
// корзины. Перевод и долг получают карточку оплаты заказа: куда переводить и
// какой номер заказа написать в комментарии.

type CartCheckRow = {
  id: string
  email?: string | null
  completed_at?: string | null
}

const ORDER_PROVIDER: Record<string, PaymentAttachment["provider"]> = {
  kaspi_transfer: "kaspi_transfer",
  debt: "debt",
  kaspi_qr: "kaspi",
}

export const placeOrderTool: AssistantTool = {
  declaration: {
    name: "place_order",
    description:
      "Оформить заказ: завершает корзину и создаёт заказ. Вызывай ТОЛЬКО когда " +
      "задан адрес доставки и checkout_payment вернул ready_to_place_order=true " +
      "(Kaspi QR оплачен, либо выбран перевод или долг и покупатель согласен " +
      "оформить). Возвращает номер заказа и что делать с оплатой. Действие необратимо.",
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
      fields: ["id", "email", "completed_at"],
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
    const payment = await loadCartPaymentView(container, context.cartId)
    if (!payment?.ready_to_place) {
      return {
        error: payment?.selected
          ? "Оплата Kaspi ещё не прошла. Проверь статус через checkout_payment " +
            "(action='check'); оформляй заказ, когда ready_to_place_order=true."
          : "Способ оплаты не выбран. Покажи способы через checkout_payment " +
            "(action='methods') и выбери тот, что назвал покупатель.",
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
      fields: ["id", "display_id", "status", "order_lifecycle.number"],
      filters: { id: order.id },
    })
    const placedOrder = (
      placed as {
        display_id?: number | string
        status?: string
        order_lifecycle?: { number?: string | null } | null
      }[]
    )[0]
    const orderNumber =
      placedOrder?.order_lifecycle?.number ?? null

    // Корзина превратилась в заказ — сбрасываем, чтобы следующий заказ начинался
    // с чистой корзины (cart_id уходит из ответа, клиент его забывает). Взамен
    // запоминаем id заказа: клиент держит его как cart_id и шлёт обратно, чтобы
    // отслеживать статус через track_order (внутренний id — капабилити-токен).
    context.cartId = undefined
    context.lastOrderId = order.id

    // Оплата заказа: перевод ждёт денег (куда и с каким номером), долг ждёт
    // решения продавца, Kaspi QR после оформления — оплаты счёта на заказ (QR
    // в карточке) — постоянная карточка оплаты заказа со ссылкой на заказ
    // (клиент читает её состояние живым). Kaspi QR, оплаченный до заказа, —
    // карточка не нужна.
    const orderPayment = await loadBuyerOrderPayment(container, order.id)
    const awaitsPayment =
      orderPayment?.method !== "kaspi_qr" || orderPayment.status === "awaiting"
    if (orderPayment && ORDER_PROVIDER[orderPayment.method] && awaitsPayment) {
      context.attachments?.push({
        type: "order_payment",
        order_id: order.id,
        display_id:
          placedOrder?.display_id != null ? Number(placedOrder.display_id) : orderPayment.order_display_id,
        order_number: orderNumber ?? orderPayment.order_number,
      })
    }

    return {
      order: {
        id: order.id,
        // Номер для покупателя — number («ORG-26-0007»); display_id технический.
        number: orderNumber ?? orderPayment?.order_number ?? null,
        display_id: placedOrder?.display_id ?? null,
        status: placedOrder?.status ?? order.status ?? null,
      },
      payment: orderPayment
        ? {
            method: orderPayment.method,
            status: orderPayment.status,
            to_pay: Math.round(orderPayment.outstanding),
            transfer_to: orderPayment.transfer
              ? {
                  phone: orderPayment.transfer.phone,
                  recipient: orderPayment.transfer.recipient,
                  comment: `Заказ ${orderLabel(
                    orderNumber ?? orderPayment.order_number,
                    orderPayment.order_display_id
                  )}`,
                }
              : null,
            // Kaspi QR после оформления: QR и кнопка оплаты — в карточке под
            // ответом; оплату система увидит сама.
            ...(orderPayment.method === "kaspi_qr" && orderPayment.status === "awaiting"
              ? { kaspi_qr_in_card: true }
              : {}),
          }
        : null,
    }
  },
}
