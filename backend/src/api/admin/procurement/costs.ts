// Себестоимость и наценка позиции (T4.9a) — чистые функции слоя API. Здесь
// сходятся ДВА домена: закуп-цена живёт в партиях модуля `procurement`
// (FIFO, решение владельца 2026-07-22), цена продажи — в price set ядра.
// Поэтому свод считается на слое роута (идиома price-stock/rows.ts), а не в
// модуле: модуль не знает о ценах каталога.
//
// Деньги — целые тенге (Medusa v2 хранит суммы в основной единице валюты,
// см. DECISIONS 2026-07-23): ×100 не делаем ни здесь, ни в UI.

// Партия закупа в том виде, в каком её отдаёт модуль (нужные для свода поля).
export type CostBatch = {
  unit_cost: number
  quantity_received: number
  quantity_remaining: number
  received_at: Date | string | number | null
}

// На какой базе посчитана средняя закуп-цена: по остатку ОТКРЫТЫХ ПАРТИЙ
// («сколько нам стоит то, что лежит») или, когда открытых партий не осталось,
// по всем приходам («по какой цене мы это покупали»). Разница важна закупщику:
// во втором случае цифра историческая, экран говорит это словами.
//
// NB: остаток партий — не складской остаток ядра. Списание партий при продаже
// (FIFO) — отложенная подзадача модуля procurement, поэтому пока партии
// показывают принятое приходами. Экран называет это партиями, а не остатком.
export type AverageCostBasis = "stock" | "receipts"

export type VariantCostSummary = {
  // Закуп-цена последнего прихода — тот самый «купили по 2 350 ₸».
  last_cost: number | null
  last_cost_at: string | null
  average_cost: number | null
  average_basis: AverageCostBasis | null
  // Остаток по открытым партиям и его себестоимость (Σ остаток × закуп-цена).
  batch_quantity: number
  batch_cost_value: number
  // Цена продажи (price set ядра, рабочая валюта) и наценка к средней
  // себестоимости: в тенге и в процентах.
  price: number | null
  margin: number | null
  markup_percent: number | null
}

const receivedTime = (value: CostBatch["received_at"]): number =>
  value ? new Date(value).getTime() : 0

// Закуп-цена самого позднего прихода. Партии одного дня различаем по порядку в
// списке: модуль отдаёт их по received_at ASC, поэтому при равных датах
// последней считается та, что пришла позже в выборке.
export const lastPurchaseCost = (
  batches: CostBatch[]
): { cost: number | null; at: string | null } => {
  let latest: CostBatch | null = null
  for (const batch of batches) {
    if (!latest || receivedTime(batch.received_at) >= receivedTime(latest.received_at)) {
      latest = batch
    }
  }
  if (!latest) {
    return { cost: null, at: null }
  }
  return {
    cost: Number(latest.unit_cost),
    at: latest.received_at ? new Date(latest.received_at).toISOString() : null,
  }
}

// Средневзвешенная закуп-цена. База — остаток по открытым партиям; если
// открытых партий нет вовсе, считаем по принятым количествам, чтобы экран не
// показывал прочерк там, где приходы были.
export const averagePurchaseCost = (
  batches: CostBatch[]
): { cost: number | null; basis: AverageCostBasis | null } => {
  const weighted = (
    quantityOf: (batch: CostBatch) => number
  ): number | null => {
    let quantity = 0
    let cost = 0
    for (const batch of batches) {
      const qty = Math.max(0, Number(quantityOf(batch)))
      quantity += qty
      cost += qty * Math.max(0, Number(batch.unit_cost))
    }
    return quantity > 0 ? Math.round(cost / quantity) : null
  }

  const byBatches = weighted((batch) => batch.quantity_remaining)
  if (byBatches !== null) {
    return { cost: byBatches, basis: "stock" }
  }
  const byReceipts = weighted((batch) => batch.quantity_received)
  if (byReceipts !== null) {
    return { cost: byReceipts, basis: "receipts" }
  }
  return { cost: null, basis: null }
}

// Наценка к себестоимости: в тенге (цена − себестоимость) и в процентах от
// себестоимости, с одним знаком после запятой. Себестоимость 0 (приход по
// нулевой цене — брак, подарок поставщика) процента не даёт: делить не на что,
// а «∞ %» на экране закупщику ничего не говорит.
export const markup = (
  price: number | null,
  cost: number | null
): { margin: number | null; markup_percent: number | null } => {
  if (price === null || cost === null) {
    return { margin: null, markup_percent: null }
  }
  const margin = Math.round(price - cost)
  return {
    margin,
    markup_percent: cost > 0 ? Math.round((margin / cost) * 1000) / 10 : null,
  }
}

// Свод по варианту: последняя и средняя закуп-цена, остаток партий и его
// себестоимость, цена продажи и наценка.
export const variantCostSummary = (
  batches: CostBatch[],
  price: number | null
): VariantCostSummary => {
  const last = lastPurchaseCost(batches)
  const average = averagePurchaseCost(batches)
  const batchQuantity = batches.reduce(
    (sum, batch) => sum + Math.max(0, Number(batch.quantity_remaining)),
    0
  )
  const batchCostValue = batches.reduce(
    (sum, batch) =>
      sum +
      Math.round(
        Math.max(0, Number(batch.quantity_remaining)) *
          Math.max(0, Number(batch.unit_cost))
      ),
    0
  )

  return {
    last_cost: last.cost,
    last_cost_at: last.at,
    average_cost: average.cost,
    average_basis: average.basis,
    batch_quantity: Math.round(batchQuantity * 1000) / 1000,
    batch_cost_value: batchCostValue,
    price,
    ...markup(price, average.cost),
  }
}
