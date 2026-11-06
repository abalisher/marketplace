import "server-only"

import { cookies } from "next/headers"
import { cache } from "react"

// Продавец витрины (мультипродавец): компания площадки, на чьей витрине сейчас
// покупатель, или null — витрина самой площадки.
//
// Компанию выбирает адрес (/kz/t/<slug>), middleware запоминает её в httpOnly
// cookie, а читает — только сервер. В бэкенд компания уходит её publishable
// key (см. lib/config.ts): бэкенд определяет продавца по ключу, а не по
// заголовку или полю, которые можно подделать из браузера. Сам ключ публичный,
// витрина и так шлёт его в каждом запросе.

export const TENANT_COOKIE = "_sm_tenant"
export const TENANT_SLUG = /^[a-z0-9-]{1,64}$/

export type StorefrontTenant = {
  id: string
  slug: string
  name: string
  bin: string | null
  phone: string | null
  email: string | null
  address: string | null
  logo_url: string | null
  publishable_key: string | null
  delivery_price: number | null
}

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const DEFAULT_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

// Карточка активной компании по slug или null (нет такой / приостановлена).
// Кэш короткий: карточку правит владелец площадки, и витрине достаточно
// подхватить правку за пять минут.
export const retrieveTenant = cache(
  async (slug: string): Promise<StorefrontTenant | null> => {
    if (!TENANT_SLUG.test(slug)) {
      return null
    }
    try {
      const response = await fetch(`${BACKEND_URL}/store/tenants/${slug}`, {
        headers: { "x-publishable-api-key": DEFAULT_PUBLISHABLE_KEY ?? "" },
        next: { revalidate: 300, tags: ["tenants"] },
      })
      if (!response.ok) {
        return null
      }
      const { tenant } = (await response.json()) as { tenant: StorefrontTenant }
      return tenant
    } catch {
      return null
    }
  }
)

// Компания текущей витрины. Неизвестный или приостановленный slug в cookie —
// витрина площадки.
export const getStorefrontTenant = cache(
  async (): Promise<StorefrontTenant | null> => {
    try {
      const slug = (await cookies()).get(TENANT_COOKIE)?.value
      return slug ? await retrieveTenant(slug) : null
    } catch {
      // Вне запроса (сборка) cookie недоступны — витрина площадки.
      return null
    }
  }
)

// Publishable key, которым витрина ходит в бэкенд: ключ компании или ключ
// площадки.
export const getStorefrontPublishableKey = async (): Promise<
  string | undefined
> => (await getStorefrontTenant())?.publishable_key ?? DEFAULT_PUBLISHABLE_KEY

// Живая сводка учёта компании для её страницы (GET /store/tenants/:slug/
// transparency): агрегаты и обезличенный журнал. Кэш минутный — это витрина
// «в реальном времени», но не повод бить в базу на каждый просмотр.
export type TenantTransparencyLogEntry =
  | {
      type: "in"
      at: string
      title: string | null
      quantity: number
      unit: string
      more_lines: number
    }
  // order_number — подпись заказа: «ORG-26-0007», у старых — «№5».
  | { type: "status"; at: string; order_number: string; status: string }

export type TenantTransparency = {
  window_days: number
  generated_at: string
  locations: string[]
  inflow: { receipts: number; by_unit: { unit: string; quantity: number }[] }
  stock: { skus: number; in_stock: number; updated_at: string | null }
  outflow: { shipped: number; delivered: number }
  active_drivers: number
  log: TenantTransparencyLogEntry[]
}

export const retrieveTenantTransparency = cache(
  async (slug: string): Promise<TenantTransparency | null> => {
    if (!TENANT_SLUG.test(slug)) {
      return null
    }
    try {
      const response = await fetch(
        `${BACKEND_URL}/store/tenants/${slug}/transparency`,
        {
          headers: { "x-publishable-api-key": DEFAULT_PUBLISHABLE_KEY ?? "" },
          next: { revalidate: 60, tags: ["tenants"] },
        }
      )
      if (!response.ok) {
        return null
      }
      const { transparency } = (await response.json()) as {
        transparency: TenantTransparency
      }
      return transparency
    } catch {
      return null
    }
  }
)

// Ассортимент компании для её страницы: товары её канала продаж (по её
// publishable key) с ценой региона и остатком на её складах. Ключ берём из
// карточки, а не из cookie: на первом заходе middleware только ставит cookie.
export type TenantShowcaseItem = {
  id: string
  title: string
  thumbnail: string | null
  category: string | null
  price: number | null
  in_stock: number
}

export const listTenantShowcase = cache(
  async (
    tenant: StorefrontTenant,
    regionId: string | undefined
  ): Promise<TenantShowcaseItem[]> => {
    if (!tenant.publishable_key || !regionId) {
      return []
    }
    const query = new URLSearchParams({
      limit: "60",
      region_id: regionId,
      // manage_inventory обязателен: без него ядро не считает inventory_quantity
      // и отдаёт ноль даже при остатке на складе.
      fields:
        "id,title,thumbnail,*categories,variants.id,variants.manage_inventory,*variants.calculated_price,+variants.inventory_quantity",
    })
    try {
      const response = await fetch(`${BACKEND_URL}/store/products?${query}`, {
        headers: { "x-publishable-api-key": tenant.publishable_key },
        next: { revalidate: 300, tags: ["products", "tenants"] },
      })
      if (!response.ok) {
        return []
      }
      const { products } = (await response.json()) as {
        products: {
          id: string
          title: string
          thumbnail: string | null
          categories?: { name: string }[] | null
          variants?:
            | {
                inventory_quantity?: number | null
                calculated_price?: { calculated_amount?: number | null } | null
              }[]
            | null
        }[]
      }
      return products.map((product) => {
        const prices = (product.variants ?? [])
          .map((variant) => variant.calculated_price?.calculated_amount)
          .filter((amount): amount is number => typeof amount === "number")
        return {
          id: product.id,
          title: product.title,
          thumbnail: product.thumbnail,
          category: product.categories?.[0]?.name ?? null,
          price: prices.length ? Math.min(...prices) : null,
          in_stock: (product.variants ?? []).reduce(
            (sum, variant) => sum + Math.max(0, variant.inventory_quantity ?? 0),
            0
          ),
        }
      })
    } catch {
      return []
    }
  }
)

// Пример расчёта в карточке чата на странице компании: обшивка стены 18 м²
// гипсокартоном. Количества — по типовым нормам каркасной обшивки (лист 3 м²
// плюс запас, стойка ПС 2 м.п./м², направляющая ПН по периметру), цены и
// наличие — живые, конкретного варианта в канале компании. Строку, которой у
// компании нет (товар не в канале, нет цены или остатка), пропускаем.
const CHAT_EXAMPLE_LINES = [
  { handle: "гипсокартон-гкл-125-мм", variant: "Стеновой", quantity: 7, unit: "sheet" },
  { handle: "профиль-для-гипсокартона", variant: "ПС 60×27, 3 м", quantity: 12, unit: "piece" },
  { handle: "профиль-для-гипсокартона", variant: "ПН 28×27, 3 м", quantity: 5, unit: "piece" },
  { handle: "саморез-по-гипсокартону", variant: "3.5×25 мм", quantity: 1, unit: "pack" },
] as const

export type TenantChatExampleLine = {
  title: string
  variant: string
  quantity: number
  unit: (typeof CHAT_EXAMPLE_LINES)[number]["unit"]
  price: number
}

export const retrieveTenantChatExample = cache(
  async (
    tenant: StorefrontTenant,
    regionId: string | undefined
  ): Promise<TenantChatExampleLine[]> => {
    if (!tenant.publishable_key || !regionId) {
      return []
    }
    const handles = Array.from(new Set(CHAT_EXAMPLE_LINES.map((line) => line.handle)))
    const query = new URLSearchParams({
      region_id: regionId,
      fields:
        "id,title,handle,variants.title,variants.manage_inventory,*variants.calculated_price,+variants.inventory_quantity",
    })
    handles.forEach((handle) => query.append("handle[]", handle))
    try {
      const response = await fetch(`${BACKEND_URL}/store/products?${query}`, {
        headers: { "x-publishable-api-key": tenant.publishable_key },
        next: { revalidate: 300, tags: ["products", "tenants"] },
      })
      if (!response.ok) {
        return []
      }
      const { products } = (await response.json()) as {
        products: {
          title: string
          handle: string
          variants?:
            | {
                title: string
                inventory_quantity?: number | null
                calculated_price?: { calculated_amount?: number | null } | null
              }[]
            | null
        }[]
      }
      return CHAT_EXAMPLE_LINES.flatMap((line) => {
        const product = products.find((item) => item.handle === line.handle)
        const variant = product?.variants?.find((item) => item.title === line.variant)
        const price = variant?.calculated_price?.calculated_amount
        if (!product || typeof price !== "number" || (variant?.inventory_quantity ?? 0) <= 0) {
          return []
        }
        return [
          {
            title: product.title,
            variant: line.variant,
            quantity: line.quantity,
            unit: line.unit,
            price,
          },
        ]
      })
    } catch {
      return []
    }
  }
)
