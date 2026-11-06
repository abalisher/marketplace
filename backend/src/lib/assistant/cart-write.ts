import { MedusaContainer } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import {
  addToCartWorkflow,
  createCartWorkflow,
  deleteLineItemsWorkflow,
  updateLineItemInCartWorkflow,
} from "@medusajs/medusa/core-flows"
import { attachCartToCustomer, cartInOtherChannel } from "./cart-ownership"
import { listCartLines } from "./tools/cart-line-lookup"
import { CartSummary, emptyCartSummary, summarizeCart } from "./tools/cart-summary"
import { MAX_QUANTITY } from "./tools/cart-quantity"

// Запись в корзину чата НЕ через модель (T10.15). Счётчики «−/+» на карточках
// подбора меняют корзину напрямую: ход модели тут не нужен (5–8 с и токены на
// каждое нажатие — набрать шесть позиций стало бы невозможно), а логика корзины
// обязана остаться одна на оба пути (CLAUDE.md: бизнес-логика только в бэкенде).
// Поэтому «как создаётся корзина чата» и «как выставляется количество позиции»
// живут здесь, а инструменты модели (add_to_cart) берут отсюда же создание.
//
// Ключевая идиома роута кнопок — АБСОЛЮТНОЕ количество, а не «+1»: повтор
// запроса после обрыва и схлопывание серии нажатий дебаунсом безопасны
// (последняя запись побеждает), и гонки двух нажатий не задваивают позицию.

const CURRENCY = "kzt"

type CartCreationContext = {
  regionId: string
  salesChannelId: string
  currency: string
}

// Регион (предпочитаем тенге — единственный рынок) и канал продаж для новой
// корзины. Канал — витрины запроса (publishable key, см. lib/tenants/storefront):
// он решает, чей это заказ и с каких складов резерв. Без него — канал магазина
// по умолчанию. Отсутствие региона или канала — понятная ошибка конфигурации
// (не «молчаливый» битый заказ).
export const resolveCartCreationContext = async (
  container: MedusaContainer,
  salesChannelId?: string
): Promise<CartCreationContext> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "currency_code"],
  })
  if (!regions.length) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "No region configured for the store"
    )
  }
  const region =
    (regions as { id: string; currency_code: string }[]).find(
      (r) => r.currency_code === CURRENCY
    ) ?? (regions[0] as { id: string; currency_code: string })

  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "default_sales_channel_id"],
  })
  const channelId =
    salesChannelId ??
    (stores[0] as { default_sales_channel_id?: string | null } | undefined)
      ?.default_sales_channel_id
  if (!channelId) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "No sales channel configured for the store"
    )
  }

  return {
    regionId: region.id,
    salesChannelId: channelId,
    currency: region.currency_code,
  }
}

type CartOwnerRow = {
  id: string
  customer_id?: string | null
  completed_at?: string | null
}

// Право писать в корзину. Владение `cart_id` — капабилити-токен клиента (та же
// идиома, что у всего чата: сервер сессию диалога не хранит), поэтому гостевую
// корзину правит любой, кто её id держит — иначе кнопки были бы строже, чем
// тот же путь через модель. Отказываем ровно в двух случаях: корзина уже
// оформлена и корзина принадлежит ДРУГОМУ зарегистрированному покупателю.
export const assertCartWritable = async (
  container: MedusaContainer,
  cartId: string,
  customerId?: string
): Promise<void> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "cart",
    fields: ["id", "customer_id", "completed_at"],
    filters: { id: cartId },
  })

  const cart = (data as CartOwnerRow[])[0]
  if (!cart) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Cart not found")
  }
  if (cart.completed_at) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Cart is already completed"
    )
  }
  if (!cart.customer_id || cart.customer_id === customerId) {
    return
  }

  // Владелец есть и он не запрашивающий. Гостевая учётка (has_account = false)
  // — это та самая корзина, которую покупатель собрал до входа: она наша.
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "has_account"],
    filters: { id: cart.customer_id },
  })
  const owner = (customers as { id: string; has_account?: boolean }[])[0]
  if (owner?.has_account) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Cart belongs to another customer"
    )
  }
}

// Целевое количество позиции. Целое (корзина ядра дробных не хранит), 0 = убрать
// позицию совсем. Разбор строгий: кнопки шлют только целые, поэтому мусор здесь
// — ошибка клиента, а не повод молча что-то домыслить (цена ошибки — деньги).
const parseTargetQuantity = (raw: unknown): number => {
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 0 || n > MAX_QUANTITY) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Invalid quantity: ${String(raw)}`
    )
  }
  return n
}

// Выставить количество ОДНОЙ позиции существующей корзины. Дубли строк одного
// варианта (задвоенная корзина) чиним здесь же: лишние строки удаляются, в
// одной остаётся целевое количество — путь кнопок оперирует абсолютным числом,
// поэтому «какую из строк править» тут не вопрос (в отличие от инструмента
// модели, который в этой ситуации честно упирается и просит починить состав).
const setLineQuantity = async (
  container: MedusaContainer,
  cartId: string,
  variantId: string,
  quantity: number
): Promise<void> => {
  const lines = (await listCartLines(container, cartId)).filter(
    (l) => l.variant_id === variantId
  )

  if (quantity === 0) {
    if (lines.length > 0) {
      await deleteLineItemsWorkflow(container).run({
        input: { cart_id: cartId, ids: lines.map((l) => l.item_id) },
      })
    }
    return
  }

  if (lines.length === 0) {
    await addToCartWorkflow(container).run({
      input: { cart_id: cartId, items: [{ variant_id: variantId, quantity }] },
    })
    return
  }

  if (lines.length > 1) {
    await deleteLineItemsWorkflow(container).run({
      input: { cart_id: cartId, ids: lines.slice(1).map((l) => l.item_id) },
    })
  }

  await updateLineItemInCartWorkflow(container).run({
    input: {
      cart_id: cartId,
      item_id: lines[0].item_id,
      update: { quantity },
    },
  })
}

export type CartQuantityRequest = {
  variant_id: string
  quantity: number
}

export type CartQuantityInput = {
  cartId?: string
  customerId?: string
  // Канал продаж витрины запроса (см. resolveCartCreationContext).
  salesChannelId?: string
  items: CartQuantityRequest[]
}

// Применить целевые количества к корзине чата. Возвращает id корзины (может
// появиться на этом вызове — первое «+» гостя создаёт её, как и add_to_cart) и
// свежую сводку состава.
//
// Позиции применяются ПОСЛЕДОВАТЕЛЬНО: workflow'ы ядра правят одну и ту же
// корзину, параллельный запуск ловил бы гонку версий.
export const applyCartQuantities = async (
  container: MedusaContainer,
  { cartId, customerId, salesChannelId, items }: CartQuantityInput
): Promise<{ cartId?: string; summary: CartSummary }> => {
  const targets = items.map((item) => ({
    variantId: typeof item.variant_id === "string" ? item.variant_id.trim() : "",
    quantity: parseTargetQuantity(item.quantity),
  }))
  if (targets.some((t) => !t.variantId)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Missing variant_id")
  }

  let currentCartId = cartId

  // Корзина с витрины другого продавца — начинаем новую (см. cartInOtherChannel).
  if (
    currentCartId &&
    salesChannelId &&
    (await cartInOtherChannel(container, currentCartId, salesChannelId))
  ) {
    currentCartId = undefined
  }

  if (currentCartId) {
    await assertCartWritable(container, currentCartId, customerId)
    // Покупатель вошёл после того, как собрал корзину гостем (кнопка входа в
    // ленте): переносим владение тем же ядровым workflow, что и ход чата.
    if (customerId) {
      await attachCartToCustomer(container, currentCartId, customerId)
    }
  }

  for (const target of targets) {
    if (!currentCartId) {
      // Корзины ещё нет: убирать нечего, а первое положительное количество её
      // создаёт (та же идиома, что у add_to_cart).
      if (target.quantity === 0) {
        continue
      }
      const { regionId, salesChannelId: channelId, currency } =
        await resolveCartCreationContext(container, salesChannelId)
      const { result: cart } = await createCartWorkflow(container).run({
        input: {
          region_id: regionId,
          sales_channel_id: channelId,
          currency_code: currency,
          ...(customerId ? { customer_id: customerId } : {}),
          items: [{ variant_id: target.variantId, quantity: target.quantity }],
        },
      })
      currentCartId = cart.id
      continue
    }

    await setLineQuantity(
      container,
      currentCartId,
      target.variantId,
      target.quantity
    )
  }

  if (!currentCartId) {
    return { summary: emptyCartSummary() }
  }

  const summary = await summarizeCart(container, currentCartId)
  if (!summary) {
    // Корзину только что писали — её исчезновение означает сломанное состояние,
    // а не пустую корзину: молчать нельзя, иначе счётчики на экране разойдутся
    // с реальностью.
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Cart is not readable after write"
    )
  }
  return { cartId: currentCartId, summary }
}
