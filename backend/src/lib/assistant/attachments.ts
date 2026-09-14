import { AssistantAttachment } from "./types"

// Вставки копятся за ход по всем вызовам инструментов, и одна и та же вставка
// может прийти несколько раз: guard'ов оформления за ход срабатывает несколько,
// а статус оплаты за ход успевает смениться.
//
// Правила свёртки:
//  * auth_prompt — просьба войти: одна на ход, стоит последней (это следующий
//    шаг покупателя, а не описание того, что уже произошло);
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
  let orderStatus: AssistantAttachment | undefined
  let documents: AssistantAttachment | undefined
  let authPrompt: AssistantAttachment | undefined

  for (const attachment of attachments) {
    switch (attachment.type) {
      case "payment":
        payment = attachment
        break
      case "order_status":
        orderStatus = attachment
        break
      case "documents":
        documents = attachment
        break
      case "auth_prompt":
        authPrompt = attachment
        break
    }
  }

  // Заказ оформлен на этом ходе — платёжной карточке в ленте больше нечего
  // делать: счёт закрыт, дальше покупателя интересует заказ (замечание владельца
  // на приёмке 2026-08-11 — под сообщением «заказ №34 оформлен» продолжала
  // висеть карточка Kaspi с QR).
  const keepPayment = options.orderPlaced ? undefined : payment

  return [
    ...(keepPayment ? [keepPayment] : []),
    ...(orderStatus ? [orderStatus] : []),
    ...(documents ? [documents] : []),
    ...(authPrompt ? [authPrompt] : []),
  ]
}
