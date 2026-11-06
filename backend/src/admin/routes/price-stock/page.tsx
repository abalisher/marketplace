import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArrowDownTray,
  ArrowUpRightOnBox,
  ArrowUpTray,
  Cash,
  Clock,
  PencilSquare,
} from "@medusajs/icons"
import {
  Button,
  Checkbox,
  clx,
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  Heading,
  Input,
  Select,
  Text,
  toast,
  Tooltip,
  useDataTable,
  usePrompt,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate, useSearchParams } from "react-router-dom"
import PriceStockBulkDrawer from "../../components/price-stock-bulk-drawer"
import { DataTableListError } from "../../components/data-table-list-error"
import PriceStockHistoryDrawer from "../../components/price-stock-history-drawer"
import PriceStockImportDrawer from "../../components/price-stock-import-drawer"
import { usePriceStockApply } from "../../hooks/use-price-stock"
import { usePriceStockExchange } from "../../hooks/use-price-stock-import"
import { PRODUCT_STATUS_META, ProductModerationStatus } from "../../lib/catalog"
import { formatQuantity, formatTenge, formatTengeExact } from "../../lib/money"
import {
  AdminPriceStockCategoriesResponse,
  AdminPriceStockRow,
  AdminPriceStockResponse,
  PRICE_STOCK_FILTER_LABELS,
  PRICE_STOCK_FILTERS,
  PRICE_STOCK_ISSUE_LABELS,
  PRICE_STOCK_LOCK_LABELS,
  PRICE_STOCK_MAX_CHANGES,
  PRICE_STOCK_OTHER_CATEGORY,
  PriceStockDrafts,
  PriceStockField,
  PriceStockFilter,
  buildPriceStockChanges,
  clearPriceStockDrafts,
  clearStockDrafts,
  countFractionalDrafts,
  countOffscreen,
  fieldLock,
  fieldText,
  fillPriceStockDrafts,
  isFieldChanged,
  isFieldFractional,
  offscreenTitles,
  priceStockRowTitle,
  sanitizeAmountInput,
  markupPercent,
} from "../../lib/price-stock"
import { PRICE_STOCK_FILE_ERROR_LABELS } from "../../lib/price-stock-import"
import { routeLabel } from "../../lib/route-label"
import { sdk } from "../../lib/sdk"
import "../../styles/orders.css"
import "../../styles/price-stock.css"

// Страница — 50 строк: «выделить всё на странице и поправить» проходит одной
// партией с запасом (потолок партии считается по импорту — T10.14c).
const PAGE_SIZE = 50

// «Все склады» в выборе сверху: у Select ядра значение — строка, пустую
// строку Radix под элементом не допускает.
const ALL_LOCATIONS = "all"

const columnHelper = createDataTableColumnHelper<AdminPriceStockRow>()

// Экран «Цены и остатки» (T10.14b) — рабочее место кладовщика: одна таблица,
// правка цены и остатка ПРЯМО В КЛЕТКЕ, массовая правка выделенных и журнал
// «кто, когда, было → стало». Ядровой цепочки Medusa («вариант → price set →
// цена», «inventory item → level → остаток») на экране нет: строка — покупаемая
// позиция, число — число.
//
// Набранное в клетках не уходит в каталог до нажатия «Применить»: партия
// применяется целиком либо не применяется вовсе (ресурс), и продавец, правящий
// двадцать строк, должен видеть их все перед записью. Массовая правка тоже
// пишет в черновик, а не в каталог — путь записи один.
const PriceStockPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const prompt = usePrompt()
  const { applyMutation, failure, clearFailure } = usePriceStockApply()
  const {
    exportSlice,
    exporting,
    previewMutation,
    preview,
    fileError,
    closePreview,
  } = usePriceStockExchange()

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  // Чип остатка может прийти из адреса: плитка дашборда «Низкие остатки» ведёт
  // на ?stock=low, и кладовщик попадает сразу в те строки, за которыми шёл
  // (по плитке он раньше уходил в ядровый «Склад» — Ф-прогон Данияра).
  // Читаем один раз, при входе: дальше чипами управляет экран.
  const [searchParams] = useSearchParams()
  const [stockFilter, setStockFilter] = useState<PriceStockFilter | null>(() => {
    const initial = searchParams.get("stock")
    return PRICE_STOCK_FILTERS.includes(initial as PriceStockFilter)
      ? (initial as PriceStockFilter)
      : null
  })
  const [locationId, setLocationId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<PriceStockDrafts>({})
  const [selected, setSelected] = useState<string[]>([])
  const [bulkOpen, setBulkOpen] = useState(false)
  const [historyVariantId, setHistoryVariantId] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  // Скрытый выбор файла: своя кнопка вместо ядрового вида «Обзор…» —
  // на экране она стоит рядом с «Выгрузить» и читается парой к ней.
  const fileInput = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  // Категории — из ядра, а не из константы: владелец вправе их переименовать,
  // и чип обязан показывать то же имя, что карточка товара. Фильтр ресурса
  // ходит по handle — стабильному ключу.
  const { data: categoriesData } = useQuery({
    queryKey: ["price-stock", "categories"],
    queryFn: () =>
      sdk.client.fetch<AdminPriceStockCategoriesResponse>(
        "/admin/product-categories",
        {
          // Без фильтра is_active: имя нужно и погашенной категории — её
          // позиции остаются на экране, и чип у них свой.
          query: { limit: 50, fields: "handle,name", order: "name" },
        }
      ),
  })
  const categories = categoriesData?.product_categories ?? []

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "price-stock",
      "slice",
      pagination.pageIndex,
      pagination.pageSize,
      search,
      category,
      stockFilter,
      locationId,
    ],
    queryFn: () =>
      sdk.client.fetch<AdminPriceStockResponse>("/admin/price-stock", {
        query: {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          ...(search ? { q: search } : {}),
          ...(category ? { category } : {}),
          ...(stockFilter ? { stock: stockFilter } : {}),
          ...(locationId ? { location_id: locationId } : {}),
        },
      }),
  })

  const rows = data?.price_rows ?? []
  const locations = data?.locations ?? []
  // Склад, в разрезе которого экран показывает остатки: ресурс сам берёт
  // единственный, поэтому выбор появляется только там, где складов больше одного.
  const scopeLocationId = data?.location_id ?? null
  const scopeLocationName =
    locations.find((location) => location.id === scopeLocationId)?.name ?? null

  // Строки, которые экран уже видел: правки живут по позициям, а не по
  // странице, и партия собирается по ним даже после перехода на другую
  // страницу (иначе набранное молча не применилось бы).
  const known = useRef(new Map<string, AdminPriceStockRow>())
  useEffect(() => {
    for (const row of data?.price_rows ?? []) {
      known.current.set(row.variant_id, row)
    }
  }, [data])

  // Страховка пагинации (идиома очереди заказов): count может усесться под
  // текущей страницей — offset упирается в пустоту.
  useEffect(() => {
    if (
      data &&
      pagination.pageIndex > 0 &&
      pagination.pageIndex * pagination.pageSize >= data.count
    ) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }
  }, [data, pagination.pageIndex, pagination.pageSize])

  // Свежий ответ пересобирает партию: набранное сверяется с текущими числами
  // каталога, и правка, которую кто-то уже внёс, из партии выпадает.
  const draftedRows = useMemo(
    () =>
      Object.keys(drafts)
        .map((id) => known.current.get(id))
        .filter((row): row is AdminPriceStockRow => !!row),
    [drafts, data]
  )
  const changes = useMemo(
    () => buildPriceStockChanges(draftedRows, drafts),
    [draftedRows, drafts]
  )

  // Выделенные строки — по всем страницам, которые экран видел: панель обещает
  // «Выделено: N», и массовая правка обязана дойти до тех же N позиций.
  const selectedRows = useMemo(
    () =>
      selected
        .map((id) => known.current.get(id))
        .filter((row): row is AdminPriceStockRow => !!row),
    [selected, data]
  )

  const failedIds = useMemo(
    () => new Set((failure?.issues ?? []).map((issue) => issue.variant_id)),
    [failure]
  )

  // Клетки с дробной частью: пока они есть, партия не пишется — иначе цена
  // «2 750,00» ушла бы в каталог как 275 000 ₸ (блокер Ф-прогона Данияра).
  const fractionalCount = useMemo(
    () => countFractionalDrafts(draftedRows, drafts),
    [draftedRows, drafts]
  )

  // Часть партии и часть выделения могут быть вне текущего среза: продавец
  // сменил поиск или страницу. Панель обязана это назвать — записывать вслепую
  // экран не даёт.
  const changesOffscreen = useMemo(
    () => countOffscreen(rows, changes.map((change) => change.variant_id)),
    [rows, changes]
  )
  const selectedOffscreenTitles = useMemo(
    () => offscreenTitles(rows, selectedRows, selected),
    [rows, selectedRows, selected]
  )

  const setField = (
    row: AdminPriceStockRow,
    field: PriceStockField,
    value: string
  ) => {
    const clean = sanitizeAmountInput(value)
    setDrafts((prev) => ({
      ...prev,
      [row.variant_id]: {
        ...prev[row.variant_id],
        [field]: clean,
        // Склад запоминаем вместе с правкой остатка: он же уйдёт в партию,
        // даже если разрез экрана к тому времени сменят.
        ...(field === "stock" ? { location_id: row.location_id ?? undefined } : {}),
      },
    }))
  }

  const apply = () => {
    // Дробную клетку экран не записывает и не округляет молча: сначала пусть
    // продавец увидит, где он набрал копейки (то же правило, что у импорта).
    if (!changes.length || applyMutation.isPending || fractionalCount > 0) {
      return
    }
    const ids = changes.map((change) => change.variant_id)
    applyMutation.mutate(
      { changes, source: "manual" },
      {
        onSuccess: () => {
          setDrafts((prev) => clearPriceStockDrafts(prev, ids))
          // Записали — выделение снимаем: следующая массовая правка не должна
          // унаследовать вчерашние галочки и уйти в строки, которых на экране
          // уже нет.
          setSelected([])
        },
      }
    )
  }

  // --- Обмен файлом (T10.14c) ---

  // Выгружаем ровно тот срез, что на экране: склад, поиск и чипы — иначе
  // «выгрузить» обещало бы одно, а давало другое.
  const downloadSlice = () =>
    exportSlice({
      q: search,
      category,
      stock: stockFilter,
      location_id: locationId ?? scopeLocationId,
    })

  const pickFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Сбрасываем выбор сразу: продавец правит тот же файл и выбирает его
    // снова, а браузер второй раз то же имя событием не считает.
    event.target.value = ""
    if (!file) {
      return
    }
    setFileName(file.name)
    clearFailure()
    // Склад разреза уходит вместе с файлом: остатки из файла уедут на него,
    // а если файл назвал свой склад — ресурс сверит их и не даст разъехаться.
    previewMutation.mutate({ file, locationId: scopeLocationId })
  }

  // Партию из файла пишет тот же путь, что и правку в клетке. Ответ закрывает
  // предпросмотр в обоих исходах: при отказе список позиций виден под
  // таблицей, а drawer его закрывал бы собой.
  const applyImport = () => {
    if (!preview?.changes.length || applyMutation.isPending) {
      return
    }
    applyMutation.mutate(
      { changes: preview.changes, source: "import" },
      { onSettled: () => closePreview() }
    )
  }

  const discard = () => {
    setDrafts({})
    clearFailure()
  }

  // Смена склада отменяет набранные остатки: число «380» набрано для склада,
  // который сейчас на экране, и уехать на другой оно не должно. Цены складом не
  // разрезаны — они остаются набранными.
  const changeLocation = async (value: string) => {
    const next = value === ALL_LOCATIONS ? null : value
    const hasStockDrafts = Object.values(drafts).some(
      (draft) => draft.stock !== undefined
    )
    if (hasStockDrafts) {
      const confirmed = await prompt({
        title: t("priceStock.locationSwitch.title"),
        description: t("priceStock.locationSwitch.description"),
        confirmText: t("priceStock.locationSwitch.confirm"),
        cancelText: t("common.cancel"),
      })
      if (!confirmed) {
        return
      }
      setDrafts((prev) => clearStockDrafts(prev))
    }
    clearFailure()
    setLocationId(next)
    setSelected([])
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  // Сменили срез — выделение снимаем. Набранные числа остаются (правки живут по
  // позициям), а вот галочки от прошлой задачи, пережившие поиск, приводили к
  // записи в строки, которых на экране нет.
  const selectFilter = (next: PriceStockFilter | null) => {
    setStockFilter(next)
    setSelected([])
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const selectCategory = (next: string | null) => {
    setCategory(next)
    setSelected([])
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const toggleRow = (variantId: string) =>
    setSelected((prev) =>
      prev.includes(variantId)
        ? prev.filter((id) => id !== variantId)
        : [...prev, variantId]
    )

  const pageIds = rows.map((row) => row.variant_id)
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.includes(id))
  const someSelected = pageIds.some((id) => selected.includes(id))

  const toggleAll = () =>
    setSelected((prev) =>
      allSelected
        ? prev.filter((id) => !pageIds.includes(id))
        : [...new Set([...prev, ...pageIds])]
    )

  const fillSelected = (values: { price?: string; stock?: string }) => {
    const result = fillPriceStockDrafts(selectedRows, drafts, selected, values)
    setDrafts(result.drafts)
    setBulkOpen(false)
    if (result.skipped) {
      // Часть выделенных строк это поле не принимает (цена по правилам,
      // остаток не ведётся) — молчать нельзя: продавец решил, что поправил все.
      toast.warning(t("priceStock.bulk.skipped", { n: result.skipped }))
    }
  }

  // Клетка с числом: поле ввода, если править можно, иначе текущее число с
  // причиной, почему оно тут не правится.
  const amountCell = (row: AdminPriceStockRow, field: PriceStockField) => {
    const lock = fieldLock(row, field)
    if (lock) {
      const labels = PRICE_STOCK_LOCK_LABELS[lock]
      return (
        <Tooltip content={t(labels.hint)}>
          <div className="sm-ps-lock">
            {/* Число всё равно показываем — с единицей: клетка заперта, но
                продавцу нужно видеть, что в каталоге стоит сейчас. */}
            <span className="sm-ps-nums">
              {field === "price"
                ? row.price == null
                  ? "—"
                  : formatTenge(row.price)
                : `${formatQuantity(row.stocked)} ${row.unit ?? t("priceStock.unitFallback")}`}
            </span>
            <span className="sm-ps-sub">{t(labels.short)}</span>
          </div>
        </Tooltip>
      )
    }
    const dirty = isFieldChanged(row, drafts, field)
    // Набрано с копейками: число в каталог не пойдёт, и клетка обязана сказать
    // это сразу — молча выбросить запятую нельзя (получалось ×100).
    const fractional = isFieldFractional(row, drafts, field)
    return (
      <div className="sm-ps-field">
        <Input
          size="small"
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={fractional || undefined}
          title={fractional ? t("priceStock.fractional.hint") : undefined}
          // Подпись поля — с названием позиции: в таблице из пятидесяти строк
          // «Цена» без товара ничего не сообщает читающему с экрана.
          aria-label={`${t(
            field === "price" ? "priceStock.colPrice" : "priceStock.colStock"
          )} — ${priceStockRowTitle(row)}`}
          className={clx("sm-ps-input", {
            "sm-ps-input-dirty": dirty,
            "sm-ps-input-failed":
              fractional || failedIds.has(row.variant_id),
          })}
          value={fieldText(row, drafts, field)}
          onChange={(event) => setField(row, field, event.target.value)}
          // Enter записывает набранное — на этом экране он заменяет
          // клавиатурные сокращения (руки продавца всё время в полях).
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              apply()
            }
          }}
        />
        <span className="sm-ps-unit">
          {field === "price" ? "₸" : row.unit ?? t("priceStock.unitFallback")}
        </span>
      </div>
    )
  }

  const columns = [
    columnHelper.display({
      id: "select",
      size: 48,
      header: () => (
        <Checkbox
          checked={allSelected ? true : someSelected ? "indeterminate" : false}
          onCheckedChange={toggleAll}
          aria-label={t("priceStock.selectAll")}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selected.includes(row.original.variant_id)}
          onCheckedChange={() => toggleRow(row.original.variant_id)}
          aria-label={priceStockRowTitle(row.original)}
        />
      ),
    }),
    columnHelper.display({
      id: "product",
      size: 480,
      header: t("priceStock.colProduct"),
      cell: ({ row }) => {
        const item = row.original
        const status = item.status as ProductModerationStatus | null
        const meta = status ? PRODUCT_STATUS_META[status] : undefined
        return (
          <div className="sm-ps-title">
            <span
              className="sm-ps-title-text"
              title={priceStockRowTitle(item)}
            >
              {priceStockRowTitle(item)}
            </span>
            <span className="sm-ps-sub">
              {[
                item.sku ? t("priceStock.sku", { sku: item.sku }) : null,
                // Статус приписываем только у неопубликованных: цену
                // назначают ДО публикации, и продавец должен видеть, что эта
                // позиция покупателю пока не видна.
                meta && status !== "published" ? t(meta.label) : null,
              ]
                .filter(Boolean)
                .join(" · ") || t("priceStock.noSku")}
            </span>
          </div>
        )
      },
    }),
    columnHelper.display({
      id: "brand",
      size: 150,
      header: t("priceStock.colBrand"),
      cell: ({ row }) => (
        <span className="truncate" title={row.original.brand ?? undefined}>
          {row.original.brand ?? "—"}
        </span>
      ),
    }),
    columnHelper.display({
      id: "category",
      size: 170,
      header: t("priceStock.colCategory"),
      cell: ({ row }) => (
        <span className="truncate">{row.original.category_name ?? "—"}</span>
      ),
    }),
    columnHelper.accessor((row) => row.price, {
      id: "price",
      size: 180,
      header: t("priceStock.colPrice"),
      headerAlign: "right",
      cell: ({ row }) => amountCell(row.original, "price"),
    }),
    columnHelper.accessor((row) => row.cost ?? null, {
      id: "cost",
      size: 150,
      header: t("priceStock.colCost"),
      headerAlign: "right",
      cell: ({ row }) => {
        const item = row.original
        if (item.cost == null) {
          return <span className="sm-ps-nums text-ui-fg-muted">—</span>
        }
        const markup = markupPercent(item)
        return (
          <div className="sm-ps-cell">
            <span className="sm-ps-nums">{formatTengeExact(item.cost)}</span>
            <span className="sm-ps-sub">
              {item.managed_by === "file"
                ? markup == null
                  ? t("priceStock.costSourceFile")
                  : t("priceStock.costMarkupFile", { n: markup })
                : markup == null
                  ? t("priceStock.costSource")
                  : t("priceStock.costMarkup", { n: markup })}
            </span>
          </div>
        )
      },
    }),
    columnHelper.accessor((row) => row.stocked, {
      id: "stock",
      size: 180,
      header: t("priceStock.colStock"),
      headerAlign: "right",
      cell: ({ row }) => amountCell(row.original, "stock"),
    }),
    columnHelper.accessor((row) => row.available, {
      id: "available",
      size: 150,
      header: t("priceStock.colAvailable"),
      headerAlign: "right",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="sm-ps-cell">
            <span className="sm-ps-nums sm-ps-strong">
              {formatQuantity(item.available)} {item.unit ?? t("priceStock.unitFallback")}
            </span>
            {item.reserved > 0 && (
              <span className="sm-ps-sub">
                {t("priceStock.reserved", { n: formatQuantity(item.reserved) })}
              </span>
            )}
            {/* Разрез склада: «на этом складе 400 из 660» — иначе цифра в
                клетке читается как весь остаток магазина. */}
            {item.reserved <= 0 && item.stocked_total !== item.stocked && (
              <span className="sm-ps-sub">
                {t("priceStock.totalStock", {
                  total: formatQuantity(item.stocked_total),
                })}
              </span>
            )}
          </div>
        )
      },
    }),
    columnHelper.action({
      actions: (ctx) => [
        {
          label: t("priceStock.action.history"),
          icon: <Clock />,
          onClick: () => {
            setHistoryVariantId(ctx.row.original.variant_id)
            setHistoryOpen(true)
          },
        },
        {
          label: t("priceStock.action.openProduct"),
          icon: <ArrowUpRightOnBox />,
          onClick: () =>
            navigate(`/products/${ctx.row.original.product_id}`),
        },
      ],
    }),
  ]

  const table = useDataTable({
    columns,
    data: rows,
    rowCount: data?.count ?? 0,
    isLoading,
    getRowId: (row) => row.variant_id,
    pagination: { state: pagination, onPaginationChange: setPagination },
    search: {
      state: search,
      onSearchChange: (value) => {
        setSearch(value)
        setSelected([])
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
      },
      debounce: 400,
    },
  })

  const counts = data?.counts
  // Счётчики чипов категорий считает ресурс по срезу поиска: у чипа своё
  // число, «все категории» — сумма, «вне ассортимента» — остаток четвёрки.
  const categoryCounts = data?.category_counts
  const otherCount = categoryCounts?.[PRICE_STOCK_OTHER_CATEGORY] ?? 0
  const allCategoriesCount = categoryCounts
    ? Object.values(categoryCounts).reduce((sum, value) => sum + value, 0)
    : 0
  // Чипы отделов рисуем по счётчикам ресурса, а не по списку категорий ядра:
  // так чип есть у КАЖДОГО набора строк, включая категорию, которую владелец
  // погасил, — иначе её позиции опять оказались бы в таблице без фильтра.
  // Имя берём из ядра (владелец вправе переименовать), порядок — ассортимента.
  const categoryNames = useMemo(
    () => new Map(categories.map((item) => [item.handle, item.name])),
    [categories]
  )
  const assortmentChips = useMemo(
    () =>
      Object.entries(categoryCounts ?? {})
        .filter(([handle]) => handle !== PRICE_STOCK_OTHER_CATEGORY)
        .map(([handle, count]) => ({
          handle,
          name: categoryNames.get(handle) ?? handle,
          count,
        })),
    [categoryCounts, categoryNames]
  )
  const filtersActive = !!category || !!stockFilter
  // Панель нужна и тогда, когда правок ноль, а набранное есть: клетка с
  // копейками правкой не считается, и без панели «Отменить» набранное осталось
  // бы висеть без объяснения.
  const barOpen =
    changes.length > 0 || selected.length > 0 || fractionalCount > 0
  const tooManyChanges = changes.length > PRICE_STOCK_MAX_CHANGES

  return (
    <Container className="sm-ps divide-y p-0">
      <DataTable instance={table}>
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <Heading level="h1">{t("priceStock.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {scopeLocationName
                ? t("priceStock.subtitleLocation", {
                    location: scopeLocationName,
                  })
                : t("priceStock.subtitleAllLocations")}
            </Text>
          </div>
          <div className="sm-ps-controls">
            {locations.length > 1 && (
              <Select
                value={locationId ?? scopeLocationId ?? ALL_LOCATIONS}
                onValueChange={changeLocation}
              >
                <Select.Trigger className="sm-ps-location">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value={ALL_LOCATIONS}>
                    {t("priceStock.allLocations")}
                  </Select.Item>
                  {locations.map((location) => (
                    <Select.Item key={location.id} value={location.id}>
                      {location.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            )}
            <Button
              size="small"
              variant="secondary"
              className="sm-ps-log"
              disabled={exporting}
              onClick={downloadSlice}
            >
              <ArrowDownTray />
              {t("priceStock.exchange.export")}
            </Button>
            <Button
              size="small"
              variant="secondary"
              className="sm-ps-log"
              disabled={previewMutation.isPending}
              onClick={() => fileInput.current?.click()}
            >
              <ArrowUpTray />
              {previewMutation.isPending
                ? t("priceStock.exchange.reading")
                : t("priceStock.exchange.import")}
            </Button>
            {/* Поле выбора файла скрыто: жмут кнопку рядом с «Выгрузить». */}
            <input
              ref={fileInput}
              type="file"
              accept=".csv,.txt,text/csv"
              style={{ display: "none" }}
              onChange={pickFile}
            />
            <Button
              size="small"
              variant="secondary"
              className="sm-ps-log"
              onClick={() => {
                setHistoryVariantId(null)
                setHistoryOpen(true)
              }}
            >
              <Clock />
              {t("priceStock.historyButton")}
            </Button>
            <DataTable.Search placeholder={t("priceStock.searchPlaceholder")} />
          </div>
        </div>

        <div className="sm-chips px-6 py-3">
          <button
            type="button"
            aria-pressed={category === null}
            className={clx("sm-chip", { "sm-chip-active": category === null })}
            onClick={() => selectCategory(null)}
          >
            {t("priceStock.allCategories")}
            {/* «Все категории» считает ВЕСЬ срез поиска, а не выбранную
                категорию: чип показывает, что будет, если по нему нажать. */}
            {categoryCounts && (
              <span className="sm-chip-count">{allCategoriesCount}</span>
            )}
          </button>
          {assortmentChips.map((item) => (
            <button
              key={item.handle}
              type="button"
              aria-pressed={category === item.handle}
              className={clx("sm-chip", {
                "sm-chip-active": category === item.handle,
              })}
              onClick={() => selectCategory(item.handle)}
            >
              {item.name}
              <span className="sm-chip-count">{item.count}</span>
            </button>
          ))}
          {/* Вне ассортимента: позиции с погашенной категорией (снятый с
              продажи общестрой) и без категории. Чип появляется, только когда
              такие строки в срезе есть, — иначе он лишний. До него их было
              видно в таблице, но нечем отфильтровать (Ф-прогон Данияра). */}
          {!!otherCount && (
            <button
              type="button"
              aria-pressed={category === PRICE_STOCK_OTHER_CATEGORY}
              className={clx("sm-chip", {
                "sm-chip-active": category === PRICE_STOCK_OTHER_CATEGORY,
              })}
              onClick={() => selectCategory(PRICE_STOCK_OTHER_CATEGORY)}
            >
              {t("priceStock.otherCategory")}
              <span className="sm-chip-count">{otherCount}</span>
            </button>
          )}
          <div className="sm-ps-chips-sep" />
          {PRICE_STOCK_FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={stockFilter === value}
              className={clx("sm-chip", {
                "sm-chip-active": stockFilter === value,
              })}
              onClick={() => selectFilter(stockFilter === value ? null : value)}
            >
              {t(PRICE_STOCK_FILTER_LABELS[value])}
              {counts && (
                <span className="sm-chip-count">
                  {value === "zero" ? counts.zero : counts.low}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Файл не приняли целиком: причина и что чинить — НАД таблицей.
            Тост тут не годится (продавец идёт править файл и должен видеть
            текст, пока правит), а под таблицей из полусотни строк сообщение
            остаётся за нижним краем — поймано на кадре гейта U. */}
        {fileError && (
          <div className="sm-ps-issues">
            <Text size="small" weight="plus">
              {t("priceStock.exchange.fileErrorTitle", {
                file: fileName ?? t("priceStock.exchange.file"),
              })}
            </Text>
            <div className="sm-ps-issue">
              <span className="sm-ps-issue-reason">
                {fileError.code
                  ? t(PRICE_STOCK_FILE_ERROR_LABELS[fileError.code])
                  : fileError.message}
              </span>
            </div>
          </div>
        )}

        {/* Копейки в клетке: партия не пишется, пока они есть. Сообщение —
            НАД таблицей, рядом с отказом файла: продавец правит числа и должен
            видеть причину, пока правит (тост растворился бы). */}
        {fractionalCount > 0 && (
          <div className="sm-ps-issues">
            <Text size="small" weight="plus">
              {t("priceStock.fractional.title", { n: fractionalCount })}
            </Text>
            <div className="sm-ps-issue">
              <span className="sm-ps-issue-reason">
                {t("priceStock.fractional.hint")}
              </span>
            </div>
          </div>
        )}

        {isError ? (
          <DataTableListError
            message={t("priceStock.error")}
            onRetry={refetch}
          />
        ) : (
          <>
            <DataTable.Table
              emptyState={{
                // Пусто с активным чипом — «ничего не найдено», совсем пусто —
                // «каталог пуст»: DataTable различает только свой поиск, чипы
                // категории и остатка он не видит (идиома очереди заказов).
                empty: filtersActive
                  ? {
                      heading: t("priceStock.filteredHeading"),
                      description: t("priceStock.filteredDescription"),
                    }
                  : {
                      heading: t("priceStock.emptyHeading"),
                      description: t("priceStock.emptyDescription"),
                    },
                filtered: {
                  heading: t("priceStock.filteredHeading"),
                  description: t("priceStock.filteredDescription"),
                },
              }}
            />
            {/* Подписи пагинации у компонента свои (не из i18n ядра) —
                переводим сами, иначе в русской панели «1 of 2 pages». */}
            <DataTable.Pagination
              translations={{
                of: t("common.pagination.of"),
                results: t("common.pagination.results"),
                pages: t("common.pagination.pages"),
                prev: t("common.pagination.prev"),
                next: t("common.pagination.next"),
              }}
            />
          </>
        )}

        {/* Отказ партии: ресурс не записал НИ ОДНУ правку и назвал позиции —
            показываем их списком под таблицей, а не растворяющимся тостом. */}
        {failure && failure.issues.length > 0 && (
          <div className="sm-ps-issues">
            <Text size="small" weight="plus">
              {t("priceStock.issuesTitle")}
            </Text>
            {failure.issues.map((issue) => (
              <div key={issue.variant_id} className="sm-ps-issue">
                <span>{issue.title ?? t("common.unknownValue")}</span>
                {" — "}
                <span className="sm-ps-issue-reason">
                  {t(PRICE_STOCK_ISSUE_LABELS[issue.code])}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Позиций больше, чем экран просматривает за раз: честно говорим, что
            срез неполный (ресурс отдаёт свой потолок). */}
        {counts && data && counts.total >= data.scan_cap && (
          <div className="px-6 py-3">
            <Text size="small" className="text-ui-fg-subtle">
              {t("priceStock.scanCap", { cap: data.scan_cap })}
            </Text>
          </div>
        )}
      </DataTable>

      {barOpen && (
        <div className="sm-ps-bar" role="status">
          {selected.length > 0 && (
            <>
              <span className="sm-ps-bar-value">
                {t("priceStock.bar.selected", { n: selected.length })}
                {/* Часть выделенных строк на экране не видна: их названия —
                    в панели массовой правки, здесь только счёт. */}
                {selectedOffscreenTitles.length > 0 && (
                  <span className="sm-ps-bar-note">
                    {t("priceStock.bar.offscreen", {
                      n: selectedOffscreenTitles.length,
                    })}
                  </span>
                )}
              </span>
              <button
                type="button"
                className="sm-ps-bar-btn"
                onClick={() => setBulkOpen(true)}
              >
                <PencilSquare />
                {t("priceStock.bar.editSelected")}
              </button>
              <button
                type="button"
                className="sm-ps-bar-btn"
                onClick={() => setSelected([])}
              >
                {t("priceStock.bar.clearSelection")}
              </button>
            </>
          )}
          {selected.length > 0 && (changes.length > 0 || fractionalCount > 0) && (
            <div className="sm-ps-bar-sep" />
          )}
          {(changes.length > 0 || fractionalCount > 0) && (
            <>
              <span className="sm-ps-bar-value">
                {tooManyChanges
                  ? t("priceStock.bar.tooMany", { max: PRICE_STOCK_MAX_CHANGES })
                  : fractionalCount > 0
                    ? t("priceStock.bar.fractional", { n: fractionalCount })
                    : t("priceStock.bar.changes", { n: changes.length })}
                {/* «Правок: 20, из них вне экрана: 2» — продавец должен знать,
                    что записывает не только то, что видит. */}
                {!tooManyChanges && changesOffscreen > 0 && (
                  <span className="sm-ps-bar-note">
                    {t("priceStock.bar.offscreen", { n: changesOffscreen })}
                  </span>
                )}
              </span>
              <button
                type="button"
                className="sm-ps-bar-btn"
                disabled={
                  applyMutation.isPending || tooManyChanges || fractionalCount > 0
                }
                onClick={apply}
              >
                {applyMutation.isPending
                  ? t("priceStock.bar.applying")
                  : t("priceStock.bar.apply")}
              </button>
              <button type="button" className="sm-ps-bar-btn" onClick={discard}>
                {t("priceStock.bar.discard")}
              </button>
            </>
          )}
        </div>
      )}

      <PriceStockBulkDrawer
        open={bulkOpen}
        selectedCount={selected.length}
        offscreenTitles={selectedOffscreenTitles}
        locationName={scopeLocationName}
        onClose={() => setBulkOpen(false)}
        onSubmit={fillSelected}
      />
      <PriceStockImportDrawer
        preview={preview}
        fileName={fileName}
        applying={applyMutation.isPending}
        onClose={closePreview}
        onApply={applyImport}
      />
      <PriceStockHistoryDrawer
        open={historyOpen}
        variantId={historyVariantId}
        onClose={() => setHistoryOpen(false)}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Prices & Stock", ru: "Цены и остатки" }),
  icon: Cash,
})

export default PriceStockPage
