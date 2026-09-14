import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { emitEventStep } from "@medusajs/medusa/core-flows"
import { TRIP_CLAIMED_EVENT } from "../modules/logistics/events"
import { createTripStep } from "./steps/create-trip"
import { addTripStopStep } from "./steps/add-trip-stop"

export type ClaimOrderForDriverWorkflowInput = {
  order_id: string
  driver_id: string
  // Склад загрузки и адрес доставки резолвит вызывающий слой по правилу пула
  // (lib/orders/driver-pool.ts) — workflow не решает, можно ли брать заказ.
  location_id: string
  address_snapshot?: Record<string, unknown> | null
}

// Водитель-gig берёт заказ из пула: рейс на себя и точка выдачи заводятся ОДНИМ
// действием — в gig-модели «взял» и есть рейс, диспетчер тут не участвует.
//
// Один заказ = один рейс (решение T5.2a): машина везёт на объект тяжёлый груз
// одним рейсом, а не собирает маршрут из чужих заказов. Модель многоточечные
// рейсы поддерживает — диспетчер добавляет точки из панели.
//
// Два шага именно workflow'ом ради компенсации: если точка не встала (заказ
// перехватил другой водитель — уникальность в БД), рейс-пустышка откатывается,
// а не остаётся висеть у водителя.
export const claimOrderForDriverWorkflow = createWorkflow(
  "claim-order-for-driver",
  (input: WorkflowData<ClaimOrderForDriverWorkflowInput>) => {
    const trip = createTripStep(
      transform({ input }, (d) => ({
        driver_id: d.input.driver_id,
        location_id: d.input.location_id,
      }))
    )

    const stop = addTripStopStep(
      transform({ input, trip }, (d) => ({
        trip_id: d.trip.id,
        order_id: d.input.order_id,
        type: "delivery" as const,
        sequence: 0,
        address_snapshot: d.input.address_snapshot ?? null,
      }))
    )

    emitEventStep({
      eventName: TRIP_CLAIMED_EVENT,
      data: transform({ input, trip }, (d) => ({
        trip_id: d.trip.id,
        order_id: d.input.order_id,
        driver_id: d.input.driver_id,
      })),
    })

    return new WorkflowResponse(
      transform({ trip, stop }, (d) => ({ trip: d.trip, stop: d.stop }))
    )
  }
)
