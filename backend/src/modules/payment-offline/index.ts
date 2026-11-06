import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import {
  DebtPaymentProvider,
  KaspiQrLaterPaymentProvider,
  TransferPaymentProvider,
} from "./service"

// Полные id у ядра: pp_<identifier>_<id регистрации> (id = "offline" в
// medusa-config.ts). Под ними провайдеры значатся в payment_providers региона.
export const TRANSFER_PROVIDER_ID = "pp_transfer_offline"
export const DEBT_PROVIDER_ID = "pp_debt_offline"
// Kaspi QR с оплатой после оформления (чат): счёт выставляется на заказ.
export const KASPI_QR_LATER_PROVIDER_ID = "pp_kaspiqr_offline"

export default ModuleProvider(Modules.PAYMENT, {
  services: [TransferPaymentProvider, DebtPaymentProvider, KaspiQrLaterPaymentProvider],
})
