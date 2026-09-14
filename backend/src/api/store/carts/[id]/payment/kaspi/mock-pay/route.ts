import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { KASPI_PROVIDER_ID } from "../../../../../../../modules/payment-kaspi"
import { resolveMode } from "../../../../../../../modules/payment-kaspi/create-kaspi-client"
import { setMockInvoiceState } from "../../../../../../../modules/payment-kaspi/kaspi-mock-client"
import { syncCartKaspiPaymentWorkflow } from "../../../../../../../workflows/sync-cart-kaspi-payment"
import { toKaspiPaymentResponse } from "../../../../../../utils/kaspi-payment-response"
import { requireCartPaymentAccess } from "../../../../cart-payment-access"

// POST /store/carts/:id/payment/kaspi/mock-pay — DEV-ТОЛЬКО (T8.6): отмечает
// созданный мок-инвойс оплаченным, как если бы плательщик подтвердил оплату в
// приложении Kaspi. Нужно потому, что исход мока задаётся ТОЛЬКО при создании
// инвойса (`scenario` в POST), а ассистент всегда создаёт `pending` — без этого
// роута сквозной путь «чат → оплата → заказ» на стенде не пройти руками
// (публичной песочницы Kaspi нет).
//
// Границы: вне `KASPI_MODE=mock` роут отвечает 404 — в live-режиме способа
// «подтвердить оплату» из нашего API не существует. Состояние живёт в памяти
// процесса (см. kaspi-mock-client), в домен не попадает. В контракт
// (contracts/openapi.json) роут НЕ выносится: в проде его нет, клиентам знать о
// нём нечего — вызывается вручную или скриптом `scripts/kaspi-mock-pay.mjs`.
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  if (resolveMode() !== "mock") {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Not found")
  }

  const cart = await requireCartPaymentAccess(
    req.scope,
    req.params.id,
    req.auth_context?.actor_id
  )

  const kaspiSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.provider_id === KASPI_PROVIDER_ID
  )
  if (!kaspiSession) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Kaspi payment is not initialized for this cart"
    )
  }

  const invoiceId = (kaspiSession.data as { kaspi_invoice_id?: string })
    ?.kaspi_invoice_id
  if (!invoiceId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Kaspi payment session is missing kaspi_invoice_id"
    )
  }

  setMockInvoiceState(invoiceId, "paid")

  // Дальше — обычная синхронизация (тот же workflow, что у поллинга): сессия
  // увидит `paid` через транспорт и перейдёт в authorized.
  const { result } = await syncCartKaspiPaymentWorkflow(req.scope).run({
    input: { payment_session_id: kaspiSession.id },
    throwOnError: true,
  })

  res.json({
    payment: toKaspiPaymentResponse({
      payment_collection_id: cart.payment_collection!.id,
      session: result,
    }),
  })
}
