import type { DriverOrderRef } from "../../lib/logistics/driver-trips"
import { OrderAddressSnapshot } from "../../lib/orders/driver-pool"

// Рейс и его точка, как их видит приложение водителя (идиома driver-view.ts).
// Отдельно от admin-сериализаторов логистики намеренно: диспетчеру важно, ЧЕЙ
// это рейс (driver_id), а водителю — свой рейс всегда свой, зато нужны адрес и
// контакт получателя, которых admin-виду не надо.
export type DriverTripView = {
  id: string
  status: string
  location_id: string
  started_at: string | null
  finished_at: string | null
  note: string | null
}

export type DriverTripStopView = {
  id: string
  trip_id: string
  order_id: string
  // Номер заказа, как его называет продавец в панели: водитель говорит
  // «двадцать восьмой», а не order_01H… (T5.2b).
  display_id: number | null
  // Номер для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  order_number: string | null
  type: string
  sequence: number
  status: string
  // Адрес снапшотом на момент, когда водитель взял заказ: везём туда, куда
  // договорились, а не туда, куда заказ отредактируют потом.
  address: OrderAddressSnapshot | null
  // Что приложено к выдаче (фото/подпись): экран точки показывает уже
  // отправленное, чтобы водитель не прикладывал фото второй раз.
  proof: Record<string, unknown> | null
  note: string | null
}

// Рейс вместе с точками: и список «мои рейсы», и экран одного рейса читают
// одну форму — в gig-модели рейс это один заказ, и разделять их незачем
// (Dart-клиент получает один тип).
export type DriverTripWithStopsView = DriverTripView & {
  stops: DriverTripStopView[]
}

// Строки модулей, из которых собираются виды: даты приходят Date из ORM и
// строкой из workflow-результата.
type TripRow = {
  id: string
  status: string
  location_id: string
  started_at?: Date | string | null
  finished_at?: Date | string | null
  note?: string | null
}

type TripStopRow = {
  id: string
  trip_id: string
  order_id: string
  type: string
  sequence: number
  status: string
  address_snapshot?: Record<string, unknown> | null
  proof?: Record<string, unknown> | null
  note?: string | null
}

const iso = (value: Date | string | null | undefined): string | null => {
  if (!value) {
    return null
  }
  return value instanceof Date ? value.toISOString() : value
}

export const toDriverTripView = (trip: TripRow): DriverTripView => ({
  id: trip.id,
  status: trip.status,
  location_id: trip.location_id,
  started_at: iso(trip.started_at),
  finished_at: iso(trip.finished_at),
  note: trip.note ?? null,
})

// Номер заказа приходит вторым аргументом: он живёт в модуле order, а не в
// точке рейса, — вид его не добывает, а получает от роута (одним запросом на
// весь список).
export const toDriverTripStopView = (
  stop: TripStopRow,
  ref: DriverOrderRef | null = null
): DriverTripStopView => ({
  id: stop.id,
  trip_id: stop.trip_id,
  order_id: stop.order_id,
  display_id: ref?.display_id ?? null,
  order_number: ref?.number ?? null,
  type: stop.type,
  sequence: stop.sequence,
  status: stop.status,
  address: (stop.address_snapshot as OrderAddressSnapshot | null) ?? null,
  proof: stop.proof ?? null,
  note: stop.note ?? null,
})

export const toDriverTripWithStopsView = (
  trip: TripRow,
  stops: TripStopRow[],
  orderNumbers: Map<string, DriverOrderRef>
): DriverTripWithStopsView => ({
  ...toDriverTripView(trip),
  stops: stops
    .filter((stop) => stop.trip_id === trip.id)
    .map((stop) =>
      toDriverTripStopView(stop, orderNumbers.get(stop.order_id) ?? null)
    ),
})

// Принятый GPS-пинг: приложению нужна только расписка «взяли, время такое».
// Трек и последнюю позицию читает не водитель, а диспетчер и покупатель.
export type DriverGpsPingView = {
  id: string
  recorded_at: string | null
}

export const toDriverGpsPingView = (ping: {
  id: string
  recorded_at?: Date | string | null
}): DriverGpsPingView => ({
  id: ping.id,
  recorded_at: iso(ping.recorded_at),
})
