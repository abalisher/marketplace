// Сериализаторы ответов admin API логистики: приводят строки модуля к плоским
// DTO контракта (даты → ISO, decimal → number). Держим в одном файле по
// назначению (идиома validators.ts), роуты остаются тонкими.

const iso = (d: Date | string | null): string | null =>
  d ? new Date(d).toISOString() : null

export const serializeTrip = (trip: {
  id: string
  driver_id: string
  location_id: string
  status: string
  started_at: Date | null
  finished_at: Date | null
  note: string | null
}) => ({
  id: trip.id,
  driver_id: trip.driver_id,
  location_id: trip.location_id,
  status: trip.status,
  started_at: iso(trip.started_at),
  finished_at: iso(trip.finished_at),
  note: trip.note,
})

export const serializeStop = (stop: {
  id: string
  order_id: string
  type: string
  sequence: number
  status: string
  address_snapshot: Record<string, unknown> | null
  proof: Record<string, unknown> | null
  checklist: Record<string, unknown> | null
  note: string | null
}) => ({
  id: stop.id,
  order_id: stop.order_id,
  type: stop.type,
  sequence: stop.sequence,
  status: stop.status,
  address_snapshot: stop.address_snapshot,
  proof: stop.proof,
  checklist: stop.checklist,
  note: stop.note,
})

export const serializeTariff = (tariff: {
  id: string
  zone: string
  base_price: number
  price_per_kg: number
  price_per_m3: number
  active: boolean
}) => ({
  id: tariff.id,
  zone: tariff.zone,
  base_price: Number(tariff.base_price),
  price_per_kg: Number(tariff.price_per_kg),
  price_per_m3: Number(tariff.price_per_m3),
  active: tariff.active,
})

export const serializePing = (ping: {
  id: string
  trip_id: string
  driver_id: string
  lat: number
  lng: number
  recorded_at: Date | null
}) => ({
  id: ping.id,
  trip_id: ping.trip_id,
  driver_id: ping.driver_id,
  lat: Number(ping.lat),
  lng: Number(ping.lng),
  recorded_at: iso(ping.recorded_at),
})
