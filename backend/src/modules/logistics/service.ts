import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import Trip from "./models/trip"
import TripStop from "./models/trip-stop"
import DeliveryTariff from "./models/delivery-tariff"
import GpsPing from "./models/gps-ping"
import {
  assertTripStopTransition,
  assertTripTransition,
  calculateDeliveryCost,
  ORDER_STOP_TAKEN,
  TripStatus,
  TripStopStatus,
  TripStopType,
} from "./models/constants"

// Нарушение уникального индекса. Путей два: сырая ошибка драйвера (postgres —
// SQLSTATE 23505, ORM — свой класс-исключение) и уже переведённая ядром
// MedusaError INVALID_DATA с текстом «… already exists.» — своего кода у неё
// нет, поэтому узнаём по тексту. Текст ядра пришит тестом модуля: если
// обновление Medusa его сменит, тест упадёт, а не промолчит.
const isUniqueViolation = (error: unknown): boolean => {
  const raw = error as
    | { code?: string; name?: string; type?: string; message?: string }
    | null
  if (raw?.code === "23505" || raw?.name === "UniqueConstraintViolationException") {
    return true
  }
  return (
    raw?.type === MedusaError.Types.INVALID_DATA &&
    /already exists/i.test(raw?.message ?? "")
  )
}

// Сервис исполнительного слоя доставки: рейсы, точки, GPS-поток, тарифы. CRUD
// генерируется MedusaService; здесь — инварианты: стейт-машины рейса и точки,
// расчёт стоимости по тарифу. Интеграция с заказом (отметка «выдано» →
// deliver-order, применение тарифа к shipping option) — слой workflow
// (подзадача 2), не модуль. См. docs/modules/logistics.md.
class LogisticsModuleService extends MedusaService({
  Trip,
  TripStop,
  DeliveryTariff,
  GpsPing,
}) {
  // Создать рейс (изначально planned).
  async createTrip(input: {
    driver_id: string
    location_id: string
    note?: string | null
  }) {
    return await this.createTrips({
      driver_id: input.driver_id,
      location_id: input.location_id,
      status: "planned",
      note: input.note ?? null,
    })
  }

  // Перевод рейса по стейт-машине. Проставляет started_at при выходе в путь и
  // finished_at при завершении/отмене.
  async setTripStatus(input: { id: string; status: TripStatus }) {
    const trip = await this.retrieveTrip(input.id)
    assertTripTransition(trip.status as TripStatus, input.status)
    const patch: Record<string, unknown> = { id: input.id, status: input.status }
    if (input.status === "en_route" && !trip.started_at) {
      patch.started_at = new Date()
    }
    if (input.status === "completed" || input.status === "canceled") {
      patch.finished_at = new Date()
    }
    return await this.updateTrips(patch)
  }

  // Добавить точку в рейс (выдача/возврат). Порядок задаётся вручную (MVP).
  // Второй точки того же типа по одному заказу не будет: уникальность держит
  // БД (см. модель), а не проверка перед вставкой — «взять заказ» в gig-пуле
  // это гонка двух водителей. Нарушение переводим в понятный отказ с кодом
  // ORDER_STOP_TAKEN, иначе наружу уехала бы 500 от драйвера БД.
  async addStop(input: {
    trip_id: string
    order_id: string
    type?: TripStopType
    sequence?: number
    address_snapshot?: Record<string, unknown> | null
  }) {
    const type = input.type ?? "delivery"
    try {
      return await this.createTripStops({
        trip_id: input.trip_id,
        order_id: input.order_id,
        type,
        sequence: input.sequence ?? 0,
        status: "pending",
        address_snapshot: input.address_snapshot ?? null,
      })
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error
      }
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Order ${input.order_id} already has a ${type} stop`,
        ORDER_STOP_TAKEN
      )
    }
  }

  // Перевод точки по стейт-машине. При выдаче/возврате прикладываются proof
  // (фото/подпись) и checklist (осмотр) — существующие значения сохраняются,
  // если не переданы.
  async setStopStatus(input: {
    id: string
    status: TripStopStatus
    proof?: Record<string, unknown> | null
    checklist?: Record<string, unknown> | null
    note?: string | null
  }) {
    const stop = await this.retrieveTripStop(input.id)
    assertTripStopTransition(stop.status as TripStopStatus, input.status)
    return await this.updateTripStops({
      id: input.id,
      status: input.status,
      proof: input.proof ?? stop.proof ?? null,
      checklist: input.checklist ?? stop.checklist ?? null,
      note: input.note ?? stop.note ?? null,
    })
  }

  // Принять GPS-пинг водителя (append в поток).
  async recordGpsPing(input: {
    trip_id: string
    driver_id: string
    lat: number
    lng: number
  }) {
    return await this.createGpsPings({
      trip_id: input.trip_id,
      driver_id: input.driver_id,
      lat: input.lat,
      lng: input.lng,
      recorded_at: new Date(),
    })
  }

  // Последняя известная позиция по рейсу (polling диспетчера/покупателя).
  async getLatestPosition(tripId: string) {
    const [ping] = await this.listGpsPings(
      { trip_id: tripId },
      { order: { recorded_at: "DESC" }, take: 1 }
    )
    return ping ?? null
  }

  // Оценить стоимость доставки по активному тарифу зоны и габаритам заказа.
  async estimateDeliveryCost(
    zone: string,
    dimensions: { weight_kg?: number; volume_m3?: number }
  ) {
    const [tariff] = await this.listDeliveryTariffs(
      { zone, active: true },
      { take: 1 }
    )
    if (!tariff) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `No active delivery tariff for zone ${zone}`
      )
    }
    return calculateDeliveryCost({
      base_price: Number(tariff.base_price),
      price_per_kg: Number(tariff.price_per_kg),
      price_per_m3: Number(tariff.price_per_m3),
      weight_kg: dimensions.weight_kg,
      volume_m3: dimensions.volume_m3,
    })
  }
}

export default LogisticsModuleService
