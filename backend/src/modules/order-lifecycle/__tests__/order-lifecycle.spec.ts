import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { ORDER_LIFECYCLE_MODULE } from ".."
import OrderLifecycleModuleService, {
  assertOrderStatusTransition,
} from "../service"
import OrderLifecycle from "../models/order-lifecycle"
import OrderLifecycleEvent from "../models/order-lifecycle-event"

jest.setTimeout(120000)

// Интеграционный тест модуля: happy-path сервиса + инварианты стейт-машины
// из docs/modules/order.md. Раннер поднимает модуль на временной БД (.env.test).
moduleIntegrationTestRunner<OrderLifecycleModuleService>({
  moduleName: ORDER_LIFECYCLE_MODULE,
  moduleModels: [OrderLifecycle, OrderLifecycleEvent],
  resolve: "./src/modules/order-lifecycle",
  testSuite: ({ service }) => {
    describe("OrderLifecycleModuleService", () => {
      it("creates a lifecycle defaulting to 'new'", async () => {
        const lc = await service.createOrderLifecycles({})

        expect(lc.id).toMatch(/^ordlc_/)
        expect(lc.status).toEqual("new")
        expect(lc.previous_status).toBeNull()
        expect(lc.note).toBeNull()
      })

      it("rejects a status outside the allowed enum", async () => {
        await expect(
          service.createOrderLifecycles({ status: "shipped" as never })
        ).rejects.toThrow()
      })

      it("allows a valid transition and rejects an invalid one", () => {
        // Инвариант — чистая функция стейт-машины (без БД).
        expect(() =>
          assertOrderStatusTransition("new", "confirmed")
        ).not.toThrow()
        expect(() =>
          assertOrderStatusTransition("confirmed", "assembling")
        ).not.toThrow()
        expect(() =>
          assertOrderStatusTransition("new", "delivered")
        ).toThrow("not allowed")
        // Терминальные статусы никуда не ведут.
        expect(() => assertOrderStatusTransition("canceled", "new")).toThrow()
      })

      it("records a transition: updates status, sets previous, appends log", async () => {
        const lc = await service.createOrderLifecycles({})

        const { lifecycle: updated, event } = await service.recordTransition({
          order_lifecycle_id: lc.id,
          to: "confirmed",
          actor_type: "seller",
          actor_id: "user_123",
        })

        expect(updated.status).toEqual("confirmed")
        expect(updated.previous_status).toEqual("new")
        // Запись лога возвращается — её id нужен шагу для компенсации.
        expect(event.id).toMatch(/^ordlce_/)
        expect(event.to_status).toEqual("confirmed")

        const [events, count] =
          await service.listAndCountOrderLifecycleEvents({
            order_lifecycle_id: lc.id,
          })
        expect(count).toEqual(1)
        expect(events[0].from_status).toEqual("new")
        expect(events[0].to_status).toEqual("confirmed")
        expect(events[0].actor_type).toEqual("seller")
        expect(events[0].actor_id).toEqual("user_123")
      })

      it("refuses to record a disallowed transition (no side effects)", async () => {
        const lc = await service.createOrderLifecycles({})

        await expect(
          service.recordTransition({
            order_lifecycle_id: lc.id,
            to: "delivered",
            actor_type: "system",
          })
        ).rejects.toThrow("not allowed")

        // Статус не сдвинулся и лог пуст — переход отклонён до записи.
        const after = await service.retrieveOrderLifecycle(lc.id)
        expect(after.status).toEqual("new")
        const count = await service.listAndCountOrderLifecycleEvents({
          order_lifecycle_id: lc.id,
        })
        expect(count[1]).toEqual(0)
      })

      it("logs the reason on a transition (e.g. cancellation)", async () => {
        const lc = await service.createOrderLifecycles({})

        const { lifecycle: canceled } = await service.recordTransition({
          order_lifecycle_id: lc.id,
          to: "canceled",
          actor_type: "buyer",
          reason: "changed my mind",
        })

        expect(canceled.status).toEqual("canceled")
        expect(canceled.note).toEqual("changed my mind")

        const [events] = await service.listAndCountOrderLifecycleEvents({
          order_lifecycle_id: lc.id,
        })
        expect(events[0].reason).toEqual("changed my mind")
      })
    })
  },
})
