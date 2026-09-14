import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  BuildingStorefront,
  CheckCircleSolid,
  EllipseMiniSolid,
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
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import FeatureDisabledNotice from "../../components/feature-disabled-notice"
import { DataTableListError } from "../../components/data-table-list-error"
import RejectCompanyPrompt from "../../components/reject-company-prompt"
import { useCompanyModeration } from "../../hooks/use-company-moderation"
import { useFeatureFlags } from "../../hooks/use-feature-flags"
import {
  AdminCompaniesListResponse,
  AdminCompany,
  COMPANY_STATUS_META,
  CompanyStatus,
} from "../../lib/company"
import { dataTableRow } from "../../lib/data-table-row"
import { formatDate } from "../../lib/date"
import { sdk } from "../../lib/sdk"
import { routeLabel } from "../../lib/route-label"

const PAGE_SIZE = 20

const STATUSES = Object.keys(COMPANY_STATUS_META) as CompanyStatus[]

// Классы пунктов поповеров — дословно из внутреннего DataTableFilter ядра.
const MENU_ITEM_CLASSES =
  "bg-ui-bg-base hover:bg-ui-bg-base-hover focus-visible:bg-ui-bg-base-pressed text-ui-fg-base txt-compact-small relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 outline-none transition-colors"

const columnHelper = createDataTableColumnHelper<AdminCompany>()

// Очередь модерации компаний. Вид и поведение — копия стандартных списков
// ядра (Products/Inventory), включая внутренний DataTableFilter дашборда:
// чипы фильтров → «Add filter» (скрывается, когда свободных фильтров нет) →
// «Clear all»; свежедобавленный чип открывается сразу, пустой — исчезает.
const CompaniesPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { rejectMutation, approveWithConfirm } = useCompanyModeration()
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [sorting, setSorting] = useState<DataTableSortingState | null>(null)
  const [search, setSearch] = useState("")
  const [rejectTarget, setRejectTarget] = useState<AdminCompany | null>(null)

  // Состояние единственного фильтра (Status): чип может существовать
  // без значения — сразу после добавления, с открытым поповером.
  const [filterActive, setFilterActive] = useState(false)
  const [chipOpen, setChipOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | null>(null)

  const setStatus = (value: CompanyStatus | null) => {
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
    : "created_at"

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "admin-companies",
      pagination.pageIndex,
      pagination.pageSize,
      statusFilter,
      search,
      order,
    ],
    queryFn: () =>
      sdk.client.fetch<AdminCompaniesListResponse>("/admin/companies", {
        query: {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          order,
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(search ? { q: search } : {}),
        },
      }),
  })

  const columns = [
    columnHelper.accessor("name", {
      header: t("companies.colName"),
      enableSorting: true,
      sortLabel: t("companies.colName"),
      sortAscLabel: t("common.sortAZAsc"),
      sortDescLabel: t("common.sortAZDesc"),
    }),
    columnHelper.accessor("bin", { header: t("companies.colBin") }),
    columnHelper.accessor("status", {
      header: t("common.status"),
      // Точка + текст — как StatusCell в списках ядра (не StatusBadge).
      cell: ({ getValue }) => {
        const meta = COMPANY_STATUS_META[getValue()]
        return (
          <div className="flex items-center gap-x-2">
            <div className={`size-2 rounded-full ${meta.dotClass}`} />
            <span>{t(meta.label)}</span>
          </div>
        )
      },
    }),
    columnHelper.accessor("created_at", {
      header: t("companies.colCreated"),
      enableSorting: true,
      sortLabel: t("companies.colCreated"),
      sortAscLabel: t("common.sortOldest"),
      sortDescLabel: t("common.sortNewest"),
      cell: ({ getValue }) => formatDate(getValue()),
    }),
    columnHelper.action({
      actions: (ctx) => {
        const company = ctx.row.original
        const actions: DataTableAction<AdminCompany>[] = []
        if (company.status !== "approved") {
          actions.push({
            label: t("companies.action.approve"),
            icon: <CheckCircleSolid />,
            onClick: () => approveWithConfirm(company),
          })
        }
        if (company.status !== "rejected") {
          actions.push({
            label: t("companies.action.reject"),
            icon: <XCircleSolid />,
            onClick: () => setRejectTarget(company),
          })
        }
        return actions
      },
    }),
  ]

  const table = useDataTable({
    columns,
    data: data?.companies ?? [],
    rowCount: data?.count ?? 0,
    isLoading,
    getRowId: (company) => company.id,
    onRowClick: (_, company) =>
      navigate(`/companies/${dataTableRow(company).id}`),
    pagination: { state: pagination, onPaginationChange: setPagination },
    sorting: { state: sorting, onSortingChange: setSorting },
    search: { state: search, onSearchChange: setSearch },
  })

  const statusLabel = statusFilter
    ? t(COMPANY_STATUS_META[statusFilter].label)
    : null

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h1">{t("companies.title")}</Heading>
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
                      {t("common.status")}
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
                          {t("common.filterIs")}
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
                        {t(COMPANY_STATUS_META[value].label)}
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
                    {t("common.addFilter")}
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
                    {t("common.status")}
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
            message={t("companies.error")}
            onRetry={refetch}
          />
        ) : (
          <>
            <DataTable.Table
              emptyState={{
                // Пусто с активным чипом — «ничего не найдено», совсем пусто —
                // «компаний нет»: DataTable различает только свой поиск, чип
                // статуса он не видит (идиома очереди заказов).
                empty: filterActive
                  ? {
                      heading: t("companies.filteredHeading"),
                      description: t("companies.filteredDescription"),
                    }
                  : {
                      heading: t("companies.emptyHeading"),
                      description: t("companies.emptyDescription"),
                    },
                filtered: {
                  heading: t("companies.filteredHeading"),
                  description: t("companies.filteredDescription"),
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

      <RejectCompanyPrompt
        company={rejectTarget}
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

// Юрлица заморожены на MVP (T10.9): пункт сайдбара убирает styles/shell.css, а
// сам адрес остаётся рабочим — открывший его по закладке видит объяснение.
// Обёртка, а не ранний return внутри страницы: так экран с его запросами и
// состоянием не монтируется вовсе, пока домен выключен.
const CompaniesRoute = () => {
  const { t } = useTranslation()
  const { data: featureFlags } = useFeatureFlags()

  if (!featureFlags.companies) {
    return (
      <FeatureDisabledNotice message={t("common.featureDisabled.companies")} />
    )
  }

  return <CompaniesPage />
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Companies", ru: "Компании" }),
  icon: BuildingStorefront,
})

export default CompaniesRoute
