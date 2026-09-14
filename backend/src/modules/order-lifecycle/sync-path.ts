import { ORDER_STATUS_TRANSITIONS } from "./service"
import {
  DeliveryMethod,
  OrderStatusValue,
} from "./models/statuses"

// Порядок предпочтения при догоне статуса: чем раньше в списке, тем охотнее
// планировщик ведёт путь через этот статус при равной длине. Нужен, чтобы
// догон шёл по основной линии ТЗ (…→ Собран → В доставке), а не сворачивал в
// «Частично собран»: ядро сообщает только факт отгрузки, а частичность —
// наша величина, домысливать её при синхронизации нельзя.
const SYNC_PREFERENCE: OrderStatusValue[] = [
  "confirmed",
  "assembling",
  "assembled",
  "in_delivery",
  "delivered",
  "closed",
  "partially_assembled",
  "returned",
  "canceled",
  "new",
]

const byPreference = (a: OrderStatusValue, b: OrderStatusValue) =>
  SYNC_PREFERENCE.indexOf(a) - SYNC_PREFERENCE.indexOf(b)

// Планировщик догона: кратчайший путь по стейт-машине из текущего статуса в
// целевой (тот, который следует из ядрового события). Возвращает ТОЛЬКО хопы
// перехода, без стартового статуса.
//
// Пустой результат = делать нечего, и это нормальный, а не ошибочный исход:
// (1) `from === to` — наш цикл уже там (так гасится эхо собственных workflow,
//     которые сами дёргают ядро и получают его событие обратно);
// (2) цель недостижима — наш цикл УШЁЛ ВПЕРЁД ядра (ядровая доставка при уже
//     закрытом заказе) или упёрся в терминальный статус (отменён/возврат).
// Вызывающая сторона различает эти случаи по `from === to` и в (2) пишет
// предупреждение: расхождение есть, но догонять его выдумкой нельзя.
export function planLifecycleSyncPath(
  from: OrderStatusValue,
  to: OrderStatusValue,
  method: DeliveryMethod = "delivery"
): OrderStatusValue[] {
  if (from === to) {
    return []
  }

  const map = ORDER_STATUS_TRANSITIONS[method] ?? ORDER_STATUS_TRANSITIONS.delivery
  const cameFrom = new Map<OrderStatusValue, OrderStatusValue>()
  const seen = new Set<OrderStatusValue>([from])
  let frontier: OrderStatusValue[] = [from]

  while (frontier.length) {
    const next: OrderStatusValue[] = []
    for (const status of frontier) {
      const neighbours = [...(map[status] ?? [])].sort(byPreference)
      for (const neighbour of neighbours) {
        if (seen.has(neighbour)) {
          continue
        }
        seen.add(neighbour)
        cameFrom.set(neighbour, status)
        if (neighbour === to) {
          return buildPath(cameFrom, from, to)
        }
        next.push(neighbour)
      }
    }
    frontier = next
  }

  return []
}

// Разворачивает путь по карте «откуда пришли» от цели к старту.
const buildPath = (
  cameFrom: Map<OrderStatusValue, OrderStatusValue>,
  from: OrderStatusValue,
  to: OrderStatusValue
): OrderStatusValue[] => {
  const path: OrderStatusValue[] = []
  let cursor: OrderStatusValue | undefined = to
  while (cursor && cursor !== from) {
    path.unshift(cursor)
    cursor = cameFrom.get(cursor)
  }
  return path
}
