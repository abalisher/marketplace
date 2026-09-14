import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { LOGISTICS_MODULE } from ".."
import LogisticsModuleService from "../service"
import Trip from "../models/trip"
import TripStop from "../models/trip-stop"
import DeliveryTariff from "../models/delivery-tariff"
import GpsPing from "../models/gps-ping"
import {
  assertTripStopTransition,
  assertTripTransition,
  calculateDeliveryCost,
  ORDER_STOP_TAKEN,
} from "../models/constants"

jest.setTimeout(120000)

// Интеграционный тест модуля logistics (подзадача 1): чистые функции (тариф,
// переходы), стейт-машины рейса/точки, GPS-поток, оценка стоимости по тарифу.
// Раннер поднимает модуль на временной БД (.env.test). Состояние НЕ переживает
// границу `it` — каждый тест самодостаточен.
moduleIntegrationTestRunner<LogisticsModuleService>({
  moduleName: LOGISTICS_MODULE,
  moduleModels: [Trip, TripStop, DeliveryTariff, GpsPing],
  resolve: "./src/modules/logistics",
  testSuite: ({ service }) => {
    describe("logistics — чистые функции", () => {
      it("calculateDeliveryCost = база + вес×ставка + объём×ставка (округление вверх)", () => {
        expect(
          calculateDeliveryCost({
            base_price: 2000,
            price_per_kg: 10,
            price_per_m3: 500,
            weight_kg: 100,
            volume_m3: 2,
          })
        ).toEqual(4000)
        // Без габаритов — только база.
        expect(
          calculateDeliveryCost({
            base_price: 1500,
            price_per_kg: 10,
            price_per_m3: 500,
          })
        ).toEqual(1500)
        // Дробный результат округляется вверх.
        expect(
          calculateDeliveryCost({
            base_price: 0,
            price_per_kg: 3.3,
            price_per_m3: 0,
            weight_kg: 1,
          })
        ).toEqual(4)
      })

      it("assertTripTransition/assertTripStopTransition пускают валидные и рубят недопустимые", () => {
        expect(() => assertTripTransition("planned", "en_route")).not.toThrow()
        expect(() => assertTripTransition("completed", "en_route")).toThrow(
          /not allowed/
        )
        expect(() => assertTripStopTransition("arrived", "done")).not.toThrow()
        expect(() => assertTripStopTransition("done", "arrived")).toThrow(
          /not allowed/
        )
      })
    })

    describe("LogisticsModuleService — рейсы и точки", () => {
      it("создаёт рейс в статусе planned", async () => {
        const trip = await service.createTrip({
          driver_id: "usr_driver_1",
          location_id: "sloc_1",
        })
        expect(trip.id).toMatch(/^trip_/)
        expect(trip.status).toEqual("planned")
      })

      it("ведёт рейс по стейт-машине и проставляет started_at/finished_at", async () => {
        const trip = await service.createTrip({
          driver_id: "usr_driver_1",
          location_id: "sloc_1",
        })
        const enRoute = await service.setTripStatus({
          id: trip.id,
          status: "en_route",
        })
        expect(enRoute.status).toEqual("en_route")
        expect(enRoute.started_at).toBeTruthy()

        const done = await service.setTripStatus({
          id: trip.id,
          status: "completed",
        })
        expect(done.status).toEqual("completed")
        expect(done.finished_at).toBeTruthy()
      })

      it("запрещает недопустимый переход рейса", async () => {
        const trip = await service.createTrip({
          driver_id: "usr_driver_1",
          location_id: "sloc_1",
        })
        await service.setTripStatus({ id: trip.id, status: "en_route" })
        await service.setTripStatus({ id: trip.id, status: "completed" })
        await expect(
          service.setTripStatus({ id: trip.id, status: "en_route" })
        ).rejects.toThrow(/not allowed/)
      })

      it("добавляет точку и ведёт её по стейт-машине с proof", async () => {
        const trip = await service.createTrip({
          driver_id: "usr_driver_1",
          location_id: "sloc_1",
        })
        const stop = await service.addStop({
          trip_id: trip.id,
          order_id: "order_1",
          type: "delivery",
          sequence: 1,
        })
        expect(stop.id).toMatch(/^tstop_/)
        expect(stop.status).toEqual("pending")

        await service.setStopStatus({ id: stop.id, status: "arrived" })
        const done = await service.setStopStatus({
          id: stop.id,
          status: "done",
          proof: { photos: ["file_1"], signature: "sig" },
        })
        expect(done.status).toEqual("done")
        expect(done.proof).toEqual({ photos: ["file_1"], signature: "sig" })

        await expect(
          service.setStopStatus({ id: stop.id, status: "arrived" })
        ).rejects.toThrow(/not allowed/)
      })

      it("не даёт завести вторую точку выдачи по одному заказу", async () => {
        const first = await service.createTrip({
          driver_id: "drv_fast",
          location_id: "sloc_1",
        })
        const second = await service.createTrip({
          driver_id: "drv_late",
          location_id: "sloc_1",
        })
        await service.addStop({ trip_id: first.id, order_id: "order_race" })

        // Гонка «взять заказ»: обе проверки «заказ свободен» прошли, спасает
        // уникальный индекс — отказ приходит понятным кодом, а не 500 от БД.
        await expect(
          service.addStop({ trip_id: second.id, order_id: "order_race" })
        ).rejects.toMatchObject({ code: ORDER_STOP_TAKEN })

        // Забор возврата по тому же заказу — другой тип точки, он разрешён.
        const pickup = await service.addStop({
          trip_id: second.id,
          order_id: "order_race",
          type: "return_pickup",
        })
        expect(pickup.type).toEqual("return_pickup")
      })
    })

    describe("LogisticsModuleService — GPS и тарифы", () => {
      it("принимает GPS-пинги и отдаёт последнюю позицию", async () => {
        const trip = await service.createTrip({
          driver_id: "usr_driver_1",
          location_id: "sloc_1",
        })
        await service.recordGpsPing({
          trip_id: trip.id,
          driver_id: "usr_driver_1",
          lat: 51.1,
          lng: 71.4,
        })
        await new Promise((resolve) => setTimeout(resolve, 10))
        await service.recordGpsPing({
          trip_id: trip.id,
          driver_id: "usr_driver_1",
          lat: 51.2,
          lng: 71.5,
        })

        const latest = await service.getLatestPosition(trip.id)
        expect(latest).toBeTruthy()
        expect(Number(latest!.lat)).toEqual(51.2)
      })

      it("оценивает стоимость доставки по активному тарифу зоны", async () => {
        await service.createDeliveryTariffs({
          zone: "astana",
          base_price: 2000,
          price_per_kg: 10,
          price_per_m3: 500,
          active: true,
        })
        const cost = await service.estimateDeliveryCost("astana", {
          weight_kg: 100,
          volume_m3: 2,
        })
        expect(cost).toEqual(4000)

        await expect(
          service.estimateDeliveryCost("unknown_zone", { weight_kg: 1 })
        ).rejects.toThrow(/No active delivery tariff/)
      })
    })
  },
})
