"use client"

import { AssistantAttachment } from "@lib/data/assistant"
import AuthPromptAttachment from "@modules/assistant/components/auth-prompt-attachment"
import DocumentsAttachment from "@modules/assistant/components/documents-attachment"
import OrderStatusAttachment from "@modules/assistant/components/order-status-attachment"
import PaymentAttachment from "@modules/assistant/components/payment-attachment"

// Вставки хода под ответом ассистента. Разбор — по дискриминатору `type`
// контракта; неизвестный тип молча пропускается (бэкенд может добавить новый
// раньше клиента — лента не должна падать). Карточек подбора здесь больше нет
// (T10.19): выбор идёт текстом, количество правится в полосе корзины.
const AttachmentList = ({
  attachments,
  cartId,
  orderId,
  isAuthenticated,
  onPaid,
}: {
  attachments: AssistantAttachment[]
  cartId?: string
  orderId?: string
  isAuthenticated?: boolean
  onPaid?: () => void
}) => {
  if (attachments.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3" data-testid="assistant-attachments">
      {attachments.map((attachment, index) => {
        switch (attachment.type) {
          case "payment":
            return (
              <PaymentAttachment
                key={`payment-${index}`}
                payment={attachment}
                cartId={cartId}
                onPaid={onPaid}
              />
            )
          case "order_status":
            return (
              <OrderStatusAttachment
                key={`order-${index}`}
                order={attachment}
                orderId={orderId}
                isAuthenticated={isAuthenticated}
              />
            )
          case "documents":
            return (
              <DocumentsAttachment
                key={`documents-${index}`}
                attachment={attachment}
              />
            )
          case "auth_prompt":
            // Рисуем ВСЕГДА. Раньше карточку прятал признак входа со страницы,
            // и при истёкшем токене (дефект приёмки 2026-09-07) покупатель
            // оказывался в тупике: витрина считала его вошедшим, бэкенд — нет,
            // ассистент просил войти, а кнопки входа не было. Просьба войти
            // приходит только от бэкенда и только когда он покупателя не
            // узнал — это и есть правда о сессии.
            return <AuthPromptAttachment key={`auth-${index}`} />
          default:
            return null
        }
      })}
    </div>
  )
}

export default AttachmentList
