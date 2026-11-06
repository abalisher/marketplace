import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { LOGISTICS_MODULE } from "../../../modules/logistics"
import LogisticsModuleService from "../../../modules/logistics/service"
import { REVIEWS_MODULE } from "../../../modules/reviews"
import ReviewsModuleService from "../../../modules/reviews/service"
import {
  DeliverySlot,
  formatDeliverySlot,
  isDeliveryWindow,
  isSlotDate,
} from "../../logistics/delivery-slots"
import { AssistantContext, AssistantTool, OrderStatusAttachment } from "../types"
import { DISPUTE_OUTCOME_TEXT, DISPUTE_STATUS_TEXT } from "./dispute-status"
import { loadBuyerOrderPayment } from "../../payments/order-payment-buyer-view"
import { settleOrderKaspiPaymentWorkflow } from "../../../workflows/payments/settle-order-kaspi-payment"

// Инструмент ассистента «отследить заказ» (срез после оформления). Читает статус
// последнего оформленного заказа (order-lifecycle) и — если доставка уже
// планируется — прогресс курьера из модуля logistics (точка рейса заказа).
// Логику модулей НЕ дублируем, только читаем через query.graph / сервис logistics.
//
// БЕЗОПАСНОСТЬ (гостевой флоу, DECISIONS 2026-07-23): отслеживаем ТОЛЬКО заказ из
// context.lastOrderId (его проставил place_order, клиент держит и шлёт обратно, как
// cart_id). Инструмент НЕ принимает произвольный номер заказа: display_id
// последователен и угадываем — гость мог бы перечислять чужие заказы и увидеть код
// получения/адрес. Внутренний id случаен → владение им = право смотреть статус.
// У вошедшего покупателя без токена оркестратор подставляет его последний заказ
// на витрине (lib/assistant/last-order.ts).

// Бизнес-статус заказа → короткая русская формулировка для чата (принцип #8: модель
// не гадает по коду; сырой код тоже отдаём — вдруг понадобится).
const STATUS_TEXT: Record<string, string> = {
  new: "Заказ принят, ожидает подтверждения",
  confirmed: "Заказ подтверждён",
  assembling: "Собираем заказ",
  partially_assembled: "Заказ собран частично",
  assembled: "Заказ собран, готов к доставке",
  in_delivery: "Заказ в доставке",
  delivered: "Заказ доставлен",
  closed: "Заказ завершён",
  canceled: "Заказ отменён",
  returned: "Оформлен возврат",
}

// Статус точки доставки в рейсе → формулировка прогресса курьера.
const COURIER_STAGE: Record<string, string> = {
  pending: "Курьер назначен, ожидает выезда",
  arrived: "Курьер прибыл по адресу доставки",
  done: "Заказ вручён",
}

type OrderRow = {
  id: string
  display_id?: number | null
  order_lifecycle?: {
    number?: string | null
    status?: string | null
    delivery_code?: string | null
    delivery_method?: string | null
    delivery_date?: string | null
    delivery_window?: string | null
  } | null
}

// Слот заказа для ответа «когда привезут» (T5.6). Заказы, оформленные до
// появления слотов, его не имеют — тогда null, и ассистент про срок молчит,
// а не выдумывает окно.
const readSlot = (row: OrderRow): DeliverySlot | null => {
  const date = row.order_lifecycle?.delivery_date
  const window = row.order_lifecycle?.delivery_window
  return isSlotDate(date) && isDeliveryWindow(window) ? { date, window } : null
}

// Прогресс курьера из logistics по точке доставки заказа (если рейс уже создан).
// order_id в trip_stop — опазная колонка, поэтому читаем через сервис модуля.
const readCourier = async (
  container: MedusaContainer,
  orderId: string
): Promise<Record<string, unknown> | null> => {
  const service =
    container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
  const stops = await service.listTripStops({
    order_id: orderId,
    type: "delivery",
  })
  const stop = stops[0] as { status?: string } | undefined
  if (!stop) {
    return null
  }
  return {
    courier_assigned: true,
    stage: COURIER_STAGE[stop.status ?? ""] ?? stop.status ?? null,
  }
}

// Последняя претензия покупателя по заказу — чтобы на «что там с моей жалобой»
// ассистент отвечал фактом, а не памятью диалога (Ф-прогон 2026-08-13: про
// претензии он не знал вовсе). Решение оператора отдаём вместе со статусом:
// покупателю важен именно ответ магазина.
const readDispute = async (
  container: MedusaContainer,
  orderId: string
): Promise<Record<string, unknown> | null> => {
  const service = container.resolve<ReviewsModuleService>(REVIEWS_MODULE)
  const [dispute] = (await service.listDisputes(
    { order_id: orderId },
    { order: { created_at: "DESC" }, take: 1 }
  )) as {
    category?: string
    status?: string
    resolution?: string | null
    outcome?: string | null
  }[]

  if (!dispute) {
    return null
  }
  return {
    category: dispute.category ?? null,
    status: dispute.status ?? null,
    status_text: DISPUTE_STATUS_TEXT[dispute.status ?? ""] ?? null,
    resolution: dispute.resolution ?? null,
    // Что покупатель получает по решению: возврат, довоз, замена, бонусы или
    // ничего. До закрытия претензии — null.
    outcome: dispute.outcome ?? null,
    outcome_text: dispute.outcome
      ? (DISPUTE_OUTCOME_TEXT[dispute.outcome] ?? null)
      : null,
  }
}

export const trackOrderTool: AssistantTool = {
  declaration: {
    name: "track_order",
    description:
      "Отследить статус последнего оформленного заказа: на какой стадии заказ " +
      "(принят/собирается/в доставке/доставлен) и прогресс курьера, если доставка " +
      "уже началась. Возвращает также код получения — покупатель называет его " +
      "курьеру при вручении. Вызывай, когда покупатель спрашивает «где мой заказ».",
    parameters: { type: "OBJECT", properties: {}, required: [] },
  },
  execute: async (
    container: MedusaContainer,
    _args: Record<string, unknown>,
    context: AssistantContext
  ): Promise<Record<string, unknown>> => {
    if (!context.lastOrderId) {
      return {
        error: context.customerId
          ? "У покупателя нет заказов на этой витрине."
          : "Покупатель не вошёл: его заказы видны после входа по номеру телефона.",
      }
    }

    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "order_lifecycle.number",
        "order_lifecycle.status",
        "order_lifecycle.delivery_code",
        "order_lifecycle.delivery_method",
        "order_lifecycle.delivery_date",
        "order_lifecycle.delivery_window",
      ],
      filters: { id: context.lastOrderId },
    })
    const order = (data as OrderRow[])[0]

    if (!order) {
      return { error: "Заказ не найден." }
    }

    const status = order.order_lifecycle?.status ?? null
    const courier = await readCourier(container, order.id)
    const dispute = await readDispute(container, order.id)
    const statusText = status ? STATUS_TEXT[status] ?? status : null
    const deliveryCode = order.order_lifecycle?.delivery_code ?? null
    const slot = readSlot(order)

    // Read-only вставка «статус заказа» для ленты чата. Стадия — КОД статуса
    // жизненного цикла (клиент рисует по нему степпер и подписывает бейдж на
    // своём языке), прогресс курьера идёт отдельным полем: раньше в
    // `delivery_stage` лежала русская фраза о курьере, поэтому у свежего заказа
    // степпер не рисовался вовсе (находка гейта U T3.9).
    const attachment: OrderStatusAttachment = {
      type: "order_status",
      display_id: order.display_id ?? null,
      order_number: order.order_lifecycle?.number ?? null,
      status_text: statusText,
      delivery_stage: status,
      courier_note: (courier?.stage as string | undefined) ?? null,
      delivery_code: deliveryCode,
      // Слот — в саму вставку (T5.6a): раньше «когда привезут» жило только в
      // тексте ответа модели, и в ленте оставалась карточка без срока.
      delivery_date: slot?.date ?? null,
      delivery_window: slot?.window ?? null,
    }
    context.attachments?.push(attachment)

    // Оплата заказа: счёт Kaspi заказа сверяем с банком (как страница заказа),
    // поэтому на «оплатил» ответ честный. Ждём денег — под ответом снова
    // карточка оплаты (QR Kaspi, номер для перевода) со ссылкой на заказ.
    // Сбой чтения оплаты статус заказа не ломает: о стадии и сроке покупатель
    // узнает всё равно.
    const payment = await readOrderPayment(container, order.id)
    if (payment && ["awaiting", "debt"].includes(payment.status)) {
      context.attachments?.push({
        type: "order_payment",
        order_id: order.id,
        display_id: order.display_id ?? null,
        order_number: order.order_lifecycle?.number ?? null,
      })
    }

    return {
      order: {
        // Номер для покупателя — number («ORG-26-0007»); display_id технический.
        number: order.order_lifecycle?.number ?? null,
        display_id: order.display_id ?? null,
        status,
        status_text: statusText,
        delivery_code: deliveryCode,
        // Пустой код модель раньше «дозаполняла» четырьмя цифрами и даже
        // объясняла их происхождение (прогон 2026-08-13). Говорим прямым
        // текстом, что называть нечего.
        delivery_code_note: deliveryCode
          ? null
          : "Кода получения пока нет — он появляется, когда заказ передают " +
            "курьеру. Не называй никаких цифр покупателю.",
      },
      delivery: courier,
      // Слот, который покупатель выбрал при оформлении: на вопрос «когда
      // привезут» отвечаем им, а не общими словами про «свяжется водитель».
      slot: slot
        ? {
            date: slot.date,
            window: slot.window,
            label: formatDeliverySlot(slot, new Date()),
          }
        : null,
      // null — претензий по заказу нет; тогда о них и не заговаривай сам.
      dispute,
      // Оплата: paid — деньги получены; awaiting — ждём (Kaspi QR — по QR в
      // карточке под ответом, перевод — на номер продавца).
      payment: payment
        ? {
            method: payment.method,
            status: payment.status,
            to_pay: Math.round(payment.outstanding),
          }
        : null,
    }
  },
}

const readOrderPayment = async (container: MedusaContainer, orderId: string) => {
  try {
    await settleOrderKaspiPaymentWorkflow(container).run({
      input: { order_id: orderId },
      throwOnError: true,
    })
    return await loadBuyerOrderPayment(container, orderId)
  } catch {
    return null
  }
}
