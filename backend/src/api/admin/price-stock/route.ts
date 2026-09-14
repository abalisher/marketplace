import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { applyPriceStockWorkflow } from "../../../workflows/apply-price-stock"
import {
  PRICE_STOCK_SCAN_CAP,
  loadLocationNames,
  loadPriceStockProducts,
  loadPriceStockSlice,
  resolveActorName,
} from "./load"
import {
  PriceStockIssue,
  PriceStockRow,
  ResolvedChange,
  buildPriceStockRows,
  isNoopChange,
  resolveChange,
  trimUnchanged,
  withLocationNames,
} from "./rows"
import {
  AdminApplyPriceStockType,
  AdminGetPriceStockParamsType,
} from "./validators"

// GET /admin/price-stock — срез экрана «Цены и остатки» (T10.14): цена и
// остаток одной таблицей, без ядровой цепочки «вариант → price set → цена» и
// «inventory item → level → остаток» на экране.
//
// Почему выборка целиком, а страница в памяти: строка экрана — ВАРИАНТ, а
// пагинация ядра идёт по товарам (у товара вариантов от одного до нескольких), и
// «мало / нет в наличии» считается от свободного остатка — суммы по складам
// минус резервы, которую ядро фильтром не отдаёт. Каталог одного магазина
// заведомо меньше потолка; если позиций больше, экран честно говорит об этом.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { q, category, stock, status, location_id, limit, offset } =
    req.validatedQuery as AdminGetPriceStockParamsType

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Склады магазина отдаём вместе со срезом: экран рисует выбор склада без
  // второго запроса, а у одного склада выбора и не показывает.
  const {
    rows: filtered,
    counts,
    categoryCounts,
    locationNames,
    scope,
    threshold,
  } = await loadPriceStockSlice(query, {
    q,
    category,
    status,
    stock,
    location_id,
  })
  const page = filtered.slice(offset, offset + limit)

  res.json({
    price_rows: withLocationNames(page, locationNames),
    counts,
    // Счётчики чипов категорий: четвёрка ассортимента + мешок «вне
    // ассортимента». Экран рисует чип с числом и не спрашивает категории
    // отдельным запросом.
    category_counts: categoryCounts,
    count: filtered.length,
    offset,
    limit,
    low_threshold: threshold,
    scan_cap: PRICE_STOCK_SCAN_CAP,
    // Выбранный склад и все склады магазина: остаток в строках — по этому
    // складу (null — сумма по всем, и тогда правка остатка просит склад).
    location_id: scope,
    locations: [...locationNames.entries()].map(([id, name]) => ({ id, name })),
  })
}

// POST /admin/price-stock — партия правок цены и остатка. Правка прямо в строке
// — это партия из одной позиции, массовая правка выделенных — из нескольких:
// один путь записи, а не два.
//
// Либо применяется вся партия, либо ни одна её позиция: продавец, правящий
// двадцать строк разом, должен точно знать, что применилось. Поэтому сначала
// сверяем ВСЕ правки с текущим состоянием каталога и при первой негодной
// отвечаем 400 со списком проблемных позиций (по строке, с названием — иначе в
// массовой правке непонятно, какая помешала), и только потом пишем.
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { changes, source } = req.validatedBody as AdminApplyPriceStockType

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const products = await loadPriceStockProducts(query, {
    variant_ids: changes.map((change) => change.variant_id),
  })

  const found = new Map<
    string,
    { product: (typeof products)[number]; variant: NonNullable<(typeof products)[number]["variants"]>[number] }
  >()
  for (const product of products) {
    for (const variant of product.variants ?? []) {
      found.set(variant.id, { product, variant })
    }
  }

  // Склады магазина: правку с чужим складом нельзя пропускать в ядро — уровень
  // остатка завёлся бы на несуществующей площадке.
  const locationNames = await loadLocationNames(query)

  const issues: PriceStockIssue[] = []
  const lines: ResolvedChange[] = []
  const seen = new Set<string>()
  for (const change of changes) {
    // Позиция дважды в одной партии — отказ: обе правки считались бы от одного
    // снимка, и остаток сложился бы дважды.
    if (seen.has(change.variant_id)) {
      issues.push({
        variant_id: change.variant_id,
        code: "duplicate_change",
        title: found.get(change.variant_id)?.product.title ?? null,
      })
      continue
    }
    seen.add(change.variant_id)
    if (change.location_id && !locationNames.has(change.location_id)) {
      issues.push({
        variant_id: change.variant_id,
        code: "unknown_location",
        title: found.get(change.variant_id)?.product.title ?? null,
      })
      continue
    }
    const { resolved, issue } = resolveChange(change, found.get(change.variant_id))
    if (issue) {
      issues.push(issue)
      continue
    }
    if (resolved) {
      lines.push(resolved)
    }
  }

  if (issues.length) {
    res.status(400).json({
      message: "Часть правок применить нельзя — партия не записана",
      issues,
    })
    return
  }

  // Совпавшие с текущими числа вычёркиваем: экран присылает все выделенные
  // строки, а поменяли из них, как правило, одну — и в одном поле.
  const effective = lines.map(trimUnchanged).filter((line) => !isNoopChange(line))

  if (effective.length) {
    await applyPriceStockWorkflow(req.scope).run({
      input: {
        lines: effective,
        changed_by: req.auth_context?.actor_id ?? null,
        changed_by_name: await resolveActorName(req),
        source,
      },
      throwOnError: true,
    })
  }

  // Возвращаем свежие строки задетых позиций: экран обновляет таблицу на месте,
  // не перезапрашивая весь срез (и видит, что реально записалось).
  const updated = await loadPriceStockProducts(query, {
    variant_ids: lines.map((line) => line.variant_id),
  })
  const touched = new Set(lines.map((line) => line.variant_id))
  // Строки возвращаем в том же разрезе, в каком экран их показывает: вся партия
  // с одного склада — числа по этому складу, иначе сумма по всем.
  const scopes = new Set(
    lines
      .map((line) => line.location_id)
      .filter((id): id is string => !!id)
  )
  const rows: PriceStockRow[] = buildPriceStockRows(
    updated,
    scopes.size === 1 ? [...scopes][0] : null
  ).filter((row) => touched.has(row.variant_id))

  res.json({
    applied: effective.length,
    skipped: lines.length - effective.length,
    price_rows: withLocationNames(rows, locationNames),
  })
}
