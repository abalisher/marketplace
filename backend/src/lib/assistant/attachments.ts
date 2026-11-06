import { AssistantAttachment } from "./types"

// Вставки копятся за ход по всем вызовам инструментов, и одна и та же вставка
// может прийти несколько раз: guard'ов оформления за ход срабатывает несколько,
// а статус оплаты за ход успевает смениться.
//
// Правила свёртки:
//  * auth_prompt — просьба войти: одна на ход, стоит последней (это следующий
//    шаг покупателя, а не описание того, что уже произошло);
//  * delivery_slots — кнопки окон доставки: последние и только пока слот не
//    выбран (на ходе не дошли до оплаты) и заказ не оформлен;
//  * payment_methods — кнопки способов оплаты: последние и только пока способ
//    не выбран на этом ходе и заказ не оформлен;
//  * order_payment — оплата оформленного заказа: последняя, в том числе на
//    ходе оформления (её и показывают сразу после заказа);
//  * payment, order_status и documents — состояние, а не список: оставляем
//    ПОСЛЕДНЮЮ, потому что за ход состояние могло измениться (pending →
//    authorized, документ выпустился), и показать надо свежее.
//
// Карточек подбора (product_card) среди вставок больше нет — T10.19,
// DECISIONS 2026-09-14.
export const dedupeAttachments = (
  attachments: AssistantAttachment[],
  options: { orderPlaced?: boolean } = {}
): AssistantAttachment[] => {
  let payment: AssistantAttachment | undefined
  let paymentMethods: AssistantAttachment | undefined
  let deliverySlots: AssistantAttachment | undefined
  let orderPayment: AssistantAttachment | undefined
  let orderStatus: AssistantAttachment | undefined
  let documents: AssistantAttachment | undefined
  let deliveryForm: AssistantAttachment | undefined
  let authPrompt: AssistantAttachment | undefined

  for (const attachment of attachments) {
    switch (attachment.type) {
      case "payment":
        payment = attachment
        break
      case "payment_methods":
        paymentMethods = attachment
        break
      case "delivery_slots":
        deliverySlots = attachment
        break
      case "order_payment":
        orderPayment = attachment
        break
      case "order_status":
        orderStatus = attachment
        break
      case "documents":
        documents = attachment
        break
      case "delivery_form":
        deliveryForm = attachment
        break
      case "auth_prompt":
        authPrompt = attachment
        break
    }
  }

  // Заказ оформлен на этом ходе — карточке счёта в ленте больше нечего делать:
  // счёт закрыт, дальше покупателя интересует заказ (замечание владельца на
  // приёмке 2026-08-11 — под сообщением «заказ №34 оформлен» продолжала висеть
  // карточка Kaspi с QR). Остаётся только карточка оплаты САМОГО заказа
  // (перевод по номеру, долг): куда переводить и какой номер написать.
  const keepPayment =
    options.orderPlaced &&
    !(payment?.type === "payment" && payment.order_display_id != null)
      ? undefined
      : payment
  const keepDeliveryForm = options.orderPlaced ? undefined : deliveryForm

  // Кнопки способов оплаты нужны, пока способ не выбран: выбрали на этом же
  // ходе (пришла карточка оплаты) или оформили заказ — кнопкам делать нечего.
  const keepMethods = options.orderPlaced || payment ? undefined : paymentMethods

  // Кнопки слотов — пока слот не выбран: на том же ходе дошли до оплаты или
  // оформили заказ — им делать нечего.
  const keepSlots =
    options.orderPlaced || payment || paymentMethods ? undefined : deliverySlots

  return [
    ...(keepSlots ? [keepSlots] : []),
    ...(keepMethods ? [keepMethods] : []),
    ...(keepPayment ? [keepPayment] : []),
    ...(orderPayment ? [orderPayment] : []),
    ...(orderStatus ? [orderStatus] : []),
    ...(documents ? [documents] : []),
    ...(keepDeliveryForm ? [keepDeliveryForm] : []),
    ...(authPrompt ? [authPrompt] : []),
  ]
}

