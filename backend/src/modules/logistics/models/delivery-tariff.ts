import { model } from "@medusajs/framework/utils"

// Тарифная сетка доставки — АДМИНИСТРИРУЕМАЯ (не хардкод): зона (город/район) +
// база + ставки за вес/объём. Цены в минорных единицах (тенге). Расчёт стоимости
// — чистая функция calculateDeliveryCost (constants). Применение к заказу через
// shipping option — workflow (подзадача 2), не прямой импорт order.
const DeliveryTariff = model.define("delivery_tariff", {
  id: model.id({ prefix: "dtar" }).primaryKey(),
  zone: model.text(),
  base_price: model.number().default(0),
  price_per_kg: model.float().default(0),
  price_per_m3: model.float().default(0),
  active: model.boolean().default(true),
})

export default DeliveryTariff
