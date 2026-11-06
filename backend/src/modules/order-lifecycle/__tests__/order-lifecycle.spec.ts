import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { ORDER_LIFECYCLE_MODULE } from ".."
import OrderLifecycleModuleService, {
  assertDeliveryConfirmation,
  assertOrderStatusTransition,
  assertSlotRescheduleAllowed,
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
        // Инвариант — чистая функция стейт-машины (без БД). Дефолт — delivery.
        expect(() =>
          assertOrderStatusTransition("new", "confirmed")
        ).not.toThrow()
        expect(() =>
          assertOrderStatusTransition("confirmed", "assembling")
        ).not.toThrow()
        expect(() =>
          assertOrderStatusTransition("new", "delivered")
        ).toThrow("Нельзя перевести")
        // Терминальные статусы никуда не ведут.
        expect(() => assertOrderStatusTransition("canceled", "new")).toThrow()
      })

      it("enforces the delivery path: delivered only via in_delivery", () => {
        // После пивота 2026-07-22 единственный способ — delivery (полный путь).
        // Сразу delivered из assembled нельзя — только через in_delivery.
        expect(() =>
          assertOrderStatusTransition("assembled", "delivered", "delivery")
        ).toThrow("Нельзя перевести")
        expect(() =>
          assertOrderStatusTransition("assembled", "in_delivery", "delivery")
        ).not.toThrow()
        expect(() =>
          assertOrderStatusTransition("in_delivery", "delivered", "delivery")
        ).not.toThrow()
        expect(() =>
          assertOrderStatusTransition(
            "partially_assembled",
            "in_delivery",
            "delivery"
          )
        ).not.toThrow()
      })

      it("requires a valid delivery code for the delivery method", () => {
        // delivery: код обязателен и должен совпасть.
        expect(() =>
          assertDeliveryConfirmation({
            method: "delivery",
            stored_code: "123456",
            provided_code: "123456",
          })
        ).not.toThrow()
        expect(() =>
          assertDeliveryConfirmation({
            method: "delivery",
            stored_code: "123456",
            provided_code: "000000",
          })
        ).toThrow("не указан или неверный")
        expect(() =>
          assertDeliveryConfirmation({
            method: "delivery",
            stored_code: "123456",
          })
        ).toThrow("не указан или неверный")
        // Код не выдан (отгрузки не было) — подтверждать нечего.
        expect(() =>
          assertDeliveryConfirmation({
            method: "delivery",
            stored_code: null,
            provided_code: "123456",
          })
        ).toThrow("ещё не выдан")
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
        ).rejects.toThrow("Нельзя перевести")

        // Статус не сдвинулся и лог пуст — переход отклонён до записи.
        const after = await service.retrieveOrderLifecycle(lc.id)
        expect(after.status).toEqual("new")
        const count = await service.listAndCountOrderLifecycleEvents({
          order_lifecycle_id: lc.id,
        })
        expect(count[1]).toEqual(0)
      })

      it("разрешает перенос слота до отгрузки и запрещает после", () => {
        // Инвариант переноса — чистая функция (без БД), как и стейт-машина.
        expect(() =>
          assertSlotRescheduleAllowed({ status: "new", method: "delivery" })
        ).not.toThrow()
        expect(() =>
          assertSlotRescheduleAllowed({ status: "assembled", method: "delivery" })
        ).not.toThrow()
        // Машина уже в пути — двигать окно нечего.
        expect(() =>
          assertSlotRescheduleAllowed({
            status: "in_delivery",
            method: "delivery",
          })
        ).toThrow("Перенести доставку нельзя")
        expect(() =>
          assertSlotRescheduleAllowed({ status: "delivered", method: "delivery" })
        ).toThrow("Перенести доставку нельзя")
        expect(() =>
          assertSlotRescheduleAllowed({ status: "canceled", method: "delivery" })
        ).toThrow("Перенести доставку нельзя")
      })

      it("переносит слот: пишет запись kind=slot и обновляет заказ", async () => {
        const lc = await service.createOrderLifecycles({
          delivery_date: "2026-09-06",
          delivery_window: "day",
        })

        const { lifecycle: moved, event, from } =
          await service.rescheduleDeliverySlot({
            order_lifecycle_id: lc.id,
            date: "2026-09-07",
            window: "morning",
            actor_type: "admin",
            actor_id: "user_555",
            reason: "покупатель просит четверг, утро",
          })

        expect(moved.delivery_date).toEqual("2026-09-07")
        expect(moved.delivery_window).toEqual("morning")
        // Статус переносом не двигается — иначе заказ уехал бы по стейт-машине.
        expect(moved.status).toEqual("new")
        expect(moved.previous_status).toBeNull()
        // note хранит причину последнего ПЕРЕХОДА — причина переноса её не трёт.
        expect(moved.note).toBeNull()
        expect(from).toEqual({ date: "2026-09-06", window: "day" })

        expect(event.kind).toEqual("slot")
        const [events] = await service.listAndCountOrderLifecycleEvents({
          order_lifecycle_id: lc.id,
        })
        expect(events).toHaveLength(1)
        expect(events[0].from_slot_date).toEqual("2026-09-06")
        expect(events[0].from_slot_window).toEqual("day")
        expect(events[0].to_slot_date).toEqual("2026-09-07")
        expect(events[0].to_slot_window).toEqual("morning")
        expect(events[0].actor_id).toEqual("user_555")
        expect(events[0].reason).toEqual("покупатель просит четверг, утро")
        // Оба статуса — текущий: запись лога не притворяется переходом.
        expect(events[0].from_status).toEqual("new")
        expect(events[0].to_status).toEqual("new")
      })

      it("не переносит слот на то же окно (пустая запись в логе)", async () => {
        const lc = await service.createOrderLifecycles({
          delivery_date: "2026-09-06",
          delivery_window: "day",
        })

        await expect(
          service.rescheduleDeliverySlot({
            order_lifecycle_id: lc.id,
            date: "2026-09-06",
            window: "day",
            actor_type: "admin",
            reason: "по звонку",
          })
        ).rejects.toThrow("уже назначен")

        const count = await service.listAndCountOrderLifecycleEvents({
          order_lifecycle_id: lc.id,
        })
        expect(count[1]).toEqual(0)
      })

      it("не переносит слот у отгруженного заказа", async () => {
        const lc = await service.createOrderLifecycles({
          status: "in_delivery",
          delivery_date: "2026-09-06",
          delivery_window: "day",
        })

        await expect(
          service.rescheduleDeliverySlot({
            order_lifecycle_id: lc.id,
            date: "2026-09-07",
            window: "morning",
            actor_type: "admin",
            reason: "по звонку",
          })
        ).rejects.toThrow("Перенести доставку нельзя")

        const after = await service.retrieveOrderLifecycle(lc.id)
        expect(after.delivery_date).toEqual("2026-09-06")
        expect(after.delivery_window).toEqual("day")
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
