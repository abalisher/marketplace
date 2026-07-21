// Единый вид ответа Kaspi-роутов оплаты корзины (store: покупатель в чекауте,
// admin: продавец у окна): идентификаторы + статус сессии ядра + Kaspi-поля из
// data сессии (QR/ссылка для показа плательщику).

export type KaspiPaymentSource = {
  payment_collection_id: string
  session: { id: string; status: string; data: Record<string, unknown> }
}

export function toKaspiPaymentResponse(source: KaspiPaymentSource) {
  const data = source.session.data
  return {
    payment_collection_id: source.payment_collection_id,
    payment_session_id: source.session.id,
    status: source.session.status,
    kaspi_state: (data.kaspi_state as string | undefined) ?? null,
    qr_payload: (data.qr_payload as string | undefined) ?? null,
    payment_url: (data.payment_url as string | undefined) ?? null,
  }
}
