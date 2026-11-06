import { MedusaContainer } from "@medusajs/framework/types"
import { DOCUMENTS_MODULE } from "../../modules/documents"
import DocumentsModuleService from "../../modules/documents/service"
import { TENANT_MODULE } from "../../modules/tenant"
import TenantModuleService from "../../modules/tenant/service"

type DocumentSettings = Awaited<
  ReturnType<DocumentsModuleService["getOrCreateSettings"]>
>

type TenantRequisites = {
  name: string
  bin?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  bank_name?: string | null
  bank_bik?: string | null
  bank_iban?: string | null
  bank_kbe?: string | null
  bank_knp?: string | null
  director_name?: string | null
  vat_rate?: number | null
  footer_note?: string | null
}

// Реквизиты продавца документа: настройки документов + ставка НДС (у площадки
// её нет — не плательщик).
export type SellerSettings = DocumentSettings & { vat_rate: number | null }

// Реквизиты продавца заказа компании — ЦЕЛИКОМ её собственные. Подмешивать
// реквизиты площадки нельзя: счёт с наименованием компании и банком площадки
// юридически негоден, а проверка полноты (missingRequisites) пропустила бы его.
// Пустое поле компании остаётся пустым — и выпуск честно откажет.
export const tenantSellerSettings = (
  settings: DocumentSettings,
  tenant: TenantRequisites
): SellerSettings => ({
  ...settings,
  seller_name: tenant.name,
  seller_bin: tenant.bin ?? null,
  seller_address: tenant.address ?? null,
  seller_phone: tenant.phone ?? null,
  seller_email: tenant.email ?? null,
  seller_bank_name: tenant.bank_name ?? null,
  seller_bank_bik: tenant.bank_bik ?? null,
  seller_iban: tenant.bank_iban ?? null,
  seller_kbe: tenant.bank_kbe ?? settings.seller_kbe,
  seller_knp: tenant.bank_knp ?? settings.seller_knp,
  director_name: tenant.director_name ?? null,
  vat_rate: tenant.vat_rate ?? null,
  footer_note: tenant.footer_note ?? null,
})

// Реквизиты продавца для заказа канала `salesChannelId`: канал компании —
// реквизиты компании, иначе — реквизиты площадки (singleton documents).
// Единственная точка правила: выпуск документа, автовыпуск в подписчиках и
// реестр документов в панели читают реквизиты отсюда.
export const loadSellerSettings = async (
  container: MedusaContainer,
  salesChannelId: string | null | undefined
): Promise<SellerSettings> => {
  const documentsService =
    container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
  const settings = await documentsService.getOrCreateSettings()
  if (!salesChannelId) {
    return { ...settings, vat_rate: null }
  }
  const tenant = await container
    .resolve<TenantModuleService>(TENANT_MODULE)
    .getBySalesChannel(salesChannelId)
  return tenant
    ? tenantSellerSettings(settings, tenant)
    : { ...settings, vat_rate: null }
}
