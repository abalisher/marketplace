import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { CATALOG_MODULE } from "../../modules/catalog"
import CatalogModuleService from "../../modules/catalog/service"
import { PriceChangeSource } from "../../modules/catalog/models/price-change"

// Одна запись журнала: было → стало по цене и/или остатку. Пустая пара значит
// «не трогали» (правка только цены оставляет остаток пустым).
export type PriceChangeRecord = {
  variant_id: string
  product_id: string | null
  product_title: string
  variant_title: string | null
  sku: string | null
  currency_code: string | null
  old_price: number | null
  new_price: number | null
  location_id: string | null
  old_stock: number | null
  new_stock: number | null
}

export type RecordPriceChangesStepInput = {
  records: PriceChangeRecord[]
  changed_by: string | null
  changed_by_name: string | null
  source: PriceChangeSource
}

// Журнал правок цены и остатка (T10.14): ядро истории не хранит — price set
// перезаписывается, а уровень остатка знает только текущее число. Пишем факт
// сами, последним шагом: в журнал попадает только то, что реально применилось,
// а откат workflow записи удаляет.
export const recordPriceChangesStep = createStep(
  "record-price-changes",
  async (input: RecordPriceChangesStepInput, { container }) => {
    if (!input.records.length) {
      return new StepResponse<{ ids: string[] }, { ids: string[] }>(
        { ids: [] },
        { ids: [] }
      )
    }

    const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
    const created = await service.createPriceChanges(
      input.records.map((record) => ({
        ...record,
        changed_by: input.changed_by,
        changed_by_name: input.changed_by_name,
        source: input.source,
      }))
    )
    const ids = (Array.isArray(created) ? created : [created]).map(
      (row) => row.id
    )
    return new StepResponse<{ ids: string[] }, { ids: string[] }>(
      { ids },
      { ids }
    )
  },
  async (compensation, { container }) => {
    if (!compensation?.ids.length) {
      return
    }
    const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
    await service.deletePriceChanges(compensation.ids)
  }
)
