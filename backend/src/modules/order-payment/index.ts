import { Module } from "@medusajs/framework/utils"
import OrderPaymentModuleService from "./service"

export const ORDER_PAYMENT_MODULE = "order_payment"

export default Module(ORDER_PAYMENT_MODULE, {
  service: OrderPaymentModuleService,
})
