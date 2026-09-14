import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { KASPI_PROVIDER_ID } from "../../../modules/payment-kaspi"
import { initCartKaspiPaymentWorkflow } from "../../../workflows/init-cart-kaspi-payment"
import { syncCartKaspiPaymentWorkflow } from "../../../workflows/sync-cart-kaspi-payment"
import { AssistantContext, AssistantTool, PaymentAttachment } from "../types"
import { requireLogin } from "./buyer-identity"

// Инструмент ассистента «оплата Kaspi» (срез 5, подзадача 2 — ДЕНЬГИ). Тонкая
// обёртка над готовыми workflow'ами оплаты корзины (init/sync-cart-kaspi-payment):
// action=start → создаёт payment collection + Kaspi-сессию (QR), action=check →
// синхронизирует статус (оплачено → authorized, можно оформлять заказ).
//
// ВХОД ОБЯЗАТЕЛЕН (T10.8, решение владельца 2026-08-25): гостевой checkout,
// который жил здесь с 2026-07-23, отменён — деньги и заказ принадлежат учётке
// покупателя. Гость получает в ленте кнопку входа по номеру. В workflow'ы
// по-прежнему идём НАПРЯМУЮ, минуя store-роут `/store/carts/:id/payment/kaspi`:
// корзину ассистент ведёт сам и владение ею подтверждает cart_id (капабилити-
// токен, как messages), а роут гейтит корзину по своей идиоме.

type SessionRow = {
  id: string
  provider_id: string
  status: string
  data?: Record<string, unknown>
}

type CartPaymentView = {
  session: SessionRow | null
  // Итог корзины в тенге + валюта — сумма платёжного блока (макет 1c).
  total: number | null
  currency: string
}

// Kaspi-сессия корзины (если оплата уже инициирована) + итог/валюта корзины.
const readCartPayment = async (
  container: MedusaContainer,
  cartId: string
): Promise<CartPaymentView> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "total",
      "currency_code",
      "payment_collection.payment_sessions.id",
      "payment_collection.payment_sessions.provider_id",
      "payment_collection.payment_sessions.status",
      "payment_collection.payment_sessions.data",
    ],
    filters: { id: cartId },
  })
  const cart = (
    data as {
      total?: number | string
      currency_code?: string
      payment_collection?: { payment_sessions?: SessionRow[] }
    }[]
  )[0]
  const sessions = cart?.payment_collection?.payment_sessions ?? []
  const total = Number(cart?.total)
  return {
    session: sessions.find((s) => s.provider_id === KASPI_PROVIDER_ID) ?? null,
    total: Number.isFinite(total) ? Math.round(total) : null,
    currency: cart?.currency_code ?? "kzt",
  }
}

// Read-only платёжная вставка для чата (Kaspi QR + сумма + статус). Внутренние
// id (сессия/коллекция) наружу не тянем — плумбинг (принцип #8).
const PAID_STATUSES = new Set(["authorized", "captured"])

const paymentAttachment = (
  session: SessionRow,
  cart: CartPaymentView
): PaymentAttachment => {
  const d = session.data ?? {}
  const paid = PAID_STATUSES.has(session.status)
  return {
    type: "payment",
    provider: "kaspi",
    status: session.status,
    paid,
    amount: cart.total,
    currency: cart.currency,
    // Оплаченному счёту QR и ссылка не нужны: сканировать нечего, а карточка с
    // кодом читается как «оплати ещё раз» (замечание владельца на приёмке
    // 2026-08-11: «почему QR не исчез после оплаты?»). Клиенты рисуют код
    // только когда он пришёл — правка паритетна для mobile и витрины.
    qr_payload: paid ? null : (d.qr_payload as string | undefined) ?? null,
    payment_url: paid ? null : (d.payment_url as string | undefined) ?? null,
  }
}

// Ответ модели: статус + флаг оплаты + сумма + QR/ссылка. Кладёт ту же вставку
// в контекст (клиент нарисует карточку оплаты) и возвращает объект для
// функции-ответа модели.
const toReply = (
  session: SessionRow,
  cart: CartPaymentView,
  context: AssistantContext
): Record<string, unknown> => {
  const attachment = paymentAttachment(session, cart)
  context.attachments?.push(attachment)
  const { type: _t, provider: _p, ...payment } = attachment
  return { payment }
}

export const checkoutKaspiTool: AssistantTool = {
  declaration: {
    name: "checkout_kaspi",
    description:
      "Оплата заказа через Kaspi. action='start' — создать счёт и получить QR/" +
      "ссылку для оплаты (вызывай, когда адрес доставки уже задан через " +
      "set_delivery). action='check' — проверить, оплачено ли (поле paid=true, " +
      "когда оплата прошла — тогда можно оформлять заказ через place_order). " +
      "Покупатель платит вне чата, поэтому статус нужно перепроверять.",
    parameters: {
      type: "OBJECT",
      properties: {
        action: {
          type: "STRING",
          enum: ["start", "check"],
          description: "start — начать оплату (QR); check — проверить статус.",
        },
      },
      required: [],
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

    // Гейт входа (T10.8): счёт выставляем только вошедшему покупателю — иначе
    // оплаченная корзина осталась бы ничьей.
    if (!context.customerId) {
      return requireLogin(
        context,
        "Оплата доступна после входа по номеру телефона. Кнопка входа уже " +
          "показана покупателю в чате — попроси его войти, корзина сохранится."
      )
    }
    const action = args.action === "check" ? "check" : "start"

    if (action === "check") {
      const cart = await readCartPayment(container, context.cartId)
      if (!cart.session) {
        return {
          error:
            "Оплата ещё не начата. Вызови checkout_kaspi с action='start'.",
        }
      }
      const { result } = await syncCartKaspiPaymentWorkflow(container).run({
        input: { payment_session_id: cart.session.id },
        throwOnError: true,
      })
      return toReply(result as SessionRow, cart, context)
    }

    // start — инициализация (идемпотентна: повторный вызов вернёт ту же сессию).
    await initCartKaspiPaymentWorkflow(container).run({
      input: { cart_id: context.cartId },
      throwOnError: true,
    })
    const cart = await readCartPayment(container, context.cartId)
    if (!cart.session) {
      return {
        error: "Не удалось создать счёт на оплату. Попробуй ещё раз.",
      }
    }
    return toReply(cart.session, cart, context)
  },
}
