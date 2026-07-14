import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"

// Максимум складов на один город (бизнес-правило ТЗ: «Город → Склад (до 5 на
// город) → Остаток»). Ядро Medusa числа складов на город не ограничивает —
// своей модели склада/города не заводим, город = stock_location.address.city
// (см. docs/modules/catalog.md).
export const MAX_STOCK_LOCATIONS_PER_CITY = 5

// Нормализация города для сравнения: регистр и крайние пробелы не важны
// («Astana» и «astana » — один город).
const normalizeCity = (city: unknown): string | null => {
  if (typeof city !== "string") {
    return null
  }
  const trimmed = city.trim()
  return trimmed.length ? trimmed.toLowerCase() : null
}

// Middleware на POST /admin/stock-locations: до создания склада считает уже
// существующие склады в том же городе и отклоняет создание сверх лимита.
// Регистрируется РАНЬШЕ ядрового валидатора тела — читает сырой req.body
// (город берём из address.city). Склады без города не ограничиваем.
export async function limitStockLocationsPerCity(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  try {
    const body = (req.body ?? {}) as {
      address?: { city?: unknown } | null
    }
    const city = normalizeCity(body.address?.city)
    if (!city) {
      return next()
    }

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: locations } = await query.graph({
      entity: "stock_location",
      fields: ["id", "address.city"],
    })

    const sameCityCount = locations.filter(
      (location: { address?: { city?: string | null } | null }) =>
        normalizeCity(location.address?.city) === city
    ).length

    if (sameCityCount >= MAX_STOCK_LOCATIONS_PER_CITY) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `City already has the maximum of ${MAX_STOCK_LOCATIONS_PER_CITY} stock locations`
      )
    }

    return next()
  } catch (error) {
    return next(error)
  }
}
