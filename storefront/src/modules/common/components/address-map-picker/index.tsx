"use client"

import { useMessages } from "@lib/i18n/i18n-context"
import {
  ASTANA_CENTER,
  DGIS_KEY,
  DgisMap,
  MapPoint,
  PickedAddress,
  addressByObjectId,
  insideDeliveryZone,
  loadMapgl,
  mapsEnabled,
  reverseGeocode,
  reverseGeocodeAvailable,
  suggestAddresses,
} from "@lib/maps/dgis"
import { clx } from "@medusajs/ui"
import { useEffect, useRef, useState } from "react"

type Status =
  | "idle"
  | "detecting"
  | "found"
  | "outside"
  | "notFound"
  | "pointOnly"
  | "failed"
  | "geoDenied"

// Выбор адреса доставки на карте 2ГИС, как в приложениях доставки: булавка
// стоит по центру, покупатель двигает карту — под картой адрес этой точки;
// поиск с подсказками и «Моё местоположение». Выбранное уходит в onPick —
// форма подставляет улицу и дом в поле адреса (его можно уточнить текстом) и
// сохраняет точку. Без ключа 2ГИС компонент не рисуется вовсе.
//
// Адрес определяется только после движения карты покупателем: открытая карта
// не должна перетирать адрес, который он уже ввёл.
// Ключ без адреса по точке (демо 2ГИС): булавка только отмечает точку —
// onPoint получает координаты, текст адреса покупатель находит поиском.
const AddressMapPicker = ({
  initial,
  onPick,
  onPoint,
}: {
  initial?: MapPoint | null
  onPick: (picked: PickedAddress) => void
  onPoint?: (point: MapPoint) => void
}) => {
  const m = useMessages()
  const t = m.common.addressMap
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<DgisMap | null>(null)
  const skipMove = useRef(true)
  const detectAbort = useRef<AbortController | null>(null)
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pickRef = useRef(onPick)
  pickRef.current = onPick
  const pointRef = useRef(onPoint)
  pointRef.current = onPoint

  const [status, setStatus] = useState<Status>("idle")
  const [label, setLabel] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<PickedAddress[]>([])
  const [open, setOpen] = useState(false)

  const show = (picked: PickedAddress) => {
    setLabel(picked.label)
    setStatus(insideDeliveryZone(picked) ? "found" : "outside")
    pickRef.current(picked)
  }

  const detect = async (point: MapPoint) => {
    detectAbort.current?.abort()
    const controller = new AbortController()
    detectAbort.current = controller
    setStatus("detecting")
    try {
      const picked = await reverseGeocode(point, controller.signal)
      if (controller.signal.aborted) {
        return
      }
      if (!picked) {
        setLabel(null)
        if (!reverseGeocodeAvailable()) {
          setStatus(insideDeliveryZone(point) ? "pointOnly" : "outside")
          pointRef.current?.(point)
          return
        }
        setStatus("notFound")
        return
      }
      show(picked)
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        setStatus("failed")
      }
    }
  }

  const pickObject = async (objectId: string, point: MapPoint) => {
    detectAbort.current?.abort()
    const controller = new AbortController()
    detectAbort.current = controller
    setStatus("detecting")
    try {
      const picked = await addressByObjectId(objectId, point, controller.signal)
      if (controller.signal.aborted) {
        return
      }
      if (picked) {
        show(picked)
      } else {
        detect(point)
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        detect(point)
      }
    }
  }

  useEffect(() => {
    if (!mapsEnabled() || !container.current) {
      return
    }
    let destroyed = false
    const start = initial ?? ASTANA_CENTER
    loadMapgl()
      .then((mapgl) => {
        if (destroyed || !container.current) {
          return
        }
        const instance = new mapgl.Map(container.current, {
          center: [start.lng, start.lat],
          zoom: initial ? 17 : 12,
          key: DGIS_KEY,
          zoomControl: "bottomRight",
        })
        map.current = instance
        instance.on("moveend", () => {
          if (skipMove.current) {
            skipMove.current = false
            return
          }
          if (moveTimer.current) {
            clearTimeout(moveTimer.current)
          }
          moveTimer.current = setTimeout(() => {
            const [lng, lat] = instance.getCenter()
            detect({ lat, lng })
          }, 350)
        })
        // Первое «moveend» — от самой карты при создании, не от покупателя.
        instance.on("dragstart", () => {
          skipMove.current = false
        })
        // Нажали на дом — булавка встаёт туда, адрес здания идёт в форму. На
        // пустое место — просто точка.
        instance.on("click", (event) => {
          const [lng, lat] = event.lngLat
          const point = { lat, lng }
          skipMove.current = true
          instance.setCenter([lng, lat], { duration: 300 })
          const objectId = event.targetData?.id
          if (objectId) {
            pickObject(objectId, point)
          } else {
            detect(point)
          }
        })
      })
      .catch(() => setStatus("failed"))
    return () => {
      destroyed = true
      detectAbort.current?.abort()
      if (moveTimer.current) {
        clearTimeout(moveTimer.current)
      }
      map.current?.destroy()
      map.current = null
    }
    // Карта создаётся один раз; начальная точка дальше не управляет ею.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Подсказки при вводе: с паузой, от трёх букв, рядом с текущей точкой карты.
  useEffect(() => {
    const text = query.trim()
    if (text.length < 3 || !open) {
      setSuggestions([])
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      const center = map.current?.getCenter()
      try {
        setSuggestions(
          await suggestAddresses(
            text,
            center ? { lng: center[0], lat: center[1] } : ASTANA_CENTER,
            controller.signal
          )
        )
      } catch {
        // Подсказок нет — покупатель двигает карту или пишет адрес текстом.
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, open])

  if (!mapsEnabled()) {
    return null
  }

  const choose = (picked: PickedAddress) => {
    setOpen(false)
    setQuery(picked.label)
    detectAbort.current?.abort()
    // Камера едет к выбранному месту — это не «покупатель подвинул карту».
    skipMove.current = true
    map.current?.setCenter([picked.lng, picked.lat], { duration: 400 })
    map.current?.setZoom(17, { duration: 400 })
    show(picked)
  }

  const locate = () => {
    if (!navigator.geolocation) {
      setStatus("geoDenied")
      return
    }
    setStatus("detecting")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        skipMove.current = true
        map.current?.setCenter([point.lng, point.lat], { duration: 400 })
        map.current?.setZoom(17, { duration: 400 })
        detect(point)
      },
      () => setStatus("geoDenied"),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const statusText: Record<Status, string | null> = {
    idle: t.hint,
    detecting: t.detecting,
    found: label,
    outside: label,
    notFound: t.notFound,
    pointOnly: t.pointOnly,
    failed: t.failed,
    geoDenied: t.geoDenied,
  }

  return (
    <div className="flex flex-col gap-2" data-testid="address-map-picker">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={t.search}
          className="h-11 w-full rounded-chip border border-line bg-surface-dim px-3 text-body-medium text-ink placeholder:text-ink-secondary focus:border-accent focus:outline-none"
          data-testid="address-map-search"
        />
        {open && suggestions.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-20 mt-1 flex max-h-64 flex-col overflow-y-auto rounded-chip border border-line bg-surface py-1 shadow-lg">
            {suggestions.map((item) => (
              <li key={`${item.label}-${item.lat}-${item.lng}`}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(item)}
                  className="flex w-full flex-col items-start px-3 py-2 text-left transition-colors hover:bg-surface-dim"
                >
                  <span className="text-body-medium font-semibold text-ink">
                    {item.address_1}
                  </span>
                  <span className="text-body-medium text-ink-secondary">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative h-64 overflow-hidden rounded-card border border-line bg-surface-dim small:h-72">
        <div ref={container} className="absolute inset-0" />
        {/* Булавка всегда в центре карты: двигается карта, а не булавка. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full"
        >
          <svg viewBox="0 0 32 40" className="h-10 w-8 drop-shadow-md">
            <path
              d="M16 39s13-12.4 13-23A13 13 0 003 16c0 10.6 13 23 13 23z"
              className="fill-accent"
            />
            <circle cx="16" cy="16" r="5" className="fill-surface" />
          </svg>
        </div>
        <button
          type="button"
          onClick={locate}
          className="absolute bottom-3 left-3 z-10 inline-flex min-h-[40px] items-center gap-1.5 rounded-full bg-surface px-3 text-body-medium font-semibold text-ink shadow-md transition-colors hover:bg-surface-dim"
          data-testid="address-map-locate"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 text-accent" aria-hidden="true">
            <path
              d="M17 3L3 9.2l5.8 2 2 5.8L17 3z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
          </svg>
          {t.myLocation}
        </button>
      </div>

      <p
        className={clx(
          "text-body-medium",
          status === "found" ? "font-semibold text-ink" : "text-ink-secondary",
          (status === "failed" || status === "geoDenied") && "text-error"
        )}
        role="status"
        data-testid="address-map-status"
      >
        {statusText[status]}
      </p>
      {status === "outside" && (
        <p className="text-body-medium font-semibold text-warning" role="alert">
          {t.outside}
        </p>
      )}
    </div>
  )
}

export default AddressMapPicker
