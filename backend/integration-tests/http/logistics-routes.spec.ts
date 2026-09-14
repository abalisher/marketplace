import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import { Modules } from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"

jest.setTimeout(120000)

// HTTP-роуты admin API логистики (logistics подзадача 2): рейсы + точки со
// стейт-машинами, GPS-поток (последняя позиция), тарифы (upsert по zone +
// удаление). Водитель работает из partner-app под admin-аутентификацией
// (прецедент POS). Требует docker-postgres.
//
// Триггер deliver-order при выдаче delivery-точки (fulfillment_id + код) —
// проверен на уровне workflow в order-lifecycle-workflows.spec.ts (нужна полная
// order+fulfillment-фикстура); здесь проверяем собственную поверхность роутов
// (переходы точки без триггера, чтобы тест не тянул тяжёлую фикстуру заказа).
medusaIntegrationTestRunner({
  testSuite: ({ getContainer, api }) => {
    let container: MedusaContainer
    let adminHeaders: Record<string, string>

    const call = async (promise: Promise<any>) =>
      promise.then(
        (res) => res,
        (err) => {
          if (!err.response) {
            throw err
          }
          return err.response
        }
      )

    beforeAll(async () => {
      container = getContainer()
      const email = "admin@example.com"
      const password = "supersecret"
      const authService = container.resolve(Modules.AUTH)
      const { authIdentity } = await authService.register("emailpass", {
        body: { email, password },
      })
      const user = await container.resolve(Modules.USER).createUsers({ email })
      await authService.updateAuthIdentities({
        id: authIdentity!.id,
        app_metadata: { user_id: user.id },
      })
      const { data: login } = await api.post("/auth/user/emailpass", {
        email,
        password,
      })
      adminHeaders = { authorization: `Bearer ${login.token}` }
    })

    it("creates a trip, adds a stop, and reads back trip with stops", async () => {
      const created = await call(
        api.post(
          "/admin/logistics/trips",
          { driver_id: "usr_driver_1", location_id: "sloc_1", note: "утренний" },
          { headers: adminHeaders }
        )
      )
      expect(created.status).toEqual(201)
      expect(created.data.trip.status).toEqual("planned")
      const tripId = created.data.trip.id

      const stop = await call(
        api.post(
          `/admin/logistics/trips/${tripId}/stops`,
          { order_id: "order_1", type: "delivery", sequence: 1 },
          { headers: adminHeaders }
        )
      )
      expect(stop.status).toEqual(201)
      expect(stop.data.stop.status).toEqual("pending")
      expect(stop.data.stop.type).toEqual("delivery")

      const detail = await call(
        api.get(`/admin/logistics/trips/${tripId}`, { headers: adminHeaders })
      )
      expect(detail.status).toEqual(200)
      expect(detail.data.trip.id).toEqual(tripId)
      expect(detail.data.stops).toHaveLength(1)
      expect(detail.data.stops[0].order_id).toEqual("order_1")

      const list = await call(
        api.get("/admin/logistics/trips", { headers: adminHeaders })
      )
      expect(list.status).toEqual(200)
      expect(
        list.data.trips.some((t: { id: string }) => t.id === tripId)
      ).toBe(true)
    })

    it("drives a trip through its state machine and rejects an illegal jump", async () => {
      const { data } = await call(
        api.post(
          "/admin/logistics/trips",
          { driver_id: "usr_driver_2", location_id: "sloc_1" },
          { headers: adminHeaders }
        )
      )
      const tripId = data.trip.id

      const enRoute = await call(
        api.post(
          `/admin/logistics/trips/${tripId}/status`,
          { status: "en_route" },
          { headers: adminHeaders }
        )
      )
      expect(enRoute.status).toEqual(200)
      expect(enRoute.data.trip.status).toEqual("en_route")
      expect(enRoute.data.trip.started_at).not.toBeNull()

      const completed = await call(
        api.post(
          `/admin/logistics/trips/${tripId}/status`,
          { status: "completed" },
          { headers: adminHeaders }
        )
      )
      expect(completed.status).toEqual(200)
      expect(completed.data.trip.finished_at).not.toBeNull()

      // completed — терминальный, любой переход недопустим → 400.
      const illegal = await call(
        api.post(
          `/admin/logistics/trips/${tripId}/status`,
          { status: "en_route" },
          { headers: adminHeaders }
        )
      )
      expect(illegal.status).toEqual(400)
    })

    it("drives a stop pending→arrived→done with proof and rejects an illegal jump", async () => {
      const { data: tripData } = await call(
        api.post(
          "/admin/logistics/trips",
          { driver_id: "usr_driver_3", location_id: "sloc_1" },
          { headers: adminHeaders }
        )
      )
      const tripId = tripData.trip.id
      const { data: stopData } = await call(
        api.post(
          `/admin/logistics/trips/${tripId}/stops`,
          { order_id: "order_2", type: "delivery" },
          { headers: adminHeaders }
        )
      )
      const stopId = stopData.stop.id
      const base = `/admin/logistics/trips/${tripId}/stops/${stopId}/status`

      // pending → done напрямую недопустим (нужно пройти arrived) → 400.
      const illegal = await call(
        api.post(base, { status: "done" }, { headers: adminHeaders })
      )
      expect(illegal.status).toEqual(400)

      const arrived = await call(
        api.post(base, { status: "arrived" }, { headers: adminHeaders })
      )
      expect(arrived.status).toEqual(200)
      expect(arrived.data.stop.status).toEqual("arrived")

      // done с proof, БЕЗ fulfillment_id → deliver-order НЕ триггерится (точка
      // просто закрывается); проверяем сохранение proof.
      const done = await call(
        api.post(
          base,
          { status: "done", proof: { signature: "ok", photos: ["p1"] } },
          { headers: adminHeaders }
        )
      )
      expect(done.status).toEqual(200)
      expect(done.data.stop.status).toEqual("done")
      expect(done.data.stop.proof).toEqual({ signature: "ok", photos: ["p1"] })
    })

    it("records GPS pings and returns the latest position", async () => {
      const { data } = await call(
        api.post(
          "/admin/logistics/trips",
          { driver_id: "usr_driver_4", location_id: "sloc_1" },
          { headers: adminHeaders }
        )
      )
      const tripId = data.trip.id
      const gps = `/admin/logistics/trips/${tripId}/gps`

      const empty = await call(api.get(gps, { headers: adminHeaders }))
      expect(empty.status).toEqual(200)
      expect(empty.data.position).toBeNull()

      await call(
        api.post(
          gps,
          { driver_id: "usr_driver_4", lat: 51.1, lng: 71.4 },
          { headers: adminHeaders }
        )
      )
      const second = await call(
        api.post(
          gps,
          { driver_id: "usr_driver_4", lat: 51.2, lng: 71.5 },
          { headers: adminHeaders }
        )
      )
      expect(second.status).toEqual(201)

      const latest = await call(api.get(gps, { headers: adminHeaders }))
      expect(latest.status).toEqual(200)
      expect(latest.data.position.lat).toBeCloseTo(51.2)
      expect(latest.data.position.lng).toBeCloseTo(71.5)
    })

    it("upserts a delivery tariff by zone, lists it, and deletes it", async () => {
      const created = await call(
        api.post(
          "/admin/logistics/tariffs",
          {
            zone: "astana-center",
            base_price: 100000,
            price_per_kg: 50,
            price_per_m3: 2000,
          },
          { headers: adminHeaders }
        )
      )
      expect(created.status).toEqual(200)
      expect(created.data.tariff.zone).toEqual("astana-center")
      expect(created.data.tariff.base_price).toEqual(100000)

      // Тот же zone → обновление (не дубль).
      const updated = await call(
        api.post(
          "/admin/logistics/tariffs",
          {
            zone: "astana-center",
            base_price: 120000,
            price_per_kg: 50,
            price_per_m3: 2000,
          },
          { headers: adminHeaders }
        )
      )
      expect(updated.status).toEqual(200)
      expect(updated.data.tariff.base_price).toEqual(120000)

      const list = await call(
        api.get("/admin/logistics/tariffs", { headers: adminHeaders })
      )
      const center = list.data.tariffs.filter(
        (t: { zone: string }) => t.zone === "astana-center"
      )
      expect(center).toHaveLength(1)
      const id = center[0].id

      const del = await call(
        api.delete(`/admin/logistics/tariffs/${id}`, { headers: adminHeaders })
      )
      expect(del.status).toEqual(200)
      expect(del.data.deleted).toBe(true)

      const missing = await call(
        api.delete("/admin/logistics/tariffs/dtar_missing", {
          headers: adminHeaders,
        })
      )
      expect(missing.status).toEqual(404)
    })

    it("rejects a negative tariff price (400)", async () => {
      const res = await call(
        api.post(
          "/admin/logistics/tariffs",
          {
            zone: "bad-zone",
            base_price: -1,
            price_per_kg: 0,
            price_per_m3: 0,
          },
          { headers: adminHeaders }
        )
      )
      expect(res.status).toEqual(400)
    })
  },
})
