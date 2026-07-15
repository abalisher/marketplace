import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  EllipseMiniSolid,
  ShoppingCart,
  XMarkMini,
} from "@medusajs/icons"
import {
  Button,
  clx,
  Container,
  createDataTableColumnHelper,
  DataTable,
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
import {
  AdminOrderLifecycleListItem,
  AdminOrderLifecyclesResponse,
  ORDER_LIFECYCLE_STATUS_META,
  ORDER_LIFECYCLE_STATUSES,
  OrderLifecycleStatus,
} from "../../lib/order"
import { sdk } from "../../lib/sdk"

const PAGE_SIZE = 20

// Классы пунктов поповеров — дословно из внутреннего DataTableFilter ядра.
const MENU_ITEM_CLASSES =
  "bg-ui-bg-base hover:bg-ui-bg-base-hover focus-visible:bg-ui-bg-base-pressed text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 outline-none transition-colors"

const columnHelper = createDataTableColumnHelper<AdminOrderLifecycleListItem>()

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

// Очередь заказов по бизнес-статусу ТЗ. Данные — GET /admin/order-lifecycles
// (наша сущность order_lifecycle + link-поля заказа). Вид и поведение — копия
// стандартных списков ядра, как в routes/companies (чип фильтра → «Add filter»
// → «Clear all»; сортировка FIFO по created_at). Клик по строке ведёт на
// ядровую страницу заказа, где статусом управляет widget. Поиска нет — эндпоинт
// очереди его не поддерживает (только фильтр статуса + сортировка + пагинация).
const OrderQueuePage = () => {
  const navigate = useNavigate()

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [sorting, setSorting] = useState<DataTableSortingState | null>(null)

  // Состояние единственного фильтра (Status): чип может существовать без
  // значения — сразу после добавления, с открытым поповером.
  const [filterActive, setFilterActive] = useState(false)
  const [chipOpen, setChipOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [statusFilter, setStatusFilter] =
    useState<OrderLifecycleStatus | null>(null)

  const setStatus = (value: OrderLifecycleStatus | null) => {
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

  // FIFO по created_at (старые сверху — очередь на обработку) по умолчанию.
  const order = sorting
    ? `${sorting.desc ? "-" : ""}${sorting.id}`
    : "created_at"

  const { data, isLoading } = useQuery({
    queryKey: [
      "order-lifecycle",
      "queue",
      pagination.pageIndex,
      pagination.pageSize,
      statusFilter,
      order,
    ],
    queryFn: () =>
      sdk.client.fetch<AdminOrderLifecyclesResponse>("/admin/order-lifecycles", {
        query: {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          order,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
      }),
  })

  const columns = [
    columnHelper.accessor("order", {
      header: "Order",
      cell: ({ getValue }) => {
        const order = getValue()
        return order ? `#${order.display_id}` : "—"
      },
    }),
    columnHelper.display({
      id: "customer",
      header: "Customer",
      cell: ({ row }) => row.original.order?.email ?? "—",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      // Точка + текст — как StatusCell в списках ядра (не StatusBadge).
      cell: ({ getValue }) => {
        const meta = ORDER_LIFECYCLE_STATUS_META[getValue()]
        return (
          <div className="flex items-center gap-x-2">
            <div className={`size-2 rounded-full ${meta.dotClass}`} />
            <span>{meta.label}</span>
          </div>
        )
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Created",
      enableSorting: true,
      sortLabel: "Created",
      sortAscLabel: "Oldest first",
      sortDescLabel: "Newest first",
      cell: ({ getValue }) => formatDate(getValue()),
    }),
    columnHelper.accessor("updated_at", {
      header: "Updated",
      enableSorting: true,
      sortLabel: "Updated",
      sortAscLabel: "Oldest first",
      sortDescLabel: "Newest first",
      cell: ({ getValue }) => formatDate(getValue()),
    }),
  ]

  const table = useDataTable({
    columns,
    data: data?.order_lifecycles ?? [],
    rowCount: data?.count ?? 0,
    isLoading,
    getRowId: (row) => row.id,
    onRowClick: (_, row) => {
      if (row.order) {
        navigate(`/orders/${row.order.id}`)
      }
    },
    pagination: { state: pagination, onPaginationChange: setPagination },
    sorting: { state: sorting, onSortingChange: setSorting },
  })

  const statusLabel = statusFilter
    ? ORDER_LIFECYCLE_STATUS_META[statusFilter].label
    : null

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h1">Order Queue</Heading>
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
                  className="max-h-[200px] w-[300px] overflow-auto p-1"
                >
                  {ORDER_LIFECYCLE_STATUSES.map((value) => {
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
                        {ORDER_LIFECYCLE_STATUS_META[value].label}
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
            <DataTable.SortingMenu tooltip="Sort" />
          </div>
        </div>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Order Queue",
  icon: ShoppingCart,
})

export default OrderQueuePage
