import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { LOGISTICS_MODULE } from "../../modules/logistics"
import LogisticsModuleService from "../../modules/logistics/service"

export type DeleteDeliveryTariffStepInput = { id: string }

// Удаление тарифа с компенсацией — воссозданием прежней строки при откате.
// Несуществующий id → 404.
export const deleteDeliveryTariffStep = createStep(
  "delete-delivery-tariff",
  async (input: DeleteDeliveryTariffStepInput, { container }) => {
    const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
    let tariff
    try {
      tariff = await service.retrieveDeliveryTariff(input.id)
    } catch {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Delivery tariff ${input.id} not found`
      )
    }
    const snapshot = {
      id: tariff.id,
      zone: tariff.zone,
      base_price: Number(tariff.base_price),
      price_per_kg: Number(tariff.price_per_kg),
      price_per_m3: Number(tariff.price_per_m3),
      active: tariff.active,
    }
    await service.deleteDeliveryTariffs(input.id)
    return new StepResponse({ id: input.id }, snapshot)
  },
  async (snapshot, { container }) => {
    if (!snapshot) {
      return
    }
    const service = container.resolve<LogisticsModuleService>(LOGISTICS_MODULE)
    await service.createDeliveryTariffs(snapshot)
  }
)
