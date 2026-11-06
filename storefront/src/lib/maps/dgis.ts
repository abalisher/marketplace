// Карта 2ГИС для выбора адреса доставки: загрузка MapGL JS, адрес по точке
// (булавка) и подсказки при вводе. Только браузер. Ключ — публичный по природе
// (его видит любой посетитель страницы с картой), приходит в сборку через
// NEXT_PUBLIC_2GIS_KEY; без ключа карта не показывается, и адрес вводят
// текстом, как раньше.

export const DGIS_KEY = process.env.NEXT_PUBLIC_2GIS_KEY ?? ""
export const mapsEnabled = (): boolean => !!DGIS_KEY

// Центр Астаны и радиус зоны доставки: точка дальше — предупреждаем.
export const ASTANA_CENTER = { lat: 51.128207, lng: 71.430411 }
const DELIVERY_RADIUS_KM = 30

export type MapPoint = { lat: number; lng: number }

export type PickedAddress = MapPoint & {
  // Улица и дом — то, что ляжет в поле адреса («Асфендиярова, 11»).
  address_1: string
  // Подпись для покупателя целиком («Астана, Асфендиярова, 11, ЖК …»).
  label: string
}

const CATALOG = "https://catalog.api.2gis.com/3.0"
const MAPGL_SRC = "https://mapgl.2gis.com/api/js/v1"

export const distanceKm = (a: MapPoint, b: MapPoint): number => {
  const rad = (deg: number) => (deg * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h))
}

export const insideDeliveryZone = (point: MapPoint): boolean =>
  distanceKm(point, ASTANA_CENTER) <= DELIVERY_RADIUS_KM

// MapGL JS грузится один раз на вкладку.
type MapglNamespace = {
  Map: new (
    container: HTMLElement,
    options: Record<string, unknown>
  ) => DgisMap
}
// Клик по карте: точка и объект под пальцем (здание 2ГИС — targetData.id).
export type DgisMapClick = {
  lngLat: [number, number]
  targetData?: { type?: string; id?: string } | null
}

export type DgisMap = {
  on: (event: string, handler: (event: DgisMapClick) => void) => void
  getCenter: () => [number, number]
  setCenter: (center: [number, number], options?: Record<string, unknown>) => void
  setZoom: (zoom: number, options?: Record<string, unknown>) => void
  destroy: () => void
}

let mapglPromise: Promise<MapglNamespace> | null = null

export const loadMapgl = (): Promise<MapglNamespace> => {
  const existing = (window as unknown as { mapgl?: MapglNamespace }).mapgl
  if (existing) {
    return Promise.resolve(existing)
  }
  if (!mapglPromise) {
    mapglPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = MAPGL_SRC
      script.async = true
      script.onload = () => {
        const loaded = (window as unknown as { mapgl?: MapglNamespace }).mapgl
        loaded ? resolve(loaded) : reject(new Error("mapgl not loaded"))
      }
      script.onerror = () => {
        mapglPromise = null
        reject(new Error("mapgl failed to load"))
      }
      document.head.appendChild(script)
    })
  }
  return mapglPromise
}

type CatalogItem = {
  name?: string
  full_name?: string
  address_name?: string
  type?: string
  point?: { lat: number; lon: number }
}

// Название здания без вида объекта: «Sat city блок J, жилой комплекс» →
// «Sat city блок J».
const buildingName = (name: string | undefined): string =>
  (name ?? "").replace(/,\s*(жилой комплекс|бизнес-центр|торговый центр)$/i, "").trim()

const toPicked = (item: CatalogItem, fallback?: MapPoint): PickedAddress | null => {
  const point = item.point ? { lat: item.point.lat, lng: item.point.lon } : fallback
  // Улица с домом: у здания — address_name («улица Санжара Асфендиярова, 11»),
  // у самой улицы — name. У здания с названием (ЖК, блок) оно идёт следом —
  // водителю «блок J» нужнее, чем кажется.
  const street = (item.address_name || item.name || "").trim()
  if (!point || !street) {
    return null
  }
  const named = item.address_name ? buildingName(item.name) : ""
  return {
    ...point,
    address_1: named && named !== street ? `${street}, ${named}` : street,
    label: (item.full_name || street).trim(),
  }
}

// Адрес по точке есть не во всех ключах 2ГИС (в демо-ключе — нет, 403).
// Однажды получили отказ — больше не спрашиваем: булавка просто отмечает точку.
let reverseUnavailable = false
export const reverseGeocodeAvailable = (): boolean => !reverseUnavailable

const catalog = async (
  path: string,
  params: Record<string, string>,
  signal?: AbortSignal
): Promise<CatalogItem[]> => {
  const query = new URLSearchParams({ ...params, key: DGIS_KEY, locale: "ru_KZ" })
  const response = await fetch(`${CATALOG}/${path}?${query}`, { signal })
  if (!response.ok) {
    throw new Error(`2gis ${path}: ${response.status}`)
  }
  const body = (await response.json()) as { result?: { items?: CatalogItem[] } }
  return body.result?.items ?? []
}

// Адрес по точке, где стоит булавка. Ближайшее здание, иначе улица. null —
// в этой точке адреса нет (поле, стройка).
export const reverseGeocode = async (
  point: MapPoint,
  signal?: AbortSignal
): Promise<PickedAddress | null> => {
  if (reverseUnavailable) {
    return null
  }
  let items: CatalogItem[]
  try {
    items = await catalog(
    "items/geocode",
    {
      lat: String(point.lat),
      lon: String(point.lng),
      fields: "items.point,items.address",
      type: "building,street,adm_div.place",
    },
    signal
    )
  } catch (error) {
    if ((error as Error).message.endsWith(": 403")) {
      reverseUnavailable = true
      return null
    }
    throw error
  }
  const building = items.find((item) => item.type === "building") ?? items[0]
  // Точку оставляем ту, где булавка: к ней приедет водитель.
  return building ? toPicked({ ...building, point: undefined }, point) : null
}

// Адрес здания, на которое нажали на карте: MapGL отдаёт id объекта, каталог —
// его адрес. Работает и в демо-ключе, где адреса по точке нет. Точка — где
// нажали (у большого дома это ближе к нужному подъезду, чем центр здания).
export const addressByObjectId = async (
  objectId: string,
  point: MapPoint,
  signal?: AbortSignal
): Promise<PickedAddress | null> => {
  const id = objectId.split("_")[0]
  if (!/^\d+$/.test(id)) {
    return null
  }
  const items = await catalog(
    "items/byid",
    { id, fields: "items.point,items.address" },
    signal
  )
  const item = items[0]
  return item ? toPicked({ ...item, point: undefined }, point) : null
}

// Подсказки при вводе: дома, улицы и ЖК рядом с текущей точкой карты.
export const suggestAddresses = async (
  text: string,
  near: MapPoint,
  signal?: AbortSignal
): Promise<PickedAddress[]> => {
  const params = {
    q: text,
    location: `${near.lng},${near.lat}`,
    fields: "items.point",
    type: "building,street,adm_div.place",
  }
  let items: CatalogItem[]
  try {
    items = await catalog("suggests", { ...params, suggest_type: "address" }, signal)
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw error
    }
    // Подсказок нет в ключе — тот же поиск геокодером.
    items = await catalog("items/geocode", params, signal)
  }
  return items
    .map((item) => toPicked(item))
    .filter((item): item is PickedAddress => !!item)
    .slice(0, 6)
}
