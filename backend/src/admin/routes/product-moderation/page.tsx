import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  ArrowUpCircleSolid,
  CheckCircle,
  CheckCircleSolid,
  EllipseMiniSolid,
  Photo,
  XCircleSolid,
  XMarkMini,
} from "@medusajs/icons"
import {
  Button,
  clx,
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTableAction,
  DataTablePaginationState,
  DataTableSortingState,
  Heading,
  Popover,
  Text,
  useDataTable,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import RejectProductCardPrompt from "../../components/reject-product-card-prompt"
import { useProductModeration } from "../../hooks/use-product-moderation"
import {
  AdminModerationProduct,
  AdminModerationProductsResponse,
  PRODUCT_STATUS_META,
  ProductModerationStatus,
  SEGMENT_LABELS,
} from "../../lib/catalog"
import { sdk } from "../../lib/sdk"

const PAGE_SIZE = 20

const STATUSES = Object.keys(PRODUCT_STATUS_META) as ProductModerationStatus[]

// Классы пунктов поповеров — дословно из внутреннего DataTableFilter ядра.
const MENU_ITEM_CLASSES =
  "bg-ui-bg-base hover:bg-ui-bg-base-hover focus-visible:bg-ui-bg-base-pressed text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 outline-none transition-colors"

const columnHelper = createDataTableColumnHelper<AdminModerationProduct>()

// Очередь модерации карточек товара. Данные — ядровый GET /admin/products с
// полями link'а *product_card; вид и поведение — копия стандартных списков
// ядра, как в routes/companies (чипы фильтров → «Add filter» → «Clear all»).
// По умолчанию показываются товары на модерации (чип Status = Proposed,
// сортировка по updated_at — очередь FIFO); клик по строке ведёт на ядровую
// страницу товара, где карточкой управляет widget.
const ProductModerationPage = () => {
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

  // Состояние единственного фильтра (Status): чип предустановлен на Proposed —
  // страница открывается сразу очередью модерации.
  const [filterActive, setFilterActive] = useState(true)
  const [chipOpen, setChipOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [statusFilter, setStatusFilter] =
    useState<ProductModerationStatus | null>("proposed")

  const setStatus = (value: ProductModerationStatus | null) => {
    setStatusFilter(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const addStatusFilter = () => {
    setAddOpen(false)
    setFilterActive(true)
    setChipOpen(true)
  }

  const handleChipOpenChange = (open: boolean) => {
    setChipOpen(open)
    // Как в ядре: чип, закрытый без выбранного значения, убирается.
    if (!open && !statusFilter) {
      setFilterActive(false)
    }
  }

  const removeStatusFilter = () => {
    setFilterActive(false)
    setChipOpen(false)
    if (statusFilter) {
      setStatus(null)
    }
  }

  const order = sorting
    ? `${sorting.desc ? "-" : ""}${sorting.id}`
    : "updated_at"

  const { data, isLoading } = useQuery({
    queryKey: [
      "catalog-moderation",
      "queue",
      pagination.pageIndex,
      pagination.pageSize,
      statusFilter,
      search,
      order,
    ],
    queryFn: () =>
      sdk.client.fetch<AdminModerationProductsResponse>("/admin/products", {
        query: {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          order,
          fields: "id,title,thumbnail,status,updated_at,*product_card",
          ...(statusFilter ? { "status[]": statusFilter } : {}),
          ...(search ? { q: search } : {}),
        },
      }),
  })

  const columns = [
    columnHelper.accessor("title", {
      header: "Product",
      enableSorting: true,
      sortLabel: "Product",
      sortAscLabel: "A-Z",
      sortDescLabel: "Z-A",
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
    columnHelper.accessor((row) => row.product_card?.segment ?? "", {
      id: "segment",
      header: "Segment",
      cell: ({ row }) => {
        const segment = row.original.product_card?.segment
        return segment ? SEGMENT_LABELS[segment] : "—"
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      // Точка + текст — как StatusCell в списках ядра (не StatusBadge).
      cell: ({ getValue }) => {
        const meta = PRODUCT_STATUS_META[getValue()]
        return (
          <div className="flex items-center gap-x-2">
            <div className={`size-2 rounded-full ${meta.dotClass}`} />
            <span>{meta.label}</span>
          </div>
        )
      },
    }),
    columnHelper.accessor("updated_at", {
      header: "Updated",
      enableSorting: true,
      sortLabel: "Updated",
      sortAscLabel: "Oldest first",
      sortDescLabel: "Newest first",
      cell: ({ getValue }) =>
        new Date(getValue()).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
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
            label: "Submit for moderation",
            icon: <ArrowUpCircleSolid />,
            onClick: () => submitMutation.mutate(product.id),
          })
        }
        if (product.status === "proposed") {
          actions.push({
            label: "Approve",
            icon: <CheckCircleSolid />,
            onClick: () => approveWithConfirm(product),
          })
          actions.push({
            label: "Reject",
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
    onRowClick: (_, product) => navigate(`/products/${product.id}`),
    pagination: { state: pagination, onPaginationChange: setPagination },
    sorting: { state: sorting, onSortingChange: setSorting },
    search: { state: search, onSearchChange: setSearch },
  })

  const statusLabel = statusFilter
    ? PRODUCT_STATUS_META[statusFilter].label
    : null

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h1">Product Moderation</Heading>
        </div>
        <div className="flex items-center justify-between gap-x-4 px-6 py-4">
          {/* Блок фильтров — разметка и флоу внутреннего DataTableFilter ядра:
              чипы, затем «Add filter», затем «Clear all». */}
          <div className="max-w-2/3 flex flex-wrap items-center gap-2">
            {filterActive && (
              <Popover open={chipOpen} onOpenChange={handleChipOpenChange}>
                <div className="bg-ui-bg-field transition-fg shadow-borders-base text-ui-fg-subtle flex cursor-default select-none items-stretch overflow-hidden rounded-md">
                  {!statusFilter && <Popover.Anchor />}
                  <div
                    className={clx(
                      "flex items-center justify-center whitespace-nowrap px-2 py-1",
                      { "border-r": !!statusFilter }
                    )}
                  >
                    <Text size="small" weight="plus" leading="compact">
                      Status
                    </Text>
                  </div>
                  {statusFilter && (
                    <div className="flex w-full items-center overflow-hidden">
                      <div className="border-r p-1 px-2">
                        <Text
                          size="small"
                          weight="plus"
                          leading="compact"
                          className="text-ui-fg-muted"
                        >
                          is
                        </Text>
                      </div>
                      <Popover.Trigger
                        asChild
                        className="hover:bg-ui-bg-field-hover data-[state=open]:bg-ui-bg-field-hover flex-1 cursor-pointer overflow-hidden border-r p-1 px-2"
                      >
                        <Text
                          size="small"
                          leading="compact"
                          weight="plus"
                          className="truncate text-nowrap"
                        >
                          {statusLabel}
                        </Text>
                      </Popover.Trigger>
                    </div>
                  )}
                  {statusFilter && (
                    <button
                      onClick={removeStatusFilter}
                      className="text-ui-fg-muted transition-fg hover:bg-ui-bg-subtle-hover active:bg-ui-bg-subtle-pressed active:text-ui-fg-base flex items-center justify-center p-1"
                    >
                      <XMarkMini />
                    </button>
                  )}
                </div>
                <Popover.Content
                  align="start"
                  sideOffset={8}
                  collisionPadding={8}
                  className="max-h-[200px] w-[300px] p-1"
                >
                  {STATUSES.map((value) => {
                    const isSelected = statusFilter === value
                    return (
                      <div
                        key={value}
                        role="menuitem"
                        className={clx(MENU_ITEM_CLASSES, "gap-x-2")}
                        onClick={() => setStatus(isSelected ? null : value)}
                      >
                        <div
                          className={clx(
                            "transition-fg flex h-5 w-5 items-center justify-center",
                            { "[&_svg]:invisible": !isSelected }
                          )}
                        >
                          <EllipseMiniSolid />
                        </div>
                        {PRODUCT_STATUS_META[value].label}
                      </div>
                    )
                  })}
                </Popover.Content>
              </Popover>
            )}
            {!filterActive && (
              <Popover open={addOpen} onOpenChange={setAddOpen}>
                <Popover.Trigger asChild>
                  <Button size="small" variant="secondary">
                    Add filter
                  </Button>
                </Popover.Trigger>
                <Popover.Content
                  align="start"
                  sideOffset={8}
                  collisionPadding={8}
                  className="max-h-[200px] w-[300px] overflow-auto p-1"
                >
                  <div
                    role="menuitem"
                    className={MENU_ITEM_CLASSES}
                    onClick={addStatusFilter}
                  >
                    Status
                  </div>
                </Popover.Content>
              </Popover>
            )}
            {filterActive && (
              <button
                type="button"
                onClick={removeStatusFilter}
                className="text-ui-fg-muted transition-fg txt-compact-small-plus hover:text-ui-fg-subtle focus-visible:shadow-borders-focus rounded-md px-2 py-1"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex items-center gap-x-2">
            <DataTable.Search placeholder="Search" />
            <DataTable.SortingMenu tooltip="Sort" />
          </div>
        </div>
        <DataTable.Table />
        <DataTable.Pagination />
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
  label: "Product Moderation",
  icon: CheckCircle,
})

export default ProductModerationPage
