import { defineRouteConfig } from "@medusajs/admin-sdk"
import { EllipseMiniSolid, ExclamationCircle, XMarkMini } from "@medusajs/icons"
import {
  Button,
  clx,
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  Heading,
  Popover,
  Text,
  useDataTable,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import DisputeTransitionDrawer from "../../components/dispute-transition-drawer"
import {
  AdminDispute,
  AdminDisputeQueueResponse,
  DISPUTE_CATEGORY_META,
  DISPUTE_STATUS_META,
  DISPUTE_STATUSES,
  DisputeStatus,
} from "../../lib/reviews"
import { sdk } from "../../lib/sdk"

const PAGE_SIZE = 20

const MENU_ITEM_CLASSES =
  "bg-ui-bg-base hover:bg-ui-bg-base-hover focus-visible:bg-ui-bg-base-pressed text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 outline-none transition-colors"

const columnHelper = createDataTableColumnHelper<AdminDispute>()

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—"

// Очередь диспутов оператора. Данные — GET /admin/disputes (дефолт — активные).
// Вид/флоу фильтра — копия внутреннего DataTableFilter ядра (как order-queue).
// Клик по строке открывает drawer ведения по стейт-машине (диспут не имеет
// ядровой страницы, в отличие от заказа).
const DisputesQueuePage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [selected, setSelected] = useState<AdminDispute | null>(null)

  const [filterActive, setFilterActive] = useState(false)
  const [chipOpen, setChipOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<DisputeStatus | null>(null)

  const setStatus = (value: DisputeStatus | null) => {
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

  const { data, isLoading } = useQuery({
    queryKey: [
      "dispute-queue",
      pagination.pageIndex,
      pagination.pageSize,
      statusFilter,
    ],
    queryFn: () =>
      sdk.client.fetch<AdminDisputeQueueResponse>("/admin/disputes", {
        query: {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          ...(statusFilter ? { status: statusFilter } : {}),
        },
      }),
  })

  const columns = [
    columnHelper.accessor("order_id", {
      header: "Order",
      cell: ({ getValue }) => getValue(),
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: ({ getValue }) => DISPUTE_CATEGORY_META[getValue()].label,
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => {
        const meta = DISPUTE_STATUS_META[getValue()]
        return (
          <div className="flex items-center gap-x-2">
            <div className={`size-2 rounded-full ${meta.dotClass}`} />
            <span>{meta.label}</span>
          </div>
        )
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Opened",
      cell: ({ getValue }) => formatDate(getValue()),
    }),
  ]

  const table = useDataTable({
    columns,
    data: data?.disputes ?? [],
    rowCount: data?.count ?? 0,
    isLoading,
    getRowId: (row) => row.id,
    onRowClick: (_, row) => setSelected(row),
    pagination: { state: pagination, onPaginationChange: setPagination },
  })

  const statusLabel = statusFilter
    ? DISPUTE_STATUS_META[statusFilter].label
    : null

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h1">Disputes</Heading>
        </div>
        <div className="flex items-center justify-between gap-x-4 px-6 py-4">
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
                  {DISPUTE_STATUSES.map((value) => {
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
                        {DISPUTE_STATUS_META[value].label}
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
        </div>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>

      <DisputeTransitionDrawer
        dispute={selected}
        onClose={() => setSelected(null)}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Disputes",
  icon: ExclamationCircle,
})

export default DisputesQueuePage
