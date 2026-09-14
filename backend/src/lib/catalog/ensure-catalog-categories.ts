import { MedusaContainer } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"
import {
  CATALOG_CATEGORIES,
  CatalogCategoryHandle,
} from "./categories"

// Создание недостающих категорий каталога и выдача карты handle → id.
// Идемпотентно: существующие категории не трогаем (владелец вправе
// переименовать их в панели — ищем по handle, а не по имени). Общая точка для
// сидов и миграционного скрипта, чтобы четыре категории заводились ровно
// одинаково и в одном месте.

export type CatalogCategoryIds = Record<CatalogCategoryHandle, string>

export const ensureCatalogCategories = async (
  container: MedusaContainer,
  log: (message: string) => void = () => {}
): Promise<CatalogCategoryIds> => {
  const productService = container.resolve(Modules.PRODUCT)

  // select обязателен: без него модуль отдаёт строки без handle, карта
  // handle → id получается пустой, и сид пытается создать категории заново
  // («handle already exists»).
  const existing = await productService.listProductCategories(
    { handle: CATALOG_CATEGORIES.map((c) => c.handle) },
    { take: CATALOG_CATEGORIES.length, select: ["id", "handle"] }
  )
  const byHandle = new Map(existing.map((c) => [c.handle, c.id]))

  const missing = CATALOG_CATEGORIES.filter((c) => !byHandle.has(c.handle))
  if (missing.length) {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: missing.map((c) => ({
          name: c.name,
          handle: c.handle,
          description: c.description,
          is_active: true,
        })),
      },
    })
    for (const created of result) {
      byHandle.set(created.handle, created.id)
      log(`+ категория создана: ${created.name} (${created.handle})`)
    }
  }
  for (const c of CATALOG_CATEGORIES) {
    if (existing.some((e) => e.handle === c.handle)) {
      log(`— категория уже есть: ${c.name} (${c.handle})`)
    }
  }

  const ids = {} as CatalogCategoryIds
  for (const c of CATALOG_CATEGORIES) {
    const id = byHandle.get(c.handle)
    if (!id) {
      throw new Error(`Категория ${c.handle} не создана — сид прерван`)
    }
    ids[c.handle] = id
  }
  return ids
}
