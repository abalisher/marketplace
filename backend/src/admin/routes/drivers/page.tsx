import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CheckCircleSolid, Directions, XCircleSolid } from "@medusajs/icons"
import {
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTableAction,
  DataTablePaginationState,
  Heading,
  Popover,
  useDataTable,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import BlockDriverPrompt from "../../components/block-driver-prompt"
import { DataTableListError } from "../../components/data-table-list-error"
import DataTableFilterChip from "../../components/data-table-filter-chip"
import { useDriverModeration } from "../../hooks/use-driver-moderation"
import { dataTableRow } from "../../lib/data-table-row"
import { formatDate } from "../../lib/date"
import {
  AdminDriver,
  AdminDriversListResponse,
  DRIVER_STATUS_META,
  DriverStatus,
  driverVehicleLabel,
} from "../../lib/driver"
import { MENU_ITEM_CLASSES } from "../../lib/menu-item-classes"
import { formatPhone, phoneSearchTerm } from "../../lib/phone"
import { routeLabel } from "../../lib/route-label"
import { sdk } from "../../lib/sdk"

const PAGE_SIZE = 20

const STATUSES = Object.keys(DRIVER_STATUS_META) as DriverStatus[]

const columnHelper = createDataTableColumnHelper<AdminDriver>()

// Очередь заявок водителей-gig: водитель регистрируется сам, продавец решает,
// пускать ли его к чужому товару и чужим деньгам. Вид и поведение — копия
// стандартных списков ядра (эталон routes/companies): чип фильтра → «Добавить
// фильтр» → «Очистить всё», статус точкой в строке, действия строки в «...».
//
// Экран открывается сразу очередью на проверку (чип «Ожидает проверки»):
// допущенные и заблокированные — справочник, а работа продавца здесь — разбор
// новых заявок. Порядок FIFO задаёт сервер (кто подал раньше, тот выше),
// поэтому меню сортировки на экране нет: колонок для сортировки список не
// принимает.
const DriversPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { blockMutation, activateWithConfirm } = useDriverModeration()

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [search, setSearch] = useState("")
  const [blockTarget, setBlockTarget] = useState<AdminDriver | null>(null)

  // Состояние единственного фильтра (допуск); чип предустановлен на «Ожидает
  // проверки» — см. комментарий выше.
  const [filterActive, setFilterActive] = useState(true)
  const [justAdded, setJustAdded] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<DriverStatus | null>(
    "pending"
  )

  // Смена фильтра возвращает на первую страницу: иначе после сужения выборки
  // список открывается на странице, которой больше нет.
  const setStatus = (value: DriverStatus | null) => {
    setStatusFilter(value)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const addStatusFilter = () => {
    setAddOpen(false)
    setFilterActive(true)
    setJustAdded(true)
  }

  const removeStatusFilter = () => {
    setFilterActive(false)
    setJustAdded(false)
    setStatus(null)
  }

  // Номер в базе лежит каноном, а продавец набирает его как читает — строку
  // поиска приводим к канону (lib/phone.ts). Одиночный символ не отправляем
  // вовсе: сервер принимает запрос от двух знаков, и первое же нажатие клавиши
  // иначе давало бы ошибку вместо списка.
  const searchTerm = phoneSearchTerm(search)
  const query = searchTerm.length >= 2 ? searchTerm : ""

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "admin-drivers",
      "queue",
      pagination.pageIndex,
      pagination.pageSize,
      statusFilter,
      query,
    ],
    queryFn: () =>
      sdk.client.fetch<AdminDriversListResponse>("/admin/drivers", {
        query: {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          ...(statusFilter ? { status: statusFilter } : {}),
          ...(query ? { q: query } : {}),
        },
      }),
  })

  const columns = [
    columnHelper.accessor("full_name", {
      header: t("drivers.colDriver"),
      // Профиль водитель заполняет сам — пока не заполнил, узнаём его по номеру.
      cell: ({ getValue }) => getValue()?.trim() || "—",
    }),
    columnHelper.accessor("phone", {
      header: t("drivers.colPhone"),
      // Номер — человекочитаемым: продавец сверяет его с бумажкой и звонком,
      // а канон из одиннадцати слитных цифр глазом не читается.
      cell: ({ getValue }) => formatPhone(getValue()),
    }),
    columnHelper.accessor((row) => driverVehicleLabel(row), {
      id: "vehicle",
      header: t("drivers.colVehicle"),
      cell: ({ getValue }) => getValue() || "—",
    }),
    columnHelper.accessor("capacity_kg", {
      header: t("drivers.colCapacity"),
      cell: ({ getValue }) => {
        const value = getValue()
        return value == null ? "—" : t("drivers.capacityValue", { value })
      },
    }),
    columnHelper.accessor("status", {
      header: t("common.status"),
      // Точка + текст — как StatusCell в списках ядра (не StatusBadge).
      cell: ({ getValue }) => {
        const meta = DRIVER_STATUS_META[getValue()]
        return (
          <div className="flex items-center gap-x-2">
            <div className={`size-2 rounded-full ${meta.dotClass}`} />
            <span>{t(meta.label)}</span>
          </div>
        )
      },
    }),
    columnHelper.accessor("created_at", {
      header: t("drivers.colSubmitted"),
      cell: ({ getValue }) => formatDate(getValue()),
    }),
    columnHelper.action({
      actions: (ctx) => {
        const driver = ctx.row.original
        const actions: DataTableAction<AdminDriver>[] = []
        // Незаполненный профиль допустить нельзя (сервер откажет): в пуле
        // заказов появился бы водитель без имени и госномера. Действие не
        // показываем — почему, объясняет карточка водителя.
        if (driver.status !== "active" && driver.profile_complete) {
          actions.push({
            label: t("drivers.action.activate"),
            icon: <CheckCircleSolid />,
            onClick: () => activateWithConfirm(driver),
          })
        }
        if (driver.status !== "blocked") {
          actions.push({
            label: t("drivers.action.block"),
            icon: <XCircleSolid />,
            onClick: () => setBlockTarget(driver),
          })
        }
        return actions
      },
    }),
  ]

  const table = useDataTable({
    columns,
    data: data?.drivers ?? [],
    rowCount: data?.count ?? 0,
    isLoading,
    getRowId: (driver) => driver.id,
    onRowClick: (_, driver) => navigate(`/drivers/${dataTableRow(driver).id}`),
    pagination: { state: pagination, onPaginationChange: setPagination },
    // Поиск, как и чип, возвращает на первую страницу: искать со второй
    // страницы прежней выборки — верный способ ничего не найти.
    search: {
      state: search,
      onSearchChange: (value) => {
        setSearch(value)
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
      },
    },
  })

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h1">{t("drivers.title")}</Heading>
        </div>
        <div className="flex items-center justify-between gap-x-4 px-6 py-4">
          {/* Блок фильтров — разметка и флоу внутреннего DataTableFilter ядра:
              чипы, затем «Добавить фильтр», затем «Очистить всё». */}
          <div className="max-w-2/3 flex flex-wrap items-center gap-2">
            {filterActive && (
              <DataTableFilterChip
                label={t("common.status")}
                value={statusFilter}
                autoOpen={justAdded}
                options={STATUSES.map((value) => ({
                  value,
                  label: t(DRIVER_STATUS_META[value].label),
                }))}
                onChange={(value) => setStatus(value as DriverStatus | null)}
                onRemove={removeStatusFilter}
              />
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
          </div>
        </div>
        {isError ? (
          <DataTableListError
            message={t("drivers.error")}
            onRetry={refetch}
          />
        ) : (
          <>
            <DataTable.Table
              emptyState={{
                // Пусто с активным чипом — «ничего не найдено», совсем пусто —
                // «водителей нет»: DataTable различает только свой поиск, чип
                // допуска он не видит (идиома очереди заказов).
                empty: filterActive
                  ? {
                      heading: t("drivers.filteredHeading"),
                      description: t("drivers.filteredDescription"),
                    }
                  : {
                      heading: t("drivers.emptyHeading"),
                      description: t("drivers.emptyDescription"),
                    },
                filtered: {
                  heading: t("drivers.filteredHeading"),
                  description: t("drivers.filteredDescription"),
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

      <BlockDriverPrompt
        driver={blockTarget}
        onClose={() => setBlockTarget(null)}
        onSubmit={(id, reason) =>
          blockMutation.mutate(
            { id, reason },
            { onSuccess: () => setBlockTarget(null) }
          )
        }
        isPending={blockMutation.isPending}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Drivers", ru: "Водители" }),
  icon: Directions,
})

export default DriversPage
