import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { TENANT_MODULE } from "../modules/tenant"
import TenantModuleService from "../modules/tenant/service"
import { ONEC_MODULE } from "../modules/onec"
import OnecModuleService from "../modules/onec/service"
import { OnecItem } from "../lib/onec/parse-items"
import { onecSku } from "../lib/onec/plan"
import { syncOnecPublication } from "../lib/onec/publication"
import { updateOnecProductsWorkflow } from "../workflows/onec/update-onec-products"
import { applyPriceStockWorkflow, PriceStockLine } from "../workflows/apply-price-stock"

// Разовая правка каталога компании, заведённого из Excel до 2026-11-06
// (случай NUR-STROI), — на месте, без удаления и повторной загрузки:
//
//  1. коды: позициям без кода — порядковые номера (в порядке заведения),
//     артикул варианта — <SLUG>-<номер>; дальше номера держит синхронизация;
//  2. цена: в файле единственной денежной колонкой была «Закупочная цена» —
//     она легла в себестоимость. По решению владельца (2026-11-06) переносим её
//     в цену продажи там, где цены нет, и публикуем товар. Правило разбора не
//     меняется: следующий файл должен нести колонку «Цена»;
//  3. остатки: в файле их нет — учёт остатков у вариантов компании выключаем
//     (manage_inventory = false), товар с ценой считается «в наличии».
//
//   TENANT_SLUG=nurstroi [APPLY=1] npx medusa exec ./src/scripts/fix-file-catalog.ts
//
// Без APPLY=1 — только план, база не меняется.

const BATCH = 200

const chunk = <T>(list: T[], size: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < list.length; i += size) {
    out.push(list.slice(i, i + size))
  }
  return out
}

type Variant = {
  id: string
  title?: string | null
  sku?: string | null
  manage_inventory?: boolean | null
  prices?: { amount?: number | null; currency_code?: string | null }[]
}
type Product = {
  id: string
  title: string
  metadata?: Record<string, unknown> | null
  variants?: Variant[]
}

export default async function fixFileCatalog({ container }: ExecArgs) {
  const log = (message: string) => console.log(message)
  const slug = process.env.TENANT_SLUG?.trim()
  const apply = process.env.APPLY === "1"
  if (!slug) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Задайте TENANT_SLUG")
  }
  const [tenant] = await container
    .resolve<TenantModuleService>(TENANT_MODULE)
    .listTenants({ slug }, { take: 1 })
  if (!tenant) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Компания «${slug}» не найдена`)
  }

  const onec = container.resolve<OnecModuleService>(ONEC_MODULE)
  const items = (await onec.listTenantItems(tenant.id)).sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
      a.id.localeCompare(b.id)
  )
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const products = new Map<string, Product>()
  for (const ids of chunk([...new Set(items.map((item) => item.product_id))], 500)) {
    const { data } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "metadata",
        "variants.id",
        "variants.title",
        "variants.sku",
        "variants.manage_inventory",
        "variants.prices.amount",
        "variants.prices.currency_code",
      ],
      filters: { id: ids },
    })
    for (const product of data as Product[]) {
      products.set(product.id, product)
    }
  }

  // 1. Коды.
  const used = new Set(items.map((item) => item.external_code).filter(Boolean) as string[])
  let next = 1
  const codes = new Map<string, string>()
  for (const item of items) {
    if (item.external_code) {
      continue
    }
    while (used.has(String(next))) {
      next += 1
    }
    const code = String(next)
    used.add(code)
    codes.set(item.id, code)
  }

  const updates: {
    products: { id: string; metadata: Record<string, unknown> }[]
    variants: { id: string; sku?: string; manage_inventory?: boolean }[]
    items: { id: string; external_code: string }[]
  } = { products: [], variants: [], items: [] }
  const lines: PriceStockLine[] = []
  let untrackedBefore = 0

  for (const item of items) {
    const product = products.get(item.product_id)
    const variant = product?.variants?.find((v) => v.id === item.variant_id)
    if (!product || !variant) {
      continue
    }
    const code = codes.get(item.id)
    const variantPatch: { id: string; sku?: string; manage_inventory?: boolean } = {
      id: variant.id,
    }
    if (code) {
      const sku = onecSku(tenant.slug, {
        key: item.external_key,
        code,
        article: null,
      } as OnecItem)
      updates.items.push({ id: item.id, external_code: code })
      updates.products.push({
        id: product.id,
        metadata: { ...(product.metadata ?? {}), onec_code: code },
      })
      if (variant.sku !== sku) {
        variantPatch.sku = sku
      }
    }
    // 3. Остатки.
    if (variant.manage_inventory === false) {
      untrackedBefore += 1
    } else {
      variantPatch.manage_inventory = false
    }
    if (Object.keys(variantPatch).length > 1) {
      updates.variants.push(variantPatch)
    }

    // 2. Цена из себестоимости — только там, где цены нет.
    const hasPrice = (variant.prices ?? []).some(
      (price) => price.currency_code === "kzt" && Number(price.amount) > 0
    )
    const cost = item.cost == null ? null : Number(item.cost)
    if (!hasPrice && cost != null && cost > 0) {
      lines.push({
        variant_id: variant.id,
        product_id: product.id,
        product_title: product.title,
        variant_title: variant.title ?? null,
        sku: variantPatch.sku ?? variant.sku ?? null,
        currency_code: "kzt",
        old_price: null,
        new_price: cost,
        carry_prices: [],
        location_id: null,
        inventory_item_id: null,
        old_stock: null,
        new_stock: null,
      })
    }
  }

  log(`Компания: ${tenant.name} (${tenant.slug}), позиций: ${items.length}`)
  log(`Коды: присвоить ${codes.size} (номера ${codes.size ? `1…${next}` : "—"})`)
  log(
    `Учёт остатков: выключить у ${updates.variants.filter((v) => v.manage_inventory === false).length}, уже выключен у ${untrackedBefore}`
  )
  log(`Цена из себестоимости: ${lines.length} товаров`)
  for (const line of lines.slice(0, 5)) {
    log(`  ${line.sku} · ${line.product_title} → ${line.new_price} ₸`)
  }
  if (!apply) {
    log("Это план. Применить: APPLY=1")
    return
  }

  for (let i = 0; i < Math.max(updates.variants.length, updates.items.length); i += BATCH) {
    await updateOnecProductsWorkflow(container).run({
      input: {
        products: updates.products.slice(i, i + BATCH),
        variants: updates.variants.slice(i, i + BATCH),
        cards: [],
        items: updates.items.slice(i, i + BATCH),
      },
      throwOnError: true,
    })
  }
  log("Коды и учёт остатков записаны")

  for (const batch of chunk(lines, BATCH)) {
    await applyPriceStockWorkflow(container).run({
      input: {
        lines: batch,
        changed_by: null,
        changed_by_name: "Перенос закупочной цены из Excel (разово, 2026-11-06)",
        source: "import",
      },
      throwOnError: true,
    })
  }
  const published = await syncOnecPublication(
    container,
    lines.map((line) => line.product_id as string)
  )
  log(`Цены записаны: ${lines.length}, опубликовано: ${published}`)
}
