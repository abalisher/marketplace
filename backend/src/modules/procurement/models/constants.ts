import { MedusaError } from "@medusajs/framework/utils"

// Статус прихода (накладной закупа): черновик → проведён. Проводка порождает
// партии и увеличивает остаток ядра (workflow). Терминальный posted — без переходов.
export const RECEIPT_STATUSES = ["draft", "posted"] as const
export type ReceiptStatus = (typeof RECEIPT_STATUSES)[number]

export const RECEIPT_TRANSITIONS: Record<ReceiptStatus, ReceiptStatus[]> = {
  draft: ["posted"],
  posted: [],
}

// Источник строк прихода: ручной ввод либо ИИ-приёмка (разбор накладной / фото).
// invoice_ai/photo_ai — подзадача 2 (Claude API); строки ИИ приходят с
// recognized_title и пустым variant_id до сопоставления с SKU продавцом.
export const RECEIPT_SOURCES = ["manual", "invoice_ai", "photo_ai"] as const
export type ReceiptSource = (typeof RECEIPT_SOURCES)[number]

// Чистая проверка перехода прихода — standalone-функция, НЕ метод сервиса (правило
// @medusajs/service-methods-must-be-async; идиома logistics assertTripTransition).
export const assertReceiptTransition = (
  from: ReceiptStatus,
  to: ReceiptStatus
): void => {
  if (!RECEIPT_TRANSITIONS[from].includes(to)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Receipt transition ${from} → ${to} is not allowed`
    )
  }
}

// Себестоимость строки прихода: кол-во × закуп-цена (минорные единицы, тиын).
// Округление к целому минору (материалы дробны по кол-ву, деньги — целые тиыны).
export const lineCost = (quantity: number, unitCost: number): number =>
  Math.round(Math.max(0, quantity) * Math.max(0, unitCost))

// Слой себестоимости (открытая партия) для FIFO. received_at — момент прихода:
// списываем от самой ранней партии. unit_cost — минорные единицы.
export type CostLayer = {
  id: string
  unit_cost: number
  quantity_remaining: number
  received_at: Date | string | number
}

// Один списанный слой при FIFO-потреблении.
export type FifoDraw = {
  batch_id: string
  quantity: number
  unit_cost: number
  cost: number
}

export type FifoConsumption = {
  // Слои, из которых списано (в порядке FIFO).
  draws: FifoDraw[]
  // Совокупная себестоимость списанного (COGS, минорные единицы).
  cogs: number
  // Сколько запрошенного НЕ покрыто партиями (0 — хватило).
  shortfall: number
}

// Чистое FIFO-списание: потребляет quantity из открытых партий, начиная с самой
// ранней по received_at. Возвращает списанные слои, COGS и недостачу. Ничего не
// мутирует — применение к партиям делает сервис. Standalone (идиома
// calculateDeliveryCost/calculateMaterialQuantity). Решение владельца 2026-07-22 —
// FIFO вместо средневзвешенной (docs/modules/procurement.md).
export const consumeFifo = (
  layers: CostLayer[],
  quantity: number
): FifoConsumption => {
  const sorted = [...layers]
    .filter((l) => l.quantity_remaining > 0)
    .sort(
      (a, b) =>
        new Date(a.received_at).getTime() - new Date(b.received_at).getTime()
    )
  let remaining = Math.max(0, quantity)
  const draws: FifoDraw[] = []
  let cogs = 0
  for (const layer of sorted) {
    if (remaining <= 0) {
      break
    }
    const take = Math.min(layer.quantity_remaining, remaining)
    const cost = Math.round(take * layer.unit_cost)
    draws.push({
      batch_id: layer.id,
      quantity: take,
      unit_cost: layer.unit_cost,
      cost,
    })
    cogs += cost
    remaining -= take
  }
  return { draws, cogs, shortfall: Math.max(0, remaining) }
}

// Себестоимость текущего остатка варианта = Σ(остаток партии × закуп-цена) по
// открытым партиям (минорные единицы). Чистая функция.
export const inventoryCostValue = (layers: CostLayer[]): number =>
  layers.reduce(
    (sum, l) => sum + lineCost(Math.max(0, l.quantity_remaining), l.unit_cost),
    0
  )
