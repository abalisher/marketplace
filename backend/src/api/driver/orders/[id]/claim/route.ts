import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ORDER_STOP_TAKEN } from "../../../../../modules/logistics/models/constants"
import {
  ClaimRejection,
  findAvailableOrder,
} from "../../../../../lib/orders/driver-pool"
import { claimOrderForDriverWorkflow } from "../../../../../workflows/claim-order-for-driver"
import { toDriverTripStopView, toDriverTripView } from "../../../trip-view"

// Отказы «взять заказ». Клиент показывает сообщение по полю `reason` (идиома
// роутов входа водителя). «Уже взят» — 409: это не ошибка водителя, а гонка,
// и приложению остаётся перечитать пул.
const REJECTION_STATUS: Record<ClaimRejection, number> = {
  not_found: 404,
  not_ready: 409,
  already_taken: 409,
}

const REJECTION_MESSAGE: Record<ClaimRejection, string> = {
  not_found: "Заказ не найден",
  not_ready: "Заказ ещё не готов к выдаче — обновите список",
  already_taken: "Заказ уже взял другой водитель",
}

// POST /driver/orders/:id/claim — водитель берёт заказ из пула (T5.2a): на него
// заводится рейс с точкой выдачи. Водитель берёт заказ СЕБЕ — driver_id идёт из
// токена, параметром его не передать.
//
// Проверка «заказ ещё свободен» и вставка точки — не одно и то же мгновение,
// поэтому гонку двух водителей ловит уникальный индекс в БД: workflow откатывает
// рейс, а роут отвечает тем же 409, что и предварительная проверка.
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const found = await findAvailableOrder(req.scope, req.params.id)
  if (found.rejection) {
    res.status(REJECTION_STATUS[found.rejection]).json({
      reason: found.rejection,
      message: REJECTION_MESSAGE[found.rejection],
    })
    return
  }

  try {
    const { result } = await claimOrderForDriverWorkflow(req.scope).run({
      input: {
        order_id: found.order.order_id,
        driver_id: req.auth_context.actor_id,
        location_id: found.order.location_id,
        address_snapshot: found.order.address_snapshot,
      },
      throwOnError: true,
    })

    res.status(201).json({
      trip: toDriverTripView(result.trip),
      stop: toDriverTripStopView(result.stop, {
        display_id: found.order.display_id,
        number: found.order.order_number,
      }),
    })
  } catch (error) {
    if (!isOrderTaken(error)) {
      throw error
    }
    res.status(REJECTION_STATUS.already_taken).json({
      reason: "already_taken" satisfies ClaimRejection,
      message: REJECTION_MESSAGE.already_taken,
    })
  }
}

// Заказ перехватили между проверкой и вставкой: код отказа приходит из сервиса
// логистики. Workflow-движок оборачивает ошибку шага, поэтому смотрим и на
// причину внутри.
const isOrderTaken = (error: unknown): boolean => {
  const raw = error as { code?: string; cause?: unknown } | null
  if (raw?.code === ORDER_STOP_TAKEN) {
    return true
  }
  return (
    !!raw?.cause &&
    (raw.cause as { code?: string }).code === ORDER_STOP_TAKEN
  )
}
