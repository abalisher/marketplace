import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { ExecArgs } from "@medusajs/framework/types"
import {
  addShippingMethodToCartWorkflow,
  createCartWorkflow,
  createPaymentCollectionForCartWorkflow,
  createPaymentSessionsWorkflow,
} from "@medusajs/medusa/core-flows"
import { placeOrderWorkflow } from "../workflows/place-order"
import { confirmOrderWorkflow } from "../workflows/confirm-order"
import { startOrderAssemblyWorkflow } from "../workflows/start-order-assembly"
import { completeOrderAssemblyWorkflow } from "../workflows/complete-order-assembly"
import { shipOrderWorkflow } from "../workflows/ship-order"
import { deliverOrderWorkflow } from "../workflows/deliver-order"
import { ORDER_LIFECYCLE_MODULE } from "../modules/order-lifecycle"
import OrderLifecycleModuleService from "../modules/order-lifecycle/service"

// Демо-заказы рабочего дня оператора: очередь панели во всех статусах цикла,
// на РЕАЛЬНОМ каталоге, в тенге, с человекочитаемыми покупателями и адресами
// Астаны. До T7.2 этот скрипт строил свою инфраструктуру (регион Europe в
// евро, склад «Demo Warehouse», товар «Demo Order Product», покупатель
// «Demo Buyer 1», адрес «1 Demo St, US») — именно её сотрудники читали как
// рабочие данные в фокус-группе T4.6. Теперь скрипт НИЧЕГО не создаёт кроме
// покупателей и заказов и требует прогнанный seed-kz (регион Kazakhstan,
// склады Астаны, «Доставка по Астане», опубликованные товары).
//
// Идемпотентен: если заказы демо-покупателей уже есть — выходит.
//
// Запуск: npx medusa exec ./src/scripts/seed-demo-order.ts
const REGION_NAME = "Kazakhstan"
const SHIPPING_OPTION_NAME = "Доставка по Астане"
const CITY = "Астана"

type DemoBuyer = {
  email: string
  first_name: string
  last_name: string
  phone: string
  address_1: string
}

const BUYERS: Record<string, DemoBuyer> = {
  erlan: {
    email: "erlan.smagulov@mail.kz",
    first_name: "Ерлан",
    last_name: "Смагулов",
    phone: "+7 701 214 33 12",
    address_1: "ул. Кенесары, 42",
  },
  dmitry: {
    email: "dmitry.kovalev@mail.kz",
    first_name: "Дмитрий",
    last_name: "Ковалёв",
    phone: "+7 705 118 90 21",
    address_1: "ул. Сыганак, 10, кв. 55",
  },
  saule: {
    email: "saule.abenova@mail.kz",
    first_name: "Сауле",
    last_name: "Абенова",
    phone: "+7 702 447 15 08",
    address_1: "пр. Тәуелсіздік, 34, кв. 12",
  },
  marat: {
    email: "marat.snab@stroymaster.kz",
    first_name: "Марат",
    last_name: "Ибраев",
    phone: "+7 717 255 41 90",
    address_1: "ул. Индустриальная, 25, склад 3",
  },
}

// Статус, до которого доводится заказ (цепочка переходов — реальными workflow).
type DemoStage =
  | "new"
  | "confirmed"
  | "assembling"
  | "assembled"
  | "in_delivery"
  | "delivered"

type DemoOrderSpec = {
  buyer: keyof typeof BUYERS
  stage: DemoStage
  items: { product: string; variant: string; quantity: number }[]
}

const ORDERS: DemoOrderSpec[] = [
  {
    buyer: "erlan",
    stage: "new",
    items: [
      { product: "Цемент ПЦ 400-Д20", variant: "Мешок 50 кг", quantity: 40 },
      { product: "Песок строительный мытый", variant: "0–2 мм", quantity: 3 },
    ],
  },
  {
    buyer: "dmitry",
    stage: "new",
    items: [
      { product: "Пескобетон М300 40 кг", variant: "Мешок 40 кг", quantity: 26 },
    ],
  },
  {
    buyer: "saule",
    stage: "confirmed",
    items: [
      { product: "Гипсокартон ГКЛ 12.5 мм", variant: "Стеновой", quantity: 12 },
      {
        product: "Утеплитель минеральная вата 100 мм",
        variant: "100 мм",
        quantity: 8,
      },
    ],
  },
  {
    buyer: "marat",
    stage: "assembling",
    items: [
      { product: "Кирпич керамический рядовой М150", variant: "Полнотелый", quantity: 2400 },
      { product: "Щебень гранитный фр. 5–20 мм", variant: "5–20 мм", quantity: 5 },
    ],
  },
  {
    buyer: "erlan",
    stage: "assembled",
    items: [
      { product: "Арматура А500С 12 мм", variant: "12 мм", quantity: 1 },
    ],
  },
  {
    buyer: "saule",
    stage: "in_delivery",
    items: [
      { product: "Плитка керамическая напольная", variant: "600×600 мм", quantity: 24 },
    ],
  },
  {
    buyer: "marat",
    stage: "delivered",
    items: [
      { product: "Газоблок автоклавный D500", variant: "625×250×200 мм", quantity: 60 },
      { product: "Доска обрезная хвоя 50×150×6000", variant: "50×150×6000", quantity: 15 },
    ],
  },
]

export default async function seedDemoOrder({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const orderService = container.resolve(Modules.ORDER)
  const customerService = container.resolve(Modules.CUSTOMER)
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)
  const lifecycleService = container.resolve<OrderLifecycleModuleService>(
    ORDER_LIFECYCLE_MODULE
  )

  // --- Идемпотентность -----------------------------------------------------
  const buyerEmails = Object.values(BUYERS).map((b) => b.email)
  const { data: existingOrders } = await query.graph({
    entity: "order",
    fields: ["id"],
    filters: { email: buyerEmails },
  })
  if (existingOrders.length) {
    logger.info(
      `Демо-заказы уже засеяны (${existingOrders.length} шт.). Пропускаю.`
    )
    return
  }

  // --- Предусловия seed-kz -------------------------------------------------
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code", "name"],
    filters: { name: REGION_NAME },
  })
  const region = regions[0] as
    | { id: string; currency_code: string }
    | undefined
  if (!region) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Регион «${REGION_NAME}» не найден — сначала прогони seed-kz.ts`
    )
  }

  const { data: channels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  const salesChannel = channels[0] as { id: string } | undefined
  if (!salesChannel) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "Канал продаж не найден — сначала прогони seed-kz.ts"
    )
  }

  const [shippingOption] = await fulfillmentService.listShippingOptions(
    { name: SHIPPING_OPTION_NAME },
    { take: 1, select: ["id", "name"] }
  )
  if (!shippingOption) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Способ доставки «${SHIPPING_OPTION_NAME}» не найден — сначала прогони seed-kz.ts`
    )
  }

  // Варианты каталога по паре «товар + вариант» из спецификации заказов.
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title", "status", "variants.id", "variants.title"],
    filters: { title: [...new Set(ORDERS.flatMap((o) => o.items.map((i) => i.product)))] },
  })
  const variantId = (productTitle: string, variantTitle: string) => {
    const product = (
      products as {
        title: string
        status: string
        variants?: { id: string; title: string }[]
      }[]
    ).find((p) => p.title === productTitle)
    if (!product) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Товар «${productTitle}» не найден в каталоге — прогони seed-kz.ts и seed-demo-showcase.ts`
      )
    }
    const variant = (product.variants ?? []).find(
      (v) => v.title === variantTitle
    )
    if (!variant) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `У товара «${productTitle}» нет варианта «${variantTitle}»`
      )
    }
    return variant.id
  }

  // --- Покупатели (идемпотентно по email) ----------------------------------
  const customerIdByKey = new Map<string, string>()
  for (const [key, buyer] of Object.entries(BUYERS)) {
    const [existing] = await customerService.listCustomers(
      { email: buyer.email },
      { take: 1, select: ["id"] }
    )
    if (existing) {
      customerIdByKey.set(key, existing.id)
      continue
    }
    const created = await customerService.createCustomers({
      email: buyer.email,
      first_name: buyer.first_name,
      last_name: buyer.last_name,
      phone: buyer.phone,
    })
    customerIdByKey.set(key, created.id)
    logger.info(`+ покупатель: ${buyer.first_name} ${buyer.last_name}`)
  }

  // --- Оформление заказа ---------------------------------------------------
  const placeOrder = async (spec: DemoOrderSpec) => {
    const buyer = BUYERS[spec.buyer]
    const { result: cart } = await createCartWorkflow(container).run({
      input: {
        region_id: region.id,
        sales_channel_id: salesChannel.id,
        currency_code: region.currency_code,
        email: buyer.email,
        customer_id: customerIdByKey.get(spec.buyer),
        shipping_address: {
          first_name: buyer.first_name,
          last_name: buyer.last_name,
          phone: buyer.phone,
          address_1: buyer.address_1,
          city: CITY,
          country_code: "kz",
          postal_code: "010000",
        },
        items: spec.items.map((item) => ({
          variant_id: variantId(item.product, item.variant),
          quantity: item.quantity,
        })),
      },
    })
    await addShippingMethodToCartWorkflow(container).run({
      input: { cart_id: cart.id, options: [{ id: shippingOption.id }] },
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
    const { result } = await placeOrderWorkflow(container).run({
      input: { cart_id: cart.id },
    })
    const placed = (result as { order: { id: string } }).order
    const stored = await orderService.retrieveOrder(placed.id, {
      select: ["id", "display_id"],
    })
    return { id: placed.id, display_id: stored.display_id }
  }

  const orderItems = async (orderId: string) => {
    const order = await orderService.retrieveOrder(orderId, {
      relations: ["items"],
    })
    return (order.items ?? []).map((item) => ({
      id: item.id,
      quantity: Number(item.quantity),
    }))
  }

  const fulfillmentId = async (orderId: string) => {
    const { data } = await query.graph({
      entity: "order",
      fields: ["id", "fulfillments.id"],
      filters: { id: orderId },
    })
    const fulfillments = (data[0] as { fulfillments?: { id: string }[] })
      .fulfillments
    if (!fulfillments?.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `У заказа ${orderId} нет fulfillment после сборки`
      )
    }
    return fulfillments[fulfillments.length - 1].id
  }

  // Доводит заказ до нужного статуса реальной цепочкой переходов.
  const advance = async (orderId: string, stage: DemoStage) => {
    if (stage === "new") {
      return
    }
    await confirmOrderWorkflow(container).run({
      input: { order_id: orderId, actor_type: "admin" },
    })
    if (stage === "confirmed") {
      return
    }
    await startOrderAssemblyWorkflow(container).run({
      input: { order_id: orderId, actor_type: "admin" },
    })
    if (stage === "assembling") {
      return
    }
    const items = await orderItems(orderId)
    await completeOrderAssemblyWorkflow(container).run({
      input: { order_id: orderId, items, actor_type: "admin" },
    })
    if (stage === "assembled") {
      return
    }
    const fulfillment = await fulfillmentId(orderId)
    await shipOrderWorkflow(container).run({
      input: {
        order_id: orderId,
        fulfillment_id: fulfillment,
        items,
        actor_type: "admin",
      },
    })
    if (stage === "in_delivery") {
      return
    }
    // Вручение требует код получения — он выдан переходом в in_delivery.
    const { data: withLifecycle } = await query.graph({
      entity: "order",
      fields: ["id", "order_lifecycle.id"],
      filters: { id: orderId },
    })
    const lifecycleId = (
      withLifecycle[0] as { order_lifecycle?: { id: string } }
    ).order_lifecycle?.id
    const lifecycle = lifecycleId
      ? await lifecycleService.retrieveOrderLifecycle(lifecycleId, {
          select: ["id", "delivery_code"],
        })
      : undefined
    await deliverOrderWorkflow(container).run({
      input: {
        order_id: orderId,
        fulfillment_id: fulfillment,
        // Актора «водитель» в цикле пока нет (E5) — вручение проводит продавец.
        actor_type: "seller",
        delivery_code: lifecycle?.delivery_code,
      },
    })
  }

  for (const spec of ORDERS) {
    const order = await placeOrder(spec)
    await advance(order.id, spec.stage)
    logger.info(
      `+ заказ №${order.display_id} — ${BUYERS[spec.buyer].last_name}, статус ${spec.stage}`
    )
  }

  logger.info(`Засеяно демо-заказов: ${ORDERS.length}`)
}
