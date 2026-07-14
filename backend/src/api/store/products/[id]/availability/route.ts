import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

// Числа инвентаря сериализуются как BigNumber — приводим к number.
const toNumber = (value: unknown) => {
  const num = Number(value ?? 0)
  return Number.isFinite(num) ? num : 0
}

type StockLocationInfo = {
  id: string
  name: string
  city: string | null
}

type CityAvailability = {
  city: string | null
  available: number
  stock_locations: { id: string; name: string; available: number }[]
}

// GET /store/products/:id/availability — остатки опубликованного товара
// в разрезе город → склад (город = stock_location.address.city, отдельной
// модели города нет — см. docs/modules/catalog.md). available = stocked - reserved.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "status",
      "variants.id",
      "variants.title",
      "variants.sku",
      "variants.inventory_items.inventory.id",
      "variants.inventory_items.inventory.location_levels.location_id",
      "variants.inventory_items.inventory.location_levels.stocked_quantity",
      "variants.inventory_items.inventory.location_levels.reserved_quantity",
    ],
    filters: { id: req.params.id },
  })

  const product = products[0]
  // Неопубликованный товар для витрины не существует (черновики не раскрываем).
  if (!product || product.status !== "published") {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Product with id ${req.params.id} not found`
    )
  }

  // Шаг 1: суммируем доступное по складам для каждого варианта
  // (у варианта может быть несколько inventory items).
  const locationIds = new Set<string>()
  const variantLevels = (product.variants ?? [])
    .filter((variant) => Boolean(variant))
    .map((variant) => {
      const perLocation = new Map<string, number>()
      for (const item of variant.inventory_items ?? []) {
        for (const level of item?.inventory?.location_levels ?? []) {
          if (!level?.location_id) {
            continue
          }
          locationIds.add(level.location_id)
          const available =
            toNumber(level.stocked_quantity) - toNumber(level.reserved_quantity)
          perLocation.set(
            level.location_id,
            (perLocation.get(level.location_id) ?? 0) + available
          )
        }
      }
      return { variant, perLocation }
    })

  // Шаг 2: города складов — из адресов stock_location.
  const locationById = new Map<string, StockLocationInfo>()
  if (locationIds.size) {
    const { data: locations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "name", "address.city"],
      filters: { id: [...locationIds] },
    })
    for (const location of locations) {
      locationById.set(location.id, {
        id: location.id,
        name: location.name,
        city: location.address?.city ?? null,
      })
    }
  }

  // Шаг 3: группировка склад → город.
  const variants = variantLevels.map(({ variant, perLocation }) => {
    const byCity = new Map<string | null, CityAvailability>()
    for (const [locationId, available] of perLocation) {
      const location = locationById.get(locationId)
      const city = location?.city ?? null
      const entry = byCity.get(city) ?? {
        city,
        available: 0,
        stock_locations: [],
      }
      entry.available += available
      entry.stock_locations.push({
        id: locationId,
        name: location?.name ?? locationId,
        available,
      })
      byCity.set(city, entry)
    }
    return {
      id: variant.id,
      title: variant.title ?? null,
      sku: variant.sku ?? null,
      cities: [...byCity.values()],
    }
  })

  res.json({ product_id: product.id, variants })
}
