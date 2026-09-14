import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArrowUpCircleSolid,
  CheckCircle,
  CheckCircleSolid,
  Photo,
  XCircleSolid,
} from "@medusajs/icons"
import {
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTableAction,
  DataTablePaginationState,
  DataTableSortingState,
  Heading,
  Popover,
  useDataTable,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import DataTableFilterChip from "../../components/data-table-filter-chip"
import { DataTableListError } from "../../components/data-table-list-error"
import RejectProductCardPrompt from "../../components/reject-product-card-prompt"
import { useProductModeration } from "../../hooks/use-product-moderation"
import {
  AdminModerationProduct,
  AdminModerationProductsResponse,
  AdminProductCategoriesResponse,
  PRODUCT_STATUS_META,
  ProductModerationStatus,
  SEGMENT_LABELS,
} from "../../lib/catalog"
import { dataTableRow } from "../../lib/data-table-row"
import { formatDate } from "../../lib/date"
import { MENU_ITEM_CLASSES } from "../../lib/menu-item-classes"
import { sdk } from "../../lib/sdk"
import { routeLabel } from "../../lib/route-label"

const PAGE_SIZE = 20

const STATUSES = Object.keys(PRODUCT_STATUS_META) as ProductModerationStatus[]

// Фильтры страницы. Порядок — порядок чипов и пунктов меню «Добавить фильтр».
type FilterKey = "status" | "category"
const FILTER_KEYS: FilterKey[] = ["status", "category"]

const columnHelper = createDataTableColumnHelper<AdminModerationProduct>()

// Очередь модерации карточек товара. Данные — ядровый GET /admin/products с
// полями link'а *product_card; вид и поведение — копия стандартных списков
// ядра, как в routes/companies (чипы фильтров → «Add filter» → «Clear all»).
// По умолчанию показываются товары на модерации (чип Status = Proposed,
// сортировка по updated_at — очередь FIFO); клик по строке ведёт на ядровую
// страницу товара, где карточкой управляет widget.
const ProductModerationPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { submitMutation, rejectMutation, approveWithConfirm } =
    useProductModeration()

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [sorting, setSorting] = useState<DataTableSortingState | null>(null)
  const [search, setSearch] = useState("")
  const [rejectTarget, setRejectTarget] =
    useState<AdminModerationProduct | null>(null)

  // Состояние фильтров: статус (чип предустановлен на Proposed — страница
  // открывается сразу очередью модерации) и категория каталога (T10.10).
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>(["status"])
  const [justAdded, setJustAdded] = useState<FilterKey | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [statusFilter, setStatusFilter] =
    useState<ProductModerationStatus | null>("proposed")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  // Любая смена фильтра возвращает на первую страницу: иначе после сужения
  // выборки список открывается на странице, которой больше нет.
  const setStatus = (value: ProductModerationStatus | null) => {
    setStatusFilter(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const setCategory = (value: string | null) => {
    setCategoryFilter(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const addFilter = (key: FilterKey) => {
    setAddOpen(false)
    setActiveFilters((prev) => (prev.includes(key) ? prev : [...prev, key]))
    setJustAdded(key)
  }

  const removeFilter = (key: FilterKey) => {
    setActiveFilters((prev) => prev.filter((k) => k !== key))
    setJustAdded((prev) => (prev === key ? null : prev))
    if (key === "status") {
      setStatus(null)
    } else {
      setCategory(null)
    }
  }

  const clearFilters = () => {
    setActiveFilters([])
    setJustAdded(null)
    setStatus(null)
    setCategory(null)
  }

  // Категории каталога — из ядра, а не из константы: владелец вправе их
  // переименовать, и фильтр обязан показывать то же имя, что и карточка товара.
  const { data: categoriesData } = useQuery({
    queryKey: ["catalog-moderation", "categories"],
    queryFn: () =>
      sdk.client.fetch<AdminProductCategoriesResponse>(
        "/admin/product-categories",
        {
          query: {
            limit: 50,
            fields: "id,name",
            order: "name",
            // Только действующие: категории вне четвёрки погашены
            // (apply-catalog-categories), и в фильтре им делать нечего.
            is_active: true,
          },
        }
      ),
  })
  const categoryOptions = (categoriesData?.product_categories ?? []).map(
    (c) => ({ value: c.id, label: c.name })
  )

  const order = sorting
    ? `${sorting.desc ? "-" : ""}${sorting.id}`
    : "updated_at"

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "catalog-moderation",
      "queue",
      pagination.pageIndex,
      pagination.pageSize,
      statusFilter,
      categoryFilter,
      search,
      order,
    ],
    queryFn: () =>
      sdk.client.fetch<AdminModerationProductsResponse>("/admin/products", {
        query: {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          order,
          fields:
            "id,title,thumbnail,status,updated_at,*product_card,categories.id,categories.name",
          ...(statusFilter ? { "status[]": statusFilter } : {}),
          ...(categoryFilter ? { "category_id[]": categoryFilter } : {}),
          ...(search ? { q: search } : {}),
        },
      }),
  })

  const columns = [
    columnHelper.accessor("title", {
      header: t("productModeration.colProduct"),
      enableSorting: true,
      sortLabel: t("productModeration.colProduct"),
      sortAscLabel: t("common.sortAZAsc"),
      sortDescLabel: t("common.sortAZDesc"),
      // Миниатюра + название — как в ядровом списке Products.
      cell: ({ row }) => (
        <div className="flex items-center gap-x-3">
          <div className="bg-ui-bg-component flex h-8 w-6 items-center justify-center overflow-hidden rounded-[4px]">
            {row.original.thumbnail ? (
              <img
                src={row.original.thumbnail}
                alt={row.original.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Photo className="text-ui-fg-subtle" />
            )}
          </div>
          <span className="truncate">{row.original.title}</span>
        </div>
      ),
    }),
    columnHelper.accessor((row) => row.categories?.[0]?.name ?? "", {
      id: "category",
      header: t("productModeration.colCategory"),
      // У товара ровно одна категория (T10.10); прочерк — товар ещё не разобран
      // по категориям, его не увидит ни подбор в чате, ни сборщик.
      cell: ({ row }) => row.original.categories?.[0]?.name ?? "—",
    }),
    columnHelper.accessor((row) => row.product_card?.segment ?? "", {
      id: "segment",
      header: t("productModeration.colSegment"),
      cell: ({ row }) => {
        const segment = row.original.product_card?.segment
        return segment ? t(SEGMENT_LABELS[segment]) : "—"
      },
    }),
    columnHelper.accessor("status", {
      header: t("common.status"),
      // Точка + текст — как StatusCell в списках ядра (не StatusBadge).
      cell: ({ getValue }) => {
        const meta = PRODUCT_STATUS_META[getValue()]
        return (
          <div className="flex items-center gap-x-2">
            <div className={`size-2 rounded-full ${meta.dotClass}`} />
            <span>{t(meta.label)}</span>
          </div>
        )
      },
    }),
    columnHelper.accessor("updated_at", {
      header: t("productModeration.colUpdated"),
      enableSorting: true,
      sortLabel: t("productModeration.colUpdated"),
      sortAscLabel: t("common.sortOldest"),
      sortDescLabel: t("common.sortNewest"),
      cell: ({ getValue }) => formatDate(getValue()),
    }),
    columnHelper.action({
      actions: (ctx) => {
        const product = ctx.row.original
        const actions: DataTableAction<AdminModerationProduct>[] = []
        if (
          product.product_card &&
          (product.status === "draft" || product.status === "rejected")
        ) {
          actions.push({
            label: t("productModeration.action.submit"),
            icon: <ArrowUpCircleSolid />,
            onClick: () => submitMutation.mutate(product.id),
          })
        }
        if (product.status === "proposed") {
          actions.push({
            label: t("productModeration.action.approve"),
            icon: <CheckCircleSolid />,
            onClick: () => approveWithConfirm(product),
          })
          actions.push({
            label: t("productModeration.action.reject"),
            icon: <XCircleSolid />,
            onClick: () => setRejectTarget(product),
          })
        }
        return actions
      },
    }),
  ]

  const table = useDataTable({
    columns,
    data: data?.products ?? [],
    rowCount: data?.count ?? 0,
    isLoading,
    getRowId: (product) => product.id,
    onRowClick: (_, product) =>
      navigate(`/products/${dataTableRow(product).id}`),
    pagination: { state: pagination, onPaginationChange: setPagination },
    sorting: { state: sorting, onSortingChange: setSorting },
    search: { state: search, onSearchChange: setSearch },
  })

  const inactiveFilters = FILTER_KEYS.filter((k) => !activeFilters.includes(k))
  const filterLabels: Record<FilterKey, string> = {
    status: t("common.status"),
    category: t("productModeration.colCategory"),
  }

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h1">{t("productModeration.title")}</Heading>
        </div>
        <div className="flex items-center justify-between gap-x-4 px-6 py-4">
          {/* Блок фильтров — разметка и флоу внутреннего DataTableFilter ядра:
              чипы, затем «Add filter», затем «Clear all». */}
          <div className="max-w-2/3 flex flex-wrap items-center gap-2">
            {activeFilters.includes("status") && (
              <DataTableFilterChip
                label={filterLabels.status}
                value={statusFilter}
                autoOpen={justAdded === "status"}
                options={STATUSES.map((value) => ({
                  value,
                  label: t(PRODUCT_STATUS_META[value].label),
                }))}
                onChange={(value) =>
                  setStatus(value as ProductModerationStatus | null)
                }
                onRemove={() => removeFilter("status")}
              />
            )}
            {activeFilters.includes("category") && (
              <DataTableFilterChip
                label={filterLabels.category}
                value={categoryFilter}
                autoOpen={justAdded === "category"}
                options={categoryOptions}
                onChange={setCategory}
                onRemove={() => removeFilter("category")}
              />
            )}
            {inactiveFilters.length > 0 && (
              <Popover open={addOpen} onOpenChange={setAddOpen}>
                <Popover.Trigger asChild>
                  <Button size="small" variant="secondary">
                    {t("common.addFilter")}
                  </Button>
                </Popover.Trigger>
                <Popover.Content
                  align="start"
                  sideOffset={8}
                  collisionPadding={8}
                  className="max-h-[200px] w-[300px] overflow-auto p-1"
                >
                  {inactiveFilters.map((key) => (
                    <div
                      key={key}
                      role="menuitem"
                      className={MENU_ITEM_CLASSES}
                      onClick={() => addFilter(key)}
                    >
                      {filterLabels[key]}
                    </div>
                  ))}
                </Popover.Content>
              </Popover>
            )}
            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-ui-fg-muted transition-fg txt-compact-small-plus hover:text-ui-fg-subtle focus-visible:shadow-borders-focus rounded-md px-2 py-1"
              >
                {t("common.clearAll")}
              </button>
            )}
          </div>
          <div className="flex items-center gap-x-2">
            <DataTable.Search placeholder={t("common.search")} />
            <DataTable.SortingMenu tooltip={t("common.sort")} />
          </div>
        </div>
        {isError ? (
          <DataTableListError
            message={t("productModeration.error")}
            onRetry={refetch}
          />
        ) : (
          <>
            <DataTable.Table
              emptyState={{
                // Пусто с активным чипом — «ничего не найдено», совсем пусто —
                // «карточек нет»: DataTable различает только свой поиск, чипы
                // статуса и категории он не видит (идиома очереди заказов).
                empty: activeFilters.length
                  ? {
                      heading: t("productModeration.filteredHeading"),
                      description: t("productModeration.filteredDescription"),
                    }
                  : {
                      heading: t("productModeration.emptyHeading"),
                      description: t("productModeration.emptyDescription"),
                    },
                filtered: {
                  heading: t("productModeration.filteredHeading"),
                  description: t("productModeration.filteredDescription"),
                },
              }}
            />
            {/* Подписи пагинации у компонента свои (не из i18n ядра) —
                переводим сами, иначе в русской панели «1 of 1 pages». */}
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
      </DataTable>

      <RejectProductCardPrompt
        product={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onSubmit={(id, reason) =>
          rejectMutation.mutate(
            { id, reason },
            { onSuccess: () => setRejectTarget(null) }
          )
        }
        isPending={rejectMutation.isPending}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Product Moderation", ru: "Модерация товаров" }),
  icon: CheckCircle,
})

export default ProductModerationPage
