import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ExecArgs } from "@medusajs/framework/types"
import {
  addShippingMethodToCartWorkflow,
  createCartWorkflow,
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { placeOrderWorkflow } from "../workflows/place-order"
import { placeCounterOrderWorkflow } from "../workflows/place-counter-order"
import { confirmOrderWorkflow } from "../workflows/confirm-order"
import { startOrderAssemblyWorkflow } from "../workflows/start-order-assembly"
import { completeOrderAssemblyWorkflow } from "../workflows/complete-order-assembly"
import { shipOrderWorkflow } from "../workflows/ship-order"

// Демо-заказы способов получения для ручной проверки админ-UI (поправка
// 2026-07-15): pickup в статусе assembled (доступно «Hand over» без кода),
// counter (создан сразу выданным через place-counter-order) и delivery в
// in_delivery с выданным кодом получения (код печатается в лог — в админке
// его намеренно нет, это секрет покупателя). Переиспользует инфраструктуру
// seed-demo-order.ts (товар DEMO-ORD-1U + shipping option Demo Standard) —
// запускать ПОСЛЕ него. Идемпотентен по маркер-почте.
//
// Запуск: npx medusa exec ./src/scripts/seed-demo-delivery-methods.ts
export default async function seedDemoDeliveryMethods({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const orderService = container.resolve(Modules.ORDER)

  const MARKER_EMAIL = "demo-methods-buyer@example.com"

  const { data: existing } = await query.graph({
    entity: "order",
    fields: ["id"],
    filters: { email: MARKER_EMAIL },
  })
  if (existing.length) {
    logger.info(
      `Demo delivery-method orders already seeded (${existing.length} found for ${MARKER_EMAIL}). Skipping.`
    )
    return
  }

  // Инфраструктура из seed-demo-order.ts.
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id"],
    filters: { sku: "DEMO-ORD-1U" },
  })
  if (!variants.length) {
    throw new Error(
      "Demo product not found. Run seed-demo-order.ts before this script."
    )
  }
  const variantId = (variants[0] as { id: string }).id

  const { data: options } = await query.graph({
    entity: "shipping_option",
    fields: ["id"],
    filters: { name: "Demo Standard" },
  })
  if (!options.length) {
    throw new Error(
      "Demo shipping option not found. Run seed-demo-order.ts before this script."
    )
  }
  const shippingOptionId = (options[0] as { id: string }).id

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  })
  const region = regions[0] as { id: string; currency_code: string }
  const countryCode = region.currency_code === "kzt" ? "kz" : "us"

  const { data: channels } = await query.graph({
    entity: "sales_channel",
    fields: ["id"],
  })
  const salesChannelId = (channels[0] as { id: string }).id

  // Готовит корзину, пригодную для завершения (как в seed-demo-order.ts).
  const prepareCart = async (index: number) => {
    const { result: cart } = await createCartWorkflow(container).run({
      input: {
        region_id: region.id,
        sales_channel_id: salesChannelId,
        currency_code: region.currency_code,
        email: MARKER_EMAIL,
        shipping_address: {
          first_name: "Demo",
          last_name: `Methods ${index}`,
          address_1: "1 Demo St",
          city: "Astana",
          country_code: countryCode,
          postal_code: "010000",
        },
        items: [{ variant_id: variantId, quantity: 2 }],
      },
    })
    await addShippingMethodToCartWorkflow(container).run({
      input: { cart_id: cart.id, options: [{ id: shippingOptionId }] },
    })
    await createPaymentCollectionForCartWorkflow(container).run({
      input: { cart_id: cart.id },
    })
    const { data: carts } = await query.graph({
      entity: "cart",
      fields: ["id", "payment_collection.id"],
      filters: { id: cart.id },
    })
    const paymentCollectionId = (
      carts[0] as { payment_collection?: { id: string } }
    ).payment_collection!.id
    await createPaymentSessionsWorkflow(container).run({
      input: {
        payment_collection_id: paymentCollectionId,
        provider_id: "pp_system_default",
      },
    })
    return cart.id
  }

  const orderItems = async (orderId: string) => {
    const order = await orderService.retrieveOrder(orderId, {
      relations: ["items"],
    })
    return (order.items ?? []).map((i) => ({
      id: i.id,
      quantity: Number(i.quantity),
    }))
  }

  // Заказ 1 — pickup, доведён до assembled: в виджете доступен «Hand over».
  const { result: pickupPlaced } = await placeOrderWorkflow(container).run({
    input: { cart_id: await prepareCart(1), delivery_method: "pickup" },
  })
  const pickupOrderId = (pickupPlaced as { order: { id: string } }).order.id
  await confirmOrderWorkflow(container).run({
    input: { order_id: pickupOrderId, actor_type: "admin" },
  })
  await startOrderAssemblyWorkflow(container).run({
    input: { order_id: pickupOrderId, actor_type: "admin" },
  })
  await completeOrderAssemblyWorkflow(container).run({
    input: {
      order_id: pickupOrderId,
      items: await orderItems(pickupOrderId),
      actor_type: "admin",
    },
  })

  // Заказ 2 — counter: продажа у окна, создаётся сразу выданным.
  const { result: counterPlaced } = await placeCounterOrderWorkflow(
    container
  ).run({
    input: { cart_id: await prepareCart(2), actor_type: "admin" },
  })
  const counterOrderId = (counterPlaced as { order: { id: string } }).order.id

  // Заказ 3 — delivery, доведён до in_delivery: код выдан, в виджете
  // «Mark delivered» открывает диалог кода.
  const { result: deliveryPlaced } = await placeOrderWorkflow(container).run({
    input: { cart_id: await prepareCart(3), delivery_method: "delivery" },
  })
  const deliveryOrderId = (deliveryPlaced as { order: { id: string } }).order.id
  await confirmOrderWorkflow(container).run({
    input: { order_id: deliveryOrderId, actor_type: "admin" },
  })
  await startOrderAssemblyWorkflow(container).run({
    input: { order_id: deliveryOrderId, actor_type: "admin" },
  })
  const deliveryItems = await orderItems(deliveryOrderId)
  await completeOrderAssemblyWorkflow(container).run({
    input: {
      order_id: deliveryOrderId,
      items: deliveryItems,
      actor_type: "admin",
    },
  })
  const { data: withFulfillment } = await query.graph({
    entity: "order",
    fields: ["id", "fulfillments.id"],
    filters: { id: deliveryOrderId },
  })
  const fulfillmentId = (
    withFulfillment[0] as { fulfillments: { id: string }[] }
  ).fulfillments[0].id
  await shipOrderWorkflow(container).run({
    input: {
      order_id: deliveryOrderId,
      fulfillment_id: fulfillmentId,
      items: deliveryItems,
      actor_type: "admin",
    },
  })

  // Код получения — для демо печатаем в лог (в admin-API/UI его нет намеренно;
  // покупатель видит его в GET /store/orders/:id/lifecycle).
  const { data: withCode } = await query.graph({
    entity: "order",
    fields: ["id", "order_lifecycle.delivery_code"],
    filters: { id: deliveryOrderId },
  })
  const deliveryCode = (
    withCode[0] as { order_lifecycle?: { delivery_code: string | null } }
  ).order_lifecycle?.delivery_code

  logger.info(
    `Seeded delivery-method demo orders: pickup ${pickupOrderId} (assembled, «Hand over» без кода), ` +
      `counter ${counterOrderId} (delivered сразу), delivery ${deliveryOrderId} (in_delivery, ` +
      `код получения для диалога «Mark delivered»: ${deliveryCode}).`
  )
}
