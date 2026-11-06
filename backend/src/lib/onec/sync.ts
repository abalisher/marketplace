import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { linkProductsToSalesChannelWorkflow } from "@medusajs/medusa/core-flows"
import { ensureCatalogCategories } from "../catalog/ensure-catalog-categories"
import { loadChannelStockLocationIds } from "../tenants/scope"
import { TENANT_MODULE } from "../../modules/tenant"
import TenantModuleService from "../../modules/tenant/service"
import { ONEC_MODULE } from "../../modules/onec"
import OnecModuleService from "../../modules/onec/service"
import {
  OnecSyncStatus,
  OnecSyncTrigger,
} from "../../modules/onec/models/onec-sync-run"
import {
  PRICE_STOCK_CURRENCY,
  RawVariant,
  variantLevels,
  variantPrice,
} from "../../api/admin/price-stock/rows"
import {
  applyPriceStockWorkflow,
  PriceStockLine,
} from "../../workflows/apply-price-stock"
import { importOnecProductsWorkflow } from "../../workflows/onec/import-onec-products"
import { updateOnecProductsWorkflow } from "../../workflows/onec/update-onec-products"
import { fetchOnecItems, OnecCredentials, OnecRequestError } from "./client"
import { OnecFileFeed } from "./file-feed"
import {
  mergeOnecBalances,
  OnecField,
  OnecItem,
  parseOnecBalances,
  parseOnecItems,
} from "./parse-items"
import {
  OnecDesiredProduct,
  OnecExistingProduct,
  OnecProductUpdate,
  managedFieldsOf,
  onecFieldsOf,
  onecMetadata,
  planOnecSync,
} from "./plan"
import { decryptSecret } from "./secret"

// Синхронизация каталога компании с её 1С: забрать номенклатуру, сравнить с
// товарами компании (lib/onec/plan.ts) и применить разницу партиями.
//
// Почему не один workflow на весь прогон: позиций тысячи, и одна битая (дубль
// артикула, не созданная цена) не должна откатывать остальные. Каждая партия —
// свой атомарный workflow с компенсацией; партия, упавшая целиком, повторяется
// поштучно, и в журнал прогона попадают только действительно негодные позиции.

export const ONEC_CREATE_BATCH = 25
export const ONEC_UPDATE_BATCH = 50
export const ONEC_PRICE_STOCK_BATCH = 200
const MAX_RUN_ISSUES = 100
// Подпись правок цены и остатка в журнале «Цены и остатки».
export const ONEC_ACTOR_NAME = "1С"
export const ONEC_FILE_ACTOR_NAME = "Excel"

export type OnecRunIssue = { key: string | null; name: string | null; message: string }

export class OnecSyncError extends Error {
  constructor(
    public code: "not_configured" | "busy" | "tenant_inactive" | "no_location",
    message: string
  ) {
    super(message)
  }
}

const onecService = (container: MedusaContainer) =>
  container.resolve<OnecModuleService>(ONEC_MODULE)

const errorMessage = (error: unknown): string =>
  (error as { message?: string })?.message ?? String(error)

// Учётные данные подключения компании (пароль расшифрован).
export const loadOnecCredentials = async (
  container: MedusaContainer,
  tenantId: string
): Promise<OnecCredentials> => {
  const connection = await onecService(container).getConnectionByTenant(tenantId)
  if (
    !connection ||
    connection.source === "file" ||
    !connection.base_url ||
    !connection.login ||
    !connection.password_cipher
  ) {
    throw new OnecSyncError(
      "not_configured",
      "Подключение к 1С для компании не настроено"
    )
  }
  return {
    base_url: connection.base_url,
    login: connection.login,
    password: decryptSecret(connection.password_cipher),
  }
}

// --- Проверка подключения: запрос и разбор без записи в каталог ---

// Номенклатура со сведёнными остатками и ценами второго сервиса (stock_url).
//
// Остатки не получены (сервис не отвечает) — ошибка прогона целиком: иначе
// поле «остаток» то бралось бы из 1С, то отдавалось продавцу, и товары
// переключались бы туда-обратно. Пустой ответ остатков — не ошибка: сервис
// ничего не нашёл (так у ORGSTROY сейчас), остатки и цены остаются за
// продавцом, пока 1С не начнёт их отдавать. Ни одна строка остатков не
// сопоставилась с номенклатурой — тоже не применяем: иначе всем позициям
// записался бы остаток 0.
export type OnecStockInfo = {
  total: number
  received: number
  matched: number
  fields: Partial<Record<OnecField, string>>
  applied: boolean
  note: string | null
}

export const loadOnecFeed = async (
  credentials: OnecCredentials & {
    stock_url?: string | null
  }
): Promise<{
  items: OnecItem[]
  total: number
  fields: Partial<Record<OnecField, string>>
  issues: { index?: number; key: string | null; name: string | null; message: string }[]
  stock: OnecStockInfo | null
  duration_ms: number
  bytes: number
}> => {
  const fetched = await fetchOnecItems(credentials)
  const parsed = parseOnecItems(fetched.payload)
  const result = {
    items: parsed.items,
    total: parsed.total,
    fields: { ...parsed.fields },
    issues: [...parsed.issues] as {
      key: string | null
      name: string | null
      message: string
    }[],
    stock: null as OnecStockInfo | null,
    duration_ms: fetched.duration_ms,
    bytes: fetched.bytes,
  }
  if (!credentials.stock_url) {
    return result
  }

  let stockFetched: Awaited<ReturnType<typeof fetchOnecItems>>
  let stock: ReturnType<typeof parseOnecBalances>
  try {
    stockFetched = await fetchOnecItems({
      ...credentials,
      base_url: credentials.stock_url,
    })
    stock = parseOnecBalances(stockFetched.payload)
  } catch (error) {
    // Какой из двух сервисов подвёл — продавцу надо знать.
    if (error instanceof Error) {
      error.message = `Сервис остатков: ${error.message}`
    }
    throw error
  }
  const info: OnecStockInfo = {
    total: stock.total,
    received: stock.balances.length,
    matched: 0,
    fields: stock.fields,
    applied: false,
    note: null,
  }
  result.stock = info
  result.duration_ms += stockFetched.duration_ms
  result.bytes += stockFetched.bytes

  if (!stock.balances.length) {
    info.note =
      "Выгрузка остатков 1С пуста — остатки и цены из неё не применены (их задаёт продавец)"
  } else if (!stock.fields.stock && !stock.fields.price && !stock.fields.cost) {
    info.note =
      "В выгрузке остатков не найдено ни поля остатка, ни поля цены — не применена"
  } else {
    const merged = mergeOnecBalances(parsed.items, stock.balances)
    info.matched = merged.matched
    if (!merged.matched) {
      info.note =
        "Ни одна строка остатков не совпала с номенклатурой по коду — не применена"
    } else {
      info.applied = true
      result.items = merged.items
      if (stock.fields.stock) {
        result.fields.stock = stock.fields.stock
      }
      if (stock.fields.cost) {
        result.fields.cost = stock.fields.cost
      }
      if (stock.fields.price) {
        result.fields.price = stock.fields.price
      }
    }
  }
  if (info.note) {
    result.issues.push({ key: null, name: null, message: info.note })
  }
  return result
}

export type OnecTestResult = {
  ok: true
  duration_ms: number
  bytes: number
  total: number
  received: number
  fields: Record<string, string>
  sample: OnecItem[]
  stock: OnecStockInfo | null
  issues: { key: string | null; name: string | null; message: string }[]
  // Excel: лист и строка заголовков, по которым прочитан файл.
  sheet: string | null
  header_row: number | null
  // Excel: колонки, дописанные к наименованию («Характеристика», «Бренд»).
  name_parts: string[]
}

export type OnecFeed = Awaited<ReturnType<typeof loadOnecFeed>> | OnecFileFeed

export const testOnecConnection = async (
  credentials: OnecCredentials & {
    stock_url?: string | null
  }
): Promise<OnecTestResult> => feedSummary(await loadOnecFeed(credentials))

// Что разбор понял из выгрузки или файла — для экрана проверки.
export const feedSummary = (feed: OnecFeed): OnecTestResult => {
  return {
    ok: true,
    duration_ms: feed.duration_ms,
    bytes: feed.bytes,
    total: feed.total,
    received: feed.items.length,
    fields: feed.fields as Record<string, string>,
    sample: feed.items.slice(0, 10),
    stock: feed.stock,
    issues: feed.issues.slice(0, 20).map(({ key, name, message }) => ({
      key,
      name,
      message,
    })),
    sheet: "sheet" in feed ? feed.sheet : null,
    header_row: "header_row" in feed ? feed.header_row : null,
    name_parts: "name_parts" in feed ? feed.name_parts : [],
  }
}

// --- Текущее состояние товаров компании из 1С ---

type ExistingRow = OnecExistingProduct & {
  variant_title: string | null
  sku: string | null
  inventory_item_id: string | null
  carry_prices: { amount: number; currency_code: string }[]
  price_editable: boolean
}

const PRODUCT_FIELDS = [
  "id",
  "metadata",
  "title",
  "description",
  "status",
  "product_card.id",
  "product_card.unit",
  "categories.handle",
  "variants.id",
  "variants.title",
  "variants.sku",
  "variants.prices.amount",
  "variants.prices.currency_code",
  "variants.prices.rules_count",
  "variants.inventory_items.inventory.id",
  "variants.inventory_items.inventory.location_levels.location_id",
  "variants.inventory_items.inventory.location_levels.stocked_quantity",
]

const chunk = <T>(list: T[], size: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < list.length; i += size) {
    out.push(list.slice(i, i + size))
  }
  return out
}

const loadExisting = async (
  container: MedusaContainer,
  tenantId: string,
  locationId: string
): Promise<{ rows: ExistingRow[]; orphanItemIds: string[] }> => {
  const service = onecService(container)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const items = await service.listTenantItems(tenantId)
  if (!items.length) {
    return { rows: [], orphanItemIds: [] }
  }

  type RawProduct = {
    id: string
    title: string
    description?: string | null
    status: string
    metadata?: Record<string, unknown> | null
    product_card?: { id: string; unit?: string | null } | null
    categories?: { handle?: string | null }[]
    variants?: (RawVariant & { title?: string | null })[]
  }
  const products = new Map<string, RawProduct>()
  for (const ids of chunk([...new Set(items.map((item) => item.product_id))], 500)) {
    const { data } = await query.graph({
      entity: "product",
      fields: PRODUCT_FIELDS,
      filters: { id: ids },
    })
    for (const product of data as RawProduct[]) {
      products.set(product.id, product)
    }
  }

  const rows: ExistingRow[] = []
  const orphanItemIds: string[] = []
  for (const item of items) {
    const product = products.get(item.product_id)
    const variant = product?.variants?.find((v) => v.id === item.variant_id)
    // Товар удалили в панели мимо 1С — связь мёртвая: снимаем её, и позиция
    // заведётся заново.
    if (!product || !variant) {
      orphanItemIds.push(item.id)
      continue
    }
    const price = variantPrice(variant, PRICE_STOCK_CURRENCY)
    const level = variantLevels(variant).find(
      (entry) => entry.location_id === locationId
    )
    rows.push({
      onec_item_id: item.id,
      key: item.external_key,
      present: item.present,
      product_id: product.id,
      variant_id: variant.id,
      title: product.title,
      description: product.description ?? null,
      status: product.status,
      unit: product.product_card?.unit ?? null,
      product_card_id: product.product_card?.id ?? null,
      category:
        product.categories?.find((category) => !!category.handle)?.handle ?? null,
      price: price.amount,
      stock: level ? Number(level.stocked_quantity ?? 0) : null,
      onec_fields: onecFieldsOf(product.metadata),
      cost: item.cost == null ? null : Number(item.cost),
      variant_title: variant.title ?? null,
      sku: variant.sku ?? null,
      inventory_item_id: variant.inventory_items?.[0]?.inventory?.id ?? null,
      carry_prices: price.carry_prices,
      price_editable: price.editable,
    })
  }
  return { rows, orphanItemIds }
}

// --- Прогон ---

type RunCounters = {
  received: number
  created: number
  updated: number
  unchanged: number
  hidden: number
  detached: number
  failed: number
}

export type OnecSyncRunResult = RunCounters & {
  run_id: string
  status: OnecSyncStatus
  error: string | null
  issues: OnecRunIssue[]
}

const priceStockLine = (
  row: ExistingRow,
  update: OnecProductUpdate,
  locationId: string
): PriceStockLine | null => {
  const newPrice = update.price && row.price_editable ? update.price.new : null
  const newStock = update.stock && row.inventory_item_id ? update.stock.new : null
  if (newPrice == null && newStock == null) {
    return null
  }
  return {
    variant_id: row.variant_id,
    product_id: row.product_id,
    product_title: update.desired.title,
    variant_title: row.variant_title,
    sku: row.sku,
    currency_code: PRICE_STOCK_CURRENCY,
    old_price: row.price,
    new_price: newPrice,
    carry_prices: row.carry_prices,
    location_id: newStock == null ? null : locationId,
    inventory_item_id: newStock == null ? null : row.inventory_item_id,
    old_stock: row.stock,
    new_stock: newStock,
  }
}

// Прогон из Excel получает уже прочитанный файл (lib/onec/file-feed.ts);
// прогон 1С забирает выгрузку сам.
export type OnecSyncInput = {
  tenant_id: string
  trigger: OnecSyncTrigger
  user_id?: string | null
  feed?: OnecFileFeed
  file_name?: string | null
}

// Подключение, по которому может пойти прогон: у 1С — адрес и учётные данные,
// у Excel — сам файл.
const assertRunnable = (
  connection: Awaited<ReturnType<OnecModuleService["getConnectionByTenant"]>>,
  input: OnecSyncInput
): NonNullable<typeof connection> => {
  if (!connection) {
    throw new OnecSyncError(
      "not_configured",
      input.feed
        ? "Каталог компании из Excel не настроен"
        : "Подключение к 1С для компании не настроено"
    )
  }
  if (connection.source === "file" && !input.feed) {
    throw new OnecSyncError(
      "not_configured",
      "Каталог компании ведётся Excel-файлом — загрузите файл"
    )
  }
  if (connection.source !== "file" && input.feed) {
    throw new OnecSyncError(
      "not_configured",
      "Каталог компании ведёт её 1С — Excel-файл здесь не загружается"
    )
  }
  if (
    connection.source !== "file" &&
    (!connection.base_url || !connection.login || !connection.password_cipher)
  ) {
    throw new OnecSyncError(
      "not_configured",
      "Подключение к 1С для компании не настроено"
    )
  }
  return connection
}

export const runOnecSync = async (
  container: MedusaContainer,
  input: OnecSyncInput
): Promise<OnecSyncRunResult> => {
  const service = onecService(container)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const connection = assertRunnable(
    await service.getConnectionByTenant(input.tenant_id),
    input
  )
  const fromFile = connection.source === "file"
  if (await service.hasActiveRun(input.tenant_id)) {
    throw new OnecSyncError(
      "busy",
      "Загрузка каталога уже идёт — дождитесь её окончания"
    )
  }

  const run = await service.createOnecSyncRuns({
    tenant_id: input.tenant_id,
    trigger: input.trigger,
    status: "running",
    started_at: new Date(),
    user_id: input.user_id ?? null,
    file_name: input.file_name ?? null,
  })

  const counters: RunCounters = {
    received: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    hidden: 0,
    detached: 0,
    failed: 0,
  }
  const issues: OnecRunIssue[] = []
  const addIssue = (issue: OnecRunIssue) => {
    if (issues.length < MAX_RUN_ISSUES) {
      issues.push(issue)
    }
  }

  const finish = async (status: OnecSyncStatus, error: string | null = null) => {
    await service.updateOnecSyncRuns({
      id: run.id,
      status,
      finished_at: new Date(),
      ...counters,
      error,
      issues: issues as unknown as Record<string, unknown>,
    })
    logger.info(
      `[onec] tenant ${input.tenant_id}: ${status} — получено ${counters.received}, создано ${counters.created}, обновлено ${counters.updated}, снято ${counters.hidden}, убрано из канала ${counters.detached}, ошибок ${counters.failed}${error ? ` (${error})` : ""}`
    )
    return { run_id: run.id, status, error, issues, ...counters }
  }

  try {
    const tenants = container.resolve<TenantModuleService>(TENANT_MODULE)
    const [tenant] = await tenants.listTenants({ id: input.tenant_id }, { take: 1 })
    if (!tenant || tenant.status !== "active") {
      throw new OnecSyncError("tenant_inactive", "Компания не найдена или приостановлена")
    }

    const locationIds = await loadChannelStockLocationIds(
      container,
      tenant.sales_channel_id
    )
    const locationId =
      connection.stock_location_id && locationIds.includes(connection.stock_location_id)
        ? connection.stock_location_id
        : locationIds[0]
    if (!locationId) {
      throw new OnecSyncError(
        "no_location",
        "У компании нет склада — остатки из 1С положить некуда"
      )
    }

    // 1. Данные 1С или файла. Ошибка здесь — провал прогона без единой записи
    // в каталог.
    const parsed: OnecFeed =
      input.feed ??
      (await loadOnecFeed({
        base_url: connection.base_url!,
        stock_url: connection.stock_url,
        login: connection.login!,
        password: decryptSecret(connection.password_cipher!),
      }))
    counters.received = parsed.items.length
    parsed.issues.forEach((issue) =>
      addIssue({ key: issue.key, name: issue.name, message: issue.message })
    )
    if (!parsed.items.length) {
      return await finish(
        "empty",
        fromFile
          ? "В файле нет ни одной годной позиции — каталог не тронут"
          : parsed.total
            ? "В ответе 1С нет ни одной годной позиции — каталог не тронут"
            : "1С вернула пустой список номенклатуры — каталог не тронут"
      )
    }

    // 2. План.
    const { rows: existing, orphanItemIds } = await loadExisting(
      container,
      input.tenant_id,
      locationId
    )
    if (orphanItemIds.length) {
      await service.deleteOnecItems(orphanItemIds)
    }
    // Цену и остаток 1С ведёт, только если присылает их.
    const managed = managedFieldsOf(parsed.fields)
    const plan = planOnecSync(
      tenant.slug,
      parsed.items,
      existing,
      managed,
      !!parsed.fields.cost,
      fromFile ? "file" : "http"
    )
    const existingById = new Map(existing.map((row) => [row.onec_item_id, row]))
    if (plan.hide_suppressed) {
      addIssue({
        key: null,
        name: null,
        message: `Из 1С пропало ${plan.hide_suppressed} позиций — больше половины каталога. Похоже на сбой выгрузки, поэтому товары с витрины НЕ сняты. Если позиции действительно убраны, снимите их вручную или проверьте выгрузку в 1С.`,
      })
    }

    const categoryIds = await ensureCatalogCategories(container)
    const fulfillment = container.resolve(Modules.FULFILLMENT)
    const [shippingProfile] = await fulfillment.listShippingProfiles(
      { type: "default" },
      { take: 1 }
    )

    // 3. Новые позиции.
    const importBatch = async (batch: OnecDesiredProduct[]) =>
      importOnecProductsWorkflow(container).run({
        input: {
          tenant_id: input.tenant_id,
          sales_channel_id: tenant.sales_channel_id,
          location_id: locationId,
          shipping_profile_id: shippingProfile?.id ?? null,
          category_ids: categoryIds,
          products: batch,
        },
        throwOnError: true,
      })
    for (const batch of chunk(plan.creates, ONEC_CREATE_BATCH)) {
      try {
        await importBatch(batch)
        counters.created += batch.length
      } catch {
        // Партия упала целиком (и откатилась) — повторяем поштучно, чтобы
        // одна негодная позиция не держала остальные.
        for (const product of batch) {
          try {
            await importBatch([product])
            counters.created += 1
          } catch (error) {
            counters.failed += 1
            addIssue({
              key: product.key,
              name: product.title,
              message: `Не заведена: ${errorMessage(error)}`,
            })
          }
        }
      }
    }
    if (!managed.includes("price")) {
      addIssue({
        key: null,
        name: null,
        message:
          "Выгрузка 1С не содержит цен: цены задаёт продавец на «Ценах и остатках» (вручную или файлом по артикулу). Товар без цены не продаётся.",
      })
    } else {
      plan.creates
        .filter((product) => !product.published)
        .slice(0, 20)
        .forEach((product) =>
          addIssue({
            key: product.key,
            name: product.title,
            message: "В 1С нет цены — товар заведён, но не продаётся",
          })
        )
    }
    if (!managed.includes("stock")) {
      addIssue({
        key: null,
        name: null,
        message:
          "Выгрузка 1С не содержит остатков: остатки задаёт продавец на «Ценах и остатках».",
      })
    }

    // 4. Изменённые позиции: название, описание, статус, категория, единица.
    const applyUpdates = async (batch: OnecProductUpdate[]) =>
      updateOnecProductsWorkflow(container).run({
        input: {
          products: batch
            .filter((update) => Object.keys(update.product).length > 0)
            .map((update) => ({
              id: update.existing.product_id,
              ...(update.product.title !== undefined
                ? { title: update.product.title }
                : {}),
              ...(update.product.description !== undefined
                ? { description: update.product.description }
                : {}),
              ...(update.product.status !== undefined
                ? { status: update.product.status }
                : {}),
              ...(update.product.category !== undefined &&
              categoryIds[update.product.category]
                ? { category_ids: [categoryIds[update.product.category]] }
                : {}),
              ...(update.product.onec_fields !== undefined
                ? {
                    metadata: onecMetadata(
                      update.existing.key,
                      update.desired.code,
                      update.product.onec_fields,
                      update.desired.feed
                    ),
                  }
                : {}),
            })),
          cards: batch
            .filter(
              (update) =>
                update.unit !== undefined && !!update.existing.product_card_id
            )
            .map((update) => ({
              product_card_id: update.existing.product_card_id as string,
              unit: update.unit as string,
            })),
          // Себестоимость из 1С — в нашу таблицу позиций, не в товар (витрина
          // отдаёт варианты целиком, себестоимость утекла бы покупателю).
          items: batch
            .filter((update) => update.cost !== undefined)
            .map((update) => ({
              id: update.existing.onec_item_id,
              cost: update.cost?.new ?? null,
            })),
        },
        throwOnError: true,
      })

    const failedUpdates = new Set<string>()
    for (const batch of chunk(plan.updates, ONEC_UPDATE_BATCH)) {
      try {
        await applyUpdates(batch)
      } catch {
        for (const update of batch) {
          try {
            await applyUpdates([update])
          } catch (error) {
            failedUpdates.add(update.existing.onec_item_id)
            counters.failed += 1
            addIssue({
              key: update.desired.key,
              name: update.desired.title,
              message: `Не обновлена: ${errorMessage(error)}`,
            })
          }
        }
      }
    }

    // Позиции, снова появившиеся в 1С, — отметка «есть в 1С».
    const returned = [
      ...plan.updates
        .filter(
          (update) =>
            !update.existing.present &&
            !failedUpdates.has(update.existing.onec_item_id)
        )
        .map((update) => update.existing.onec_item_id),
      ...plan.unchanged
        .filter((row) => !row.present)
        .map((row) => row.onec_item_id),
    ]
    if (returned.length) {
      await updateOnecProductsWorkflow(container).run({
        input: {
          products: [],
          cards: [],
          items: returned.map((id) => ({ id, present: true })),
        },
        throwOnError: true,
      })
    }

    // 5. Цена и остаток — общим путём экрана «Цены и остатки», с журналом.
    const lines = plan.updates
      .filter((update) => !failedUpdates.has(update.existing.onec_item_id))
      .map((update) => {
        const row = existingById.get(update.existing.onec_item_id) as ExistingRow
        if (update.price && !row.price_editable) {
          addIssue({
            key: update.desired.key,
            name: update.desired.title,
            message: "Цена задана правилами в панели — из 1С не перезаписана",
          })
        }
        return priceStockLine(row, update, locationId)
      })
      .filter((line): line is PriceStockLine => !!line)
    const failedLines = new Set<string>()
    const applyLines = (batch: PriceStockLine[]) =>
      applyPriceStockWorkflow(container).run({
        input: {
          lines: batch,
          changed_by: null,
          changed_by_name: fromFile ? ONEC_FILE_ACTOR_NAME : ONEC_ACTOR_NAME,
          source: "onec",
        },
        throwOnError: true,
      })
    for (const batch of chunk(lines, ONEC_PRICE_STOCK_BATCH)) {
      try {
        await applyLines(batch)
      } catch {
        for (const line of batch) {
          try {
            await applyLines([line])
          } catch (error) {
            failedLines.add(line.variant_id)
            counters.failed += 1
            addIssue({
              key: null,
              name: line.product_title,
              message: `Цена/остаток не применены: ${errorMessage(error)}`,
            })
          }
        }
      }
    }
    counters.updated = plan.updates.filter(
      (update) =>
        !failedUpdates.has(update.existing.onec_item_id) &&
        !failedLines.has(update.existing.variant_id)
    ).length
    counters.unchanged = plan.unchanged.length

    // 6. Пропавшие из 1С — с витрины долой (товар остаётся черновиком).
    for (const batch of chunk(plan.hides, ONEC_UPDATE_BATCH)) {
      try {
        await updateOnecProductsWorkflow(container).run({
          input: {
            products: batch
              .filter((row) => row.status === "published")
              .map((row) => ({ id: row.product_id, status: "draft" as const })),
            cards: [],
            items: batch.map((row) => ({ id: row.onec_item_id, present: false })),
          },
          throwOnError: true,
        })
        counters.hidden += batch.length
      } catch (error) {
        counters.failed += batch.length
        addIssue({
          key: null,
          name: null,
          message: `Не сняты с витрины ${batch.length} позиций: ${errorMessage(error)}`,
        })
      }
    }

    // 7. Каталог компании = только 1С: товары канала, которых 1С не ведёт
    // (общий демо-каталог площадки), из канала компании убираем. Только когда
    // у компании есть хоть один ПРОДАВАЕМЫЙ товар из 1С: иначе витрина
    // осталась бы пустой — например, пока выгрузка без цен, а продавец их ещё
    // не проставил.
    if (connection.exclusive_catalog) {
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const ownIds = [
        ...new Set(
          (await service.listTenantItems(input.tenant_id)).map((item) => item.product_id)
        ),
      ]
      const { data: published } = ownIds.length
        ? await query.graph({
            entity: "product",
            fields: ["id"],
            filters: { id: ownIds, status: "published" },
          })
        : { data: [] }
      const own = new Set(ownIds)
      if (published.length > 0) {
        const { data: inChannel } = await query.graph({
          entity: "product_sales_channel",
          fields: ["product_id"],
          filters: { sales_channel_id: tenant.sales_channel_id },
        })
        const foreign = [
          ...new Set(
            (inChannel as { product_id: string }[])
              .map((row) => row.product_id)
              .filter((id) => !own.has(id))
          ),
        ]
        if (foreign.length) {
          await linkProductsToSalesChannelWorkflow(container).run({
            input: { id: tenant.sales_channel_id, remove: foreign },
            throwOnError: true,
          })
          counters.detached = foreign.length
        }
      }
    }

    return await finish(counters.failed > 0 ? "partial" : "success")
  } catch (error) {
    const message =
      error instanceof OnecRequestError || error instanceof OnecSyncError
        ? error.message
        : errorMessage(error)
    logger.error(`[onec] tenant ${input.tenant_id}: sync failed — ${message}`)
    return await finish("failed", message)
  }
}

// Запуск с экрана: прогон первой синхронизации — минуты (сотни товаров), а
// HTTP-запрос через туннель столько не живёт. Поэтому кнопка только запускает
// прогон, а экран следит за ним по журналу прогонов. Занятость и настройку
// проверяем ДО ответа: «уже идёт» продавец должен увидеть сразу.
export const startOnecSync = async (
  container: MedusaContainer,
  input: OnecSyncInput
): Promise<void> => {
  const service = onecService(container)
  assertRunnable(await service.getConnectionByTenant(input.tenant_id), input)
  if (await service.hasActiveRun(input.tenant_id)) {
    throw new OnecSyncError(
      "busy",
      "Загрузка каталога уже идёт — дождитесь её окончания"
    )
  }
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  void runOnecSync(container, input).catch((error) =>
    logger.error(`[onec] tenant ${input.tenant_id}: ${errorMessage(error)}`)
  )
}
