import {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils"
import { PRODUCT_SEGMENTS } from "../../../modules/catalog/models/product-card"
import { StoreProductSegment } from "./validators"

// Дефолты пагинации ядрового GET /store/products — для пустого ответа,
// когда по сегменту ничего не нашлось.
const DEFAULT_LIMIT = 50
const DEFAULT_OFFSET = 0

// Кастомный фильтр `?segment=` ядрового GET /store/products. Регистрируется
// на wildcard-матчере `/store/products*`: wildcard-middleware встают РАНЬШЕ
// статических (RoutesSorter: global → wildcard → regex → static → params),
// поэтому segment вырезается из req.query до строгого ядрового валидатора —
// иначе тот отверг бы незнакомое поле. Двухшагово (см. docs/modules/catalog.md):
// ids товаров с карточкой нужного сегмента из модуля catalog → фильтр `id`
// ядрового роута.
export async function filterProductsBySegment(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  try {
    // Wildcard-матчер цепляет и подроуты (:id/availability и т.п.) —
    // фильтр применяем только к самому списку.
    const path = req.originalUrl.split("?")[0].replace(/\/+$/, "")
    if (!path.endsWith("/store/products")) {
      return next()
    }

    const raw = req.query.segment
    if (raw === undefined) {
      return next()
    }

    const parsed = StoreProductSegment.safeParse(raw)
    if (!parsed.success) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid segment: expected one of ${PRODUCT_SEGMENTS.join(", ")}`
      )
    }
    delete req.query.segment

    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: cards } = await query.graph({
      entity: "product_card",
      fields: ["id", "product.id"],
      filters: { segment: parsed.data },
    })
    const segmentProductIds = cards
      .map((card: { product?: { id: string } | null }) => card.product?.id)
      .filter((id: string | undefined): id is string => Boolean(id))

    // Пересечение с фильтром id, если клиент передал и его тоже.
    const existing = req.query.id
    const ids =
      existing === undefined
        ? segmentProductIds
        : segmentProductIds.filter((id) =>
            Array.isArray(existing) ? existing.includes(id) : existing === id
          )
    req.query.id = ids

    // Пустой список ids ядро трактует как отсутствие фильтра (вернуло бы
    // весь каталог) — отвечаем пустой страницей сами.
    if (!ids.length) {
      const limit = Number(req.query.limit)
      const offset = Number(req.query.offset)
      res.json({
        products: [],
        count: 0,
        offset: Number.isFinite(offset) ? offset : DEFAULT_OFFSET,
        limit: Number.isFinite(limit) ? limit : DEFAULT_LIMIT,
      })
      return
    }

    return next()
  } catch (error) {
    return next(error)
  }
}
