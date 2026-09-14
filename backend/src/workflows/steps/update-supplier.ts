import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PROCUREMENT_MODULE } from "../../modules/procurement"
import ProcurementModuleService from "../../modules/procurement/service"

export type UpdateSupplierStepInput = {
  id: string
  name?: string
  bin?: string | null
  contact_phone?: string | null
  contact_email?: string | null
  note?: string | null
  active?: boolean
}

// Правка поставщика (в т.ч. деактивация active=false — мягкое «удаление»:
// приход ссылается опазной колонкой, хардовый DELETE осиротил бы её). Снимок
// прежних полей для отката — идиома logistics upsert-delivery-tariff.
export const updateSupplierStep = createStep(
  "update-supplier",
  async (input: UpdateSupplierStepInput, { container }) => {
    const service =
      container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    const prior = await service.retrieveSupplier(input.id)
    const updated = await service.updateSuppliers({ ...input })
    return new StepResponse(updated, {
      id: prior.id,
      name: prior.name,
      bin: prior.bin,
      contact_phone: prior.contact_phone,
      contact_email: prior.contact_email,
      note: prior.note,
      active: prior.active,
    })
  },
  async (snapshot, { container }) => {
    if (!snapshot) {
      return
    }
    const service =
      container.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)
    await service.updateSuppliers(snapshot)
  }
)
