// Типы dev-канала оплаты Kaspi в панели (GET/POST /admin/kaspi-mock-payments).
// Экран — routes/settings/kaspi-payments; на стенде мок Kaspi не умеет
// «оплатить» сам, поэтому оплату подтверждает оператор (T12.23).

export type AdminKaspiMockPayment = {
  payment_session_id: string
  /** Корзина, за которую выставлен счёт (data.reference сессии). */
  cart_id: string | null
  invoice_id: string | null
  kaspi_state: string | null
  status: string
  amount: number
  currency_code: string
  created_at: string | null
  customer_name: string | null
  customer_phone: string | null
  /** Корзина уже оформлена в заказ — счёт остался хвостом. */
  cart_completed: boolean
}

export type AdminKaspiMockPaymentsResponse = {
  /** false — Kaspi в live-режиме: подтверждать оплату из панели нельзя. */
  mock_mode: boolean
  payments: AdminKaspiMockPayment[]
}

export type AdminKaspiMockPayResponse = {
  payment: {
    payment_session_id: string
    status: string
    kaspi_state: string | null
    cart_id: string | null
  }
}
