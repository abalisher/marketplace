import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { KASPI_PROVIDER_ID } from "../../../modules/payment-kaspi"
import type { SelectablePaymentMethod } from "../../../modules/order-payment/models/values"
import { loadCartPaymentView, CartPaymentView } from "../../payments/cart-payment-view"
import { initCartOfflinePaymentWorkflow } from "../../../workflows/payments/init-cart-offline-payment"
import { syncCartKaspiPaymentWorkflow } from "../../../workflows/sync-cart-kaspi-payment"
import { AssistantContext, AssistantTool, PaymentAttachment } from "../types"
import { requireLogin } from "./buyer-identity"

// Инструмент ассистента «оплата». Способы — те, что принимает продавец витрины
// (настройки оплаты его канала): Kaspi QR, перевод на номер Kaspi продавца,
// «в долг» (просьба; решает продавец). Kaspi QR в чате оплачивается ПОСЛЕ
// оформления, как перевод (решение владельца 2026-11-02): заказ оформляется
// сразу, счёт Kaspi с QR выставляется на заказ и виден в карточке оплаты заказа
// со ссылкой на сам заказ. Тонкая обёртка над
// workflow'ами выбора способа (init-cart-kaspi-payment, init-cart-offline-
// payment) и опроса Kaspi (sync-cart-kaspi-payment).
//
// ВХОД ОБЯЗАТЕЛЕН (T10.8): деньги и заказ принадлежат учётке покупателя. В
// workflow'ы идём напрямую, минуя store-роуты: корзину ассистент ведёт сам, и
// владение ею подтверждает cart_id (капабилити-токен, как messages).

const METHODS: SelectablePaymentMethod[] = ["kaspi_qr", "kaspi_transfer", "debt"]

const PROVIDER: Record<SelectablePaymentMethod, PaymentAttachment["provider"]> = {
  kaspi_qr: "kaspi",
  kaspi_transfer: "kaspi_transfer",
  debt: "debt",
}

const UNAVAILABLE_TEXT: Record<string, string> = {
  disabled: "продавец не принимает этот способ",
  kaspi_not_connected: "оплата Kaspi у продавца ещё не подключена",
  transfer_no_phone: "продавец не указал номер для перевода",
  debt_over_limit: "сумма заказа больше лимита, который продавец даёт в долг",
  kaspi_already_paid: "счёт Kaspi уже оплачен — сменить способ нельзя, оформляй заказ",
}

// Вставка оплаты корзины: Kaspi QR — код и ссылка (пока не оплачен), перевод —
// сумма (реквизиты придут с номером заказа после оформления), долг — сумма.
const cartAttachment = (view: CartPaymentView): PaymentAttachment | null => {
  const selected = view.selected
  // Kaspi QR после оформления: у корзины счёта нет — QR придёт карточкой
  // оплаты заказа после place_order.
  if (!selected || selected.deferred) {
    return null
  }
  const paid =
    selected.method === "kaspi_qr" &&
    (selected.status === "authorized" || selected.status === "captured")
  return {
    type: "payment",
    provider: PROVIDER[selected.method],
    status: selected.status,
    paid,
    amount: Math.round(view.amount),
    currency: view.currency_code,
    qr_payload: selected.qr_payload,
    payment_url: selected.payment_url,
    order_display_id: null,
    transfer: null,
    due_date: null,
  }
}

// Ответ модели: что принимает продавец, что выбрано, можно ли оформлять.
// Список способов (action='methods') ещё и кнопками под ответом: выключенные
// продавцом способы покупателю не показываем вовсе, недоступный по сумме —
// неактивной кнопкой с причиной.
const toReply = (
  view: CartPaymentView,
  context: AssistantContext,
  withButtons = false
) => {
  // Список способов — это выбор (в том числе смена уже выбранного): под ответом
  // кнопки, а не карточка выбранного способа. Оплаченный Kaspi сменить нельзя —
  // тогда карточка оплаты.
  const paidKaspi =
    view.selected?.method === "kaspi_qr" &&
    !view.selected.deferred &&
    view.ready_to_place
  const attachment = withButtons && !paidKaspi ? null : cartAttachment(view)
  if (attachment) {
    context.attachments?.push(attachment)
  }
  const offered = view.methods.filter((option) => option.reason !== "disabled")
  if (withButtons && !attachment && offered.length) {
    context.attachments?.push({
      type: "payment_methods",
      amount: Math.round(view.amount),
      currency: view.currency_code,
      methods: offered.map((option) => ({
        method: option.method,
        available: option.available,
        reason: option.reason,
      })),
      debt_term_days: view.debt?.term_days ?? null,
      debt_max_amount: view.debt?.max_amount ?? null,
    })
  }
  return {
    amount: Math.round(view.amount),
    currency: view.currency_code,
    methods: view.methods.map((option) => ({
      method: option.method,
      available: option.available,
      ...(option.reason ? { why_not: UNAVAILABLE_TEXT[option.reason] } : {}),
    })),
    selected: view.selected
      ? {
          method: view.selected.method,
          paid: attachment?.paid ?? false,
          // Kaspi QR: оплата после оформления — счёт будет на заказе.
          ...(view.selected.deferred ? { pay_after_order: true } : {}),
          // QR магазина: суммы в нём нет — покупатель вводит её сам и присылает чек.
          ...(view.selected.method === "kaspi_qr" && view.kaspi_static_qr
            ? { shop_qr_enter_amount_and_send_receipt: true }
            : {}),
        }
      : null,
    // Условия долга — чтобы назвать их покупателю.
    debt_terms: view.debt
      ? { max_amount: view.debt.max_amount, term_days: view.debt.term_days }
      : null,
    ready_to_place_order: view.ready_to_place,
  }
}

export const checkoutPaymentTool: AssistantTool = {
  declaration: {
    name: "checkout_payment",
    description:
      "Оплата заказа. Способы задаёт продавец: kaspi_qr — Kaspi QR (заказ " +
      "оформляется сразу, счёт Kaspi с QR выставляется на заказ и показывается " +
      "в карточке под ответом), kaspi_transfer — перевод на номер Kaspi продавца " +
      "(заказ оформляется сразу, номер для перевода покупатель получит с номером " +
      "заказа), debt — просьба в долг (заказ оформляется, продавец решает при " +
      "подтверждении). action='methods' — какие способы доступны для этой " +
      "корзины. action='select' с method — выбрать способ. action='check' — " +
      "проверить оплату старого счёта Kaspi корзины (ready_to_place_order=true " +
      "— можно оформлять через place_order). " +
      "Вызывай, когда адрес доставки уже задан через set_delivery.",
    parameters: {
      type: "OBJECT",
      properties: {
        action: {
          type: "STRING",
          enum: ["methods", "select", "check"],
          description:
            "methods — способы оплаты; select — выбрать способ; check — статус старого счёта Kaspi корзины.",
        },
        method: {
          type: "STRING",
          enum: METHODS,
          description: "Способ оплаты для action='select'.",
        },
      },
      required: ["action"],
    },
  },
  execute: async (
    container: MedusaContainer,
    args: Record<string, unknown>,
    context: AssistantContext
  ): Promise<Record<string, unknown>> => {
    if (!context.cartId) {
      return {
        error:
          "Нет корзины. Сначала собери корзину и задай доставку (set_delivery).",
      }
    }

    // Гейт входа (T10.8): способ оплаты и заказ — только вошедшему покупателю,
    // иначе оплаченная корзина осталась бы ничьей.
    if (!context.customerId) {
      return requireLogin(
        context,
        "Оплата доступна после входа по номеру телефона. Кнопка входа уже " +
          "показана покупателю в чате — попроси его войти, корзина сохранится."
      )
    }

    const action = args.action === "select" || args.action === "check"
      ? args.action
      : "methods"
    const cartId = context.cartId

    if (action === "select") {
      const method = args.method as SelectablePaymentMethod
      if (!METHODS.includes(method)) {
        return { error: "Укажи method: kaspi_qr, kaspi_transfer или debt." }
      }
      try {
        // Все три способа — «обещание оплатить» у корзины; Kaspi QR получит
        // счёт уже на заказ (place_order).
        await initCartOfflinePaymentWorkflow(container).run({
          input: { cart_id: cartId, method },
          throwOnError: true,
        })
      } catch (e) {
        const message = (e as Error).message ?? ""
        const reason = /payment_method_unavailable:(\w+)/.exec(message)?.[1]
        if (reason || (e instanceof MedusaError && e.type === MedusaError.Types.NOT_ALLOWED)) {
          return {
            error: `Этот способ сейчас недоступен: ${UNAVAILABLE_TEXT[reason ?? "disabled"] ?? message}. Предложи другой из methods.`,
          }
        }
        throw e
      }
    }

    if (action === "check") {
      const before = await loadCartPaymentView(container, cartId)
      if (!before?.selected) {
        return { error: "Способ оплаты ещё не выбран. Вызови action='select'." }
      }
      if (before.selected.method === "kaspi_qr") {
        const session = await findKaspiSession(container, cartId)
        if (session) {
          await syncCartKaspiPaymentWorkflow(container).run({
            input: { payment_session_id: session },
            throwOnError: true,
          })
        }
      }
    }

    const view = await loadCartPaymentView(container, cartId)
    if (!view) {
      return { error: "Корзина не найдена." }
    }
    return toReply(view, context, action === "methods")
  },
}

// Id Kaspi-сессии корзины для опроса статуса.
const findKaspiSession = async (
  container: MedusaContainer,
  cartId: string
): Promise<string | null> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: [
      "payment_collection.payment_sessions.id",
      "payment_collection.payment_sessions.provider_id",
    ],
    filters: { id: cartId },
  })
  const sessions =
    (data[0] as { payment_collection?: { payment_sessions?: { id: string; provider_id: string }[] } })
      ?.payment_collection?.payment_sessions ?? []
  return sessions.find((s) => s.provider_id === KASPI_PROVIDER_ID)?.id ?? null
}
