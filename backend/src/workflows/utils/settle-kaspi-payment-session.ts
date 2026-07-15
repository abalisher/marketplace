import type {
  IPaymentModuleService,
  PaymentSessionDTO,
} from "@medusajs/framework/types"

// Доводит Kaspi-сессию до актуального статуса: пока сессия не финальна,
// пробует авторизацию ядром (authorizePaymentSession → provider.authorizePayment
// → KaspiClient.getInvoiceStatus — это и есть polling инвойса). Если покупатель
// оплатил — сессия становится authorized и ядро создаёт Payment; если ещё нет —
// сессия остаётся pending, ошибка авторизации НЕ пробрасывается (не оплачено —
// штатное состояние опроса, а не сбой). Возвращает перечитанную сессию.
export async function settleKaspiPaymentSession(
  paymentService: IPaymentModuleService,
  paymentSessionId: string
): Promise<PaymentSessionDTO> {
  const session = await paymentService.retrievePaymentSession(paymentSessionId)
  if (session.status !== "pending" && session.status !== "requires_more") {
    return session
  }

  try {
    await paymentService.authorizePaymentSession(paymentSessionId, {})
  } catch {
    // Не оплачено/отклонено эквайером — фактический статус перечитаем ниже.
  }
  return paymentService.retrievePaymentSession(paymentSessionId)
}
