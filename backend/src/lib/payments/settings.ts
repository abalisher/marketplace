import { MedusaContainer } from "@medusajs/framework/types"
import { ORDER_PAYMENT_MODULE } from "../../modules/order-payment"
import OrderPaymentModuleService from "../../modules/order-payment/service"
import { PaymentSettingsView, settingsView } from "./methods"

// Способы оплаты продавца канала: строка настроек или значения по умолчанию.
export const loadPaymentSettings = async (
  container: MedusaContainer,
  salesChannelId: string | null | undefined
): Promise<PaymentSettingsView> => {
  if (!salesChannelId) {
    return settingsView(null)
  }
  const service = container.resolve<OrderPaymentModuleService>(ORDER_PAYMENT_MODULE)
  return settingsView(await service.getSettingsByChannel(salesChannelId))
}
