import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PROCUREMENT_MODULE } from "../../modules/procurement"
import ProcurementModuleService from "../../modules/procurement/service"

export type CreateSupplierStepInput = {
  name: string
  bin?: string | null
  contact_phone?: string | null
  contact_email?: string | null
  note?: string | null
}

// Завести поставщика (planned активным) с компенсацией-удалением при откате
// workflow. Идиома logistics create-trip.
export const createSupplierStep = createStep(
  "create-supplier",
  async (input: CreateSupplierStepInput, { container }) => {
    const service =
      container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    const supplier = await service.createSupplier(input)
    return new StepResponse(supplier, supplier.id)
  },
  async (supplierId, { container }) => {
    if (!supplierId) {
      return
    }
    const service =
      container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    await service.deleteSuppliers(supplierId)
  }
)
