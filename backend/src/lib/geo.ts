// Точка на карте — где покупатель поставил булавку, выбирая адрес доставки
// (карта 2ГИС на витрине). Хранится в metadata адреса ({ lat, lng }): своих
// колонок у адресов ядра нет, а metadata ядро переносит из адреса покупателя в
// корзину и заказ. По ней продавец и водитель открывают точку в 2ГИС.

export type GeoPoint = { lat: number; lng: number }

const coordinate = (value: unknown, limit: number): number | null => {
  const n = typeof value === "string" ? Number(value) : value
  return typeof n === "number" && Number.isFinite(n) && Math.abs(n) <= limit
    ? Math.round(n * 1e6) / 1e6
    : null
}

// Точка из пары чисел; что-то не так — null (точки нет, а не «0, 0»).
export const geoPoint = (lat: unknown, lng: unknown): GeoPoint | null => {
  const la = coordinate(lat, 90)
  const ln = coordinate(lng, 180)
  return la !== null && ln !== null && (la !== 0 || ln !== 0) ? { lat: la, lng: ln } : null
}

export const geoFromMetadata = (
  metadata: Record<string, unknown> | null | undefined
): GeoPoint | null => (metadata ? geoPoint(metadata.lat, metadata.lng) : null)

// Ссылка «открыть точку в 2ГИС» — обычная ссылка на сайт/приложение 2ГИС, не
// платный API: в 2ГИС координаты идут долготой вперёд.
export const dgisPointUrl = (point: GeoPoint): string =>
  `https://2gis.kz/astana/geo/${point.lng}%2C${point.lat}`
