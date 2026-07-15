import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import KaspiPaymentProvider from "./service"

// Полный id провайдера у ядра: pp_<модуль>_<identifier класса>. Под ним
// провайдер значится в таблице payment_provider и в payment_providers региона.
export const KASPI_PROVIDER_ID = "pp_kaspi_kaspi"

// Регистрируется как ПРОВАЙДЕР под ядровым модулем @medusajs/payment
// (не самостоятельный модуль). Подключение — в medusa-config.ts внутри
// options.providers ядрового payment-модуля.
export default ModuleProvider(Modules.PAYMENT, {
  services: [KaspiPaymentProvider],
})
