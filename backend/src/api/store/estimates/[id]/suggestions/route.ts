import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { ESTIMATOR_MODULE } from "../../../../../modules/estimator"
import EstimatorModuleService from "../../../../../modules/estimator/service"
import { requestSalesChannelId } from "../../../../../lib/tenants/storefront"
import { loadChannelAssortment } from "../../../../../lib/tenants/scope"

const SEGMENTS = ["economy", "comfort", "business"] as const

type VariantRow = {
  prices?: { amount: number; currency_code: string }[]
  inventory_items?: {
    inventory?: {
      location_levels?: {
        location_id?: string
        stocked_quantity?: number
        reserved_quantity?: number
      }[]
    }
  }[]
}
type ProductRow = {
  id: string
  title: string
  status: string
  product_card?: { segment?: string } | null
  variants?: VariantRow[]
}

// Минимальная цена варианта в валюте + признак наличия (сумма доступного по
// уровням остатков > 0). Товары без варианта/цены в валюте пропускаются.
// locationIds — склады витрины запроса (у компании свои); null — все склады.
const priceAndStock = (
  product: ProductRow,
  currency: string,
  locationIds: Set<string> | null
) => {
  let best: number | null = null
  let available = 0
  for (const variant of product.variants ?? []) {
    const price = (variant.prices ?? []).find(
      (p) => p.currency_code === currency
    )
    if (price && (best == null || Number(price.amount) < best)) {
      best = Number(price.amount)
    }
    for (const ii of variant.inventory_items ?? []) {
      for (const lvl of ii.inventory?.location_levels ?? []) {
        if (locationIds && !locationIds.has(lvl.location_id ?? "")) {
          continue
        }
        available +=
          Number(lvl.stocked_quantity ?? 0) - Number(lvl.reserved_quantity ?? 0)
      }
    }
  }
  return { price: best, in_stock: available > 0 }
}

// GET /store/estimates/:id/suggestions?currency_code=kzt — подборка товаров под
// каждую позицию расчёта в 3 сегментах (ТЗ 7): по категории норматива берём
// published-товары, группируем по product_card.segment, на сегмент — самый
// дешёвый вариант в валюте + признак наличия; total = количество × цена. Позиции
// без категории норматива идут без опций (только количество). Результат
// рекомендательный, сегменты можно смешивать при выборе на клиенте.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const currency = ((req.query.currency_code as string) || "kzt").toLowerCase()
  const estimatorService =
    req.scope.resolve<EstimatorModuleService>(ESTIMATOR_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  // Подборка — из каталога и складов витрины запроса: у каждой компании свои.
  const salesChannelId = requestSalesChannelId(req)
  const assortment = salesChannelId
    ? await loadChannelAssortment(req.scope, salesChannelId)
    : null
  const channelProducts = assortment ? new Set(assortment.productIds) : null

  let estimate
  try {
    estimate = await estimatorService.retrieveEstimate(req.params.id, {
      relations: ["lines"],
    })
  } catch {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Estimate ${req.params.id} not found`
    )
  }

  const lines = estimate.lines ?? []
  const normCodes = [
    ...new Set(lines.map((l) => l.norm_code).filter(Boolean) as string[]),
  ]
  const norms = normCodes.length
    ? await estimatorService.listMaterialNorms({ code: normCodes })
    : []
  const categoryByCode = new Map(
    norms.map((n) => [n.code, n.category_id as string | null])
  )

  const suggestions: {
    line_id: string
    material_kind: string
    quantity: number
    unit: string
    options: {
      segment: string
      product_id: string
      product_title: string
      unit_price: number
      total: number
      in_stock: boolean
    }[]
  }[] = []
  for (const line of lines) {
    const categoryId = line.norm_code
      ? categoryByCode.get(line.norm_code)
      : null

    const options: {
      segment: string
      product_id: string
      product_title: string
      unit_price: number
      total: number
      in_stock: boolean
    }[] = []

    if (categoryId) {
      const { data: categories } = await query.graph({
        entity: "product_category",
        fields: [
          "id",
          "products.id",
          "products.title",
          "products.status",
          "products.product_card.segment",
          "products.variants.prices.amount",
          "products.variants.prices.currency_code",
          "products.variants.inventory_items.inventory.location_levels.location_id",
          "products.variants.inventory_items.inventory.location_levels.stocked_quantity",
          "products.variants.inventory_items.inventory.location_levels.reserved_quantity",
        ],
        filters: { id: categoryId },
      })
      const products = ((categories?.[0]?.products ?? []) as ProductRow[]).filter(
        (p) =>
          p.status === "published" &&
          (!channelProducts || channelProducts.has(p.id))
      )

      // На каждый сегмент — самый дешёвый доступный товар в валюте.
      for (const segment of SEGMENTS) {
        const inSegment = products.filter(
          (p) => p.product_card?.segment === segment
        )
        let bestProduct: ProductRow | null = null
        let bestPrice: number | null = null
        let bestStock = false
        for (const product of inSegment) {
          const { price, in_stock } = priceAndStock(
            product,
            currency,
            assortment?.locationIds ?? null
          )
          if (price != null && (bestPrice == null || price < bestPrice)) {
            bestPrice = price
            bestProduct = product
            bestStock = in_stock
          }
        }
        if (bestProduct && bestPrice != null) {
          options.push({
            segment,
            product_id: bestProduct.id,
            product_title: bestProduct.title,
            unit_price: bestPrice,
            total: Math.round(bestPrice * Number(line.quantity) * 100) / 100,
            in_stock: bestStock,
          })
        }
      }
    }

    suggestions.push({
      line_id: line.id,
      material_kind: line.material_kind,
      quantity: Number(line.quantity),
      unit: line.unit,
      options,
    })
  }

  res.json({ estimate_id: estimate.id, currency_code: currency, suggestions })
}
