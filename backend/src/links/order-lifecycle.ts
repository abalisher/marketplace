import { defineLink } from "@medusajs/framework/utils"
import OrderModule from "@medusajs/medusa/order"
import OrderLifecycleModule from "../modules/order-lifecycle"

// Заказ ядра ↔ кастомный жизненный цикл (1:1): у каждого заказа ровно один
// OrderLifecycle (source of truth для этапов ТЗ). FK на order в модели нет
// намеренно — правило изоляции (как product-product-card).
export default defineLink(
  OrderModule.linkable.order,
  OrderLifecycleModule.linkable.orderLifecycle
)
