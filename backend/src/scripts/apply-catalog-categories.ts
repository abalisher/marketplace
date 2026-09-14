import { ExecArgs } from "@medusajs/framework/types"
import { Modules, ProductStatus } from "@medusajs/framework/utils"
import { CATALOG_CATEGORIES } from "../lib/catalog/categories"
import { classifyProductCategory } from "../lib/catalog/classify-product-category"
import { ensureCatalogCategories } from "../lib/catalog/ensure-catalog-categories"

// Разбор существующего каталога по четырём категориям (T10.10). Нужен для стенда,
// который наполняли ДО решения владельца: сиды теперь задают категорию явно,
// а уже заведённым товарам её надо проставить.
//
// Что делает: заводит недостающие категории, каждому товару ставит РОВНО ОДНУ
// (по названию, classify-product-category), а товар, не попавший ни в одну из
// четырёх, снимает с публикации (published → draft): решение владельца
// 2026-09-01 — ассортимент это черновая отделка, электрика, сантехника и метизы,
// общестрой (песок, щебень, кирпич, арматура, блоки, пиломатериал, кровля,
// утеплитель) из продажи уходит. Товар и его остатки НЕ удаляются: вернуть
// в продажу — вопрос смены статуса.
//
// Запуск (по умолчанию только показывает план, ничего не меняет):
//   npx medusa exec ./src/scripts/apply-catalog-categories.ts
//   npx medusa exec ./src/scripts/apply-catalog-categories.ts apply

const PAGE = 100

export default async function applyCatalogCategories({
  container,
  args,
}: ExecArgs) {
  const apply = (args ?? []).includes("apply")
  const productService = container.resolve(Modules.PRODUCT)

  console.log(
    apply
      ? "Режим: ПРИМЕНЕНИЕ изменений."
      : "Режим: сухой прогон (ничего не меняется). Добавьте аргумент apply, чтобы применить."
  )

  const categoryIds = apply
    ? await ensureCatalogCategories(container, (m) => console.log(m))
    : null
  if (!apply) {
    for (const c of CATALOG_CATEGORIES) {
      console.log(`  категория: ${c.name} (${c.handle})`)
    }
  }

  let offset = 0
  let assigned = 0
  let kept = 0
  let retired = 0
  const retiredTitles: string[] = []

  for (;;) {
    const products = await productService.listProducts(
      {},
      {
        skip: offset,
        take: PAGE,
        relations: ["categories"],
        order: { title: "ASC" },
      }
    )
    if (!products.length) {
      break
    }
    offset += products.length

    for (const product of products) {
      const handle = classifyProductCategory(product.title)

      if (!handle) {
        if (product.status === ProductStatus.PUBLISHED) {
          retired += 1
          retiredTitles.push(product.title)
          console.log(`× вне ассортимента → draft: ${product.title}`)
          if (apply) {
            await productService.updateProducts(product.id, {
              status: ProductStatus.DRAFT,
            })
          }
        } else {
          console.log(`· вне ассортимента (и так не опубликован): ${product.title}`)
        }
        continue
      }

      const target = CATALOG_CATEGORIES.find((c) => c.handle === handle)!
      const current = product.categories ?? []
      const alreadyExact =
        current.length === 1 && current[0]?.handle === handle
      if (alreadyExact) {
        kept += 1
        continue
      }

      assigned += 1
      console.log(`+ ${product.title} → ${target.name}`)
      if (apply && categoryIds) {
        await productService.updateProducts(product.id, {
          category_ids: [categoryIds[handle]],
        })
      }
    }
  }

  // Категории вне четвёрки гасим (is_active = false): ассортимент — ровно
  // четыре категории, а живой остаток стартового сида («Merch», «Pants») и
  // прежняя общая «Строительные материалы» засоряют фильтр в панели. Не
  // удаляем: погашенную категорию видно и можно вернуть.
  const allCategories = await productService.listProductCategories(
    {},
    { take: 200, select: ["id", "handle", "name", "is_active"] }
  )
  let deactivated = 0
  for (const category of allCategories) {
    const isOurs = CATALOG_CATEGORIES.some((c) => c.handle === category.handle)
    if (isOurs || !category.is_active) {
      continue
    }
    deactivated += 1
    console.log(`· категория вне четвёрки → выключена: ${category.name}`)
    if (apply) {
      await productService.updateProductCategories(category.id, {
        is_active: false,
      })
    }
  }

  console.log(
    `Итог: назначено ${assigned}, уже верно ${kept}, снято с публикации ${retired}, ` +
      `выключено категорий ${deactivated}.`
  )
  if (retiredTitles.length) {
    console.log("Сняты с публикации: " + retiredTitles.join(", "))
  }
  if (!apply) {
    console.log("Изменения НЕ применены (сухой прогон).")
  }
}
