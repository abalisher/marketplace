import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { LOGISTICS_MODULE } from "../../modules/logistics"
import LogisticsModuleService from "../../modules/logistics/service"

export type UpsertDeliveryTariffStepInput = {
  zone: string
  base_price: number
  price_per_kg: number
  price_per_m3: number
  active?: boolean
}

// Единая форма компенсации (без union-ветвей — иначе ломается вывод типов
// createStep, идиома upsert-material-norm): создан ли тариф, его id и прежние
// поля (null при создании).
type TariffCompensation = {
  created: boolean
  id: string
  previous: {
    id: string
    zone: string
    base_price: number
    price_per_kg: number
    price_per_m3: number
    active: boolean
  } | null
}

// Upsert тарифа по zone: существует → обновить, иначе создать. Компенсация —
// восстановить прежние поля (при обновлении) либо удалить (при создании).
export const upsertDeliveryTariffStep = createStep(
  "upsert-delivery-tariff",
  async (input: UpsertDeliveryTariffStepInput, { container }) => {
    const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
    const [existing] = await service.listDeliveryTariffs(
      { zone: input.zone },
      { take: 1 }
    )

    if (existing) {
      const compensation: TariffCompensation = {
        created: false,
        id: existing.id,
        previous: {
          id: existing.id,
          zone: existing.zone,
          base_price: Number(existing.base_price),
          price_per_kg: Number(existing.price_per_kg),
          price_per_m3: Number(existing.price_per_m3),
          active: existing.active,
        },
      }
      const updated = await service.updateDeliveryTariffs({
        id: existing.id,
        ...input,
      })
      return new StepResponse(updated, compensation)
    }

    const created = await service.createDeliveryTariffs({
      ...input,
      active: input.active ?? true,
    })
    const compensation: TariffCompensation = {
      created: true,
      id: created.id,
      previous: null,
    }
    return new StepResponse(created, compensation)
  },
  async (comp, { container }) => {
    if (!comp) {
      return
    }
    const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
    if (comp.created) {
      await service.deleteDeliveryTariffs(comp.id)
      return
    }
    if (comp.previous) {
      await service.updateDeliveryTariffs(comp.previous)
    }
  }
)
