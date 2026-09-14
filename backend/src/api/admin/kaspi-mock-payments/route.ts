import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import type { PaymentSessionDTO } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { KASPI_PROVIDER_ID } from "../../../modules/payment-kaspi"
import { resolveMode } from "../../../modules/payment-kaspi/create-kaspi-client"
import { setMockInvoiceState } from "../../../modules/payment-kaspi/kaspi-mock-client"
import { syncCartKaspiPaymentWorkflow } from "../../../workflows/sync-cart-kaspi-payment"
import { AdminKaspiMockPayType } from "./validators"

// /admin/kaspi-mock-payments — DEV-ТОЛЬКО (T12.23): «покупатель оплатил в
// Kaspi» кнопкой в панели, а не командой на сервере. Ровно то же, что делает
// `npm run kaspi:pay` (scripts/kaspi-mock-pay.mjs), но без ssh и без добывания
// токена покупателя: админ-роут ходит к сессии напрямую, поэтому владения
// корзиной проверять не нужно.
//
// Границы те же, что у store-роута mock-pay: вне `KASPI_MODE=mock` в панели
// делать нечего — GET честно отвечает `mock_mode: false` и пустым списком, POST
// отдаёт 404. Состояние мока живёт в памяти процесса (kaspi-mock-client),
// в домен не попадает. В контракт (contracts/openapi.json) роут не выносится:
// в проде его нет, тонким клиентам знать о нём нечего.

// Сколько последних Kaspi-сессий просматриваем: неоплаченные ищем в памяти —
// фильтра по провайдеру и состоянию инвойса у ядра нет, а на стенде счетов
// единицы.
const SCAN_CAP = 100

// Сколько неоплаченных счетов показываем: на стенде копятся брошенные корзины
// (их десятки), а оператору нужен последний счёт, а не журнал.
const LIMIT = 10

// Сессия ждёт оплаты, пока ядро не увело её в финальный статус.
const PENDING_STATUSES = ["pending", "requires_more"]

type KaspiSessionData = {
  kaspi_invoice_id?: string
  kaspi_state?: string
  reference?: string
}

const sessionData = (session: PaymentSessionDTO): KaspiSessionData =>
  (session.data ?? {}) as KaspiSessionData

// Неоплаченные Kaspi-сессии, свежие сверху: на показе нужна последняя.
async function listPendingSessions(
  req: AuthenticatedMedusaRequest
): Promise<PaymentSessionDTO[]> {
  const paymentService = req.scope.resolve(Modules.PAYMENT)
  const sessions = await paymentService.listPaymentSessions(
    {},
    { take: SCAN_CAP, order: { created_at: "DESC" } }
  )
  return sessions.filter(
    (session) =>
      session.provider_id === KASPI_PROVIDER_ID &&
      PENDING_STATUSES.includes(session.status) &&
      !!sessionData(session).kaspi_invoice_id
  )
}

// GET /admin/kaspi-mock-payments — счета, ждущие оплаты: покупатель, сумма и
// корзина, чтобы оператор нажимал на нужный счёт, а не на «последний».
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  if (resolveMode() !== "mock") {
    res.json({ mock_mode: false, payments: [] })
    return
  }

  const sessions = (await listPendingSessions(req)).slice(0, LIMIT)
  const cartIds = Array.from(
    new Set(
      sessions
        .map((session) => sessionData(session).reference)
        .filter((id): id is string => !!id)
    )
  )

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: carts } = cartIds.length
    ? await query.graph({
        entity: "cart",
        fields: [
          "id",
          "email",
          "completed_at",
          "customer.first_name",
          "customer.last_name",
          "customer.phone",
          "shipping_address.first_name",
          "shipping_address.last_name",
          "shipping_address.phone",
        ],
        filters: { id: cartIds },
      })
    : { data: [] }

  type CartPerson = {
    first_name: string | null
    last_name: string | null
    phone: string | null
  }
  type CartRow = {
    id: string
    email: string | null
    completed_at: string | null
    customer?: CartPerson | null
    shipping_address?: CartPerson | null
  }

  // Кого показать оператору: учётка покупателя, а если ФИО там нет (гостевая
  // корзина или покупатель, который ещё не назвался) — адрес доставки, а уже
  // потом почта. Пустая строка тут хуже прочерка на экране.
  const personName = (person?: CartPerson | null) =>
    [person?.first_name, person?.last_name].filter(Boolean).join(" ") || null
  const cartById = new Map(
    (carts as CartRow[]).map((cart) => [cart.id, cart])
  )

  const payments = sessions.map((session) => {
    const data = sessionData(session)
    const cart = data.reference ? cartById.get(data.reference) : undefined
    const name =
      personName(cart?.customer) ??
      personName(cart?.shipping_address) ??
      cart?.email ??
      null
    return {
      payment_session_id: session.id,
      cart_id: data.reference ?? null,
      invoice_id: data.kaspi_invoice_id ?? null,
      kaspi_state: data.kaspi_state ?? null,
      status: session.status,
      amount: Number(session.amount),
      currency_code: session.currency_code,
      created_at: session.created_at ?? null,
      customer_name: name,
      customer_phone:
        cart?.customer?.phone ?? cart?.shipping_address?.phone ?? null,
      // Корзина уже оформлена в заказ — счёт остался хвостом, платить нечего.
      cart_completed: !!cart?.completed_at,
    }
  })

  res.json({ mock_mode: true, payments })
}

// POST /admin/kaspi-mock-payments — подтвердить оплату: без тела берётся самый
// свежий неоплаченный счёт (поведение `npm run kaspi:pay`), с
// `payment_session_id` — конкретный.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminKaspiMockPayType>,
  res: MedusaResponse
) {
  if (resolveMode() !== "mock") {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Not found")
  }

  const paymentService = req.scope.resolve(Modules.PAYMENT)
  const requestedId = req.validatedBody?.payment_session_id

  const session = requestedId
    ? await paymentService.retrievePaymentSession(requestedId)
    : (await listPendingSessions(req))[0]

  if (!session) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "There are no unpaid Kaspi invoices. Bring the chat to the payment step first."
    )
  }
  if (session.provider_id !== KASPI_PROVIDER_ID) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Payment session ${session.id} is not a Kaspi session`
    )
  }

  const invoiceId = sessionData(session).kaspi_invoice_id
  if (!invoiceId) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Payment session ${session.id} is missing kaspi_invoice_id`
    )
  }

  // Дальше — ровно путь store-роута: помечаем инвойс оплаченным и гоняем ту же
  // синхронизацию, что и поллинг в чате (сессия → authorized, Payment ядра).
  setMockInvoiceState(invoiceId, "paid")

  const { result } = await syncCartKaspiPaymentWorkflow(req.scope).run({
    input: { payment_session_id: session.id },
    throwOnError: true,
  })

  const data = (result.data ?? {}) as KaspiSessionData
  res.json({
    payment: {
      payment_session_id: result.id,
      status: result.status,
      kaspi_state: data.kaspi_state ?? null,
      cart_id: data.reference ?? null,
    },
  })
}
