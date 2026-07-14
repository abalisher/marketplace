import { Module } from "@medusajs/framework/utils"
import OrderLifecycleModuleService from "./service"

// Ключ — order_lifecycle (НЕ order: order занят ядровым модулем заказов).
export const ORDER_LIFECYCLE_MODULE = "order_lifecycle"

export default Module(ORDER_LIFECYCLE_MODULE, {
  service: OrderLifecycleModuleService,
})
