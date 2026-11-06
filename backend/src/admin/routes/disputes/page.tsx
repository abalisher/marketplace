import { orderLabel } from "../../lib/order-label"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ExclamationCircle } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  Heading,
  Text,
  clx,
  useDataTable,
} from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import DisputeCardDrawer from "../../components/dispute-card-drawer"
import { DataTableListError } from "../../components/data-table-list-error"
import DisputeRegisterDrawer from "../../components/dispute-register-drawer"
import { dataTableRow } from "../../lib/data-table-row"
import { formatAmount } from "../../lib/money"
import {
  AdminDisputeQueueResponse,
  AdminDisputeRow,
  DISPUTE_CLOSED,
  DISPUTE_QUEUE_CHIPS,
  DisputeQueueChip,
  disputeCategoryMeta,
  disputeOutcomeMeta,
  disputeQueueChipCount,
  disputeStatusMeta,
} from "../../lib/reviews"
import { routeLabel } from "../../lib/route-label"
import { waitingUnit } from "../../lib/waiting"
import { sdk } from "../../lib/sdk"
import "../../styles/orders.css"

const PAGE_SIZE = 20

const columnHelper = createDataTableColumnHelper<AdminDisputeRow>()

// Экран «Претензии» панели продавца (T4.11). Идиома экрана «Заказы» (T4.2a/1b):
// плотная таблица, чипы-фильтры со счётчиками, поиск, клик по строке открывает
// рабочее место претензии drawer'ом поверх очереди — фильтр и место в списке не
// теряются.
//
// Порядок — всегда FIFO по created_at (старые сверху): это очередь на разбор, а
// не журнал; они же первыми уходят в просрочку.
//
// Ф-прогон 2026-08-18 (Асель, 1/5) ловил здесь четыре блокера: строка несла
// только внутренний id заказа (по нему панель сама ничего не находила), суть
// жалобы была спрятана внизу карточки заказа, срок и возраст обращения не
// показывались вовсе, а завести претензию по звонку было негде. Строку целиком
// собирает GET /admin/disputes — экран ничего не пересчитывает.
const DisputesQueuePage = () => {
  const { t } = useTranslation()
  const [disputeId, setDisputeId] = useState<string | null>(null)
  const [registerOpen, setRegisterOpen] = useState(false)

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [search, setSearch] = useState("")
  const [chipKey, setChipKey] = useState("active")
  const chip =
    DISPUTE_QUEUE_CHIPS.find((entry) => entry.key === chipKey) ??
    DISPUTE_QUEUE_CHIPS[0]

  const q = search.trim()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "dispute-queue",
      pagination.pageIndex,
      pagination.pageSize,
      chip.key,
      q,
    ],
    queryFn: () =>
      sdk.client.fetch<AdminDisputeQueueResponse>("/admin/disputes", {
        query: {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          status: chip.statuses.join(","),
          ...(q ? { q } : {}),
        },
      }),
    // Прежняя страница остаётся на экране, пока едет новая: чипы и поиск не
    // мигают скелетом на каждый клик.
    placeholderData: keepPreviousData,
  })

  const selectChip = (entry: DisputeQueueChip) => {
    setChipKey(entry.key)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  // Страховка пагинации: count может усесться под текущей страницей без смены
  // фильтров (решённые претензии уходят из активных) — возвращаемся на первую.
  useEffect(() => {
    if (
      data &&
      pagination.pageIndex > 0 &&
      pagination.pageIndex * pagination.pageSize >= data.count
    ) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }))
    }
  }, [data, pagination.pageIndex, pagination.pageSize])

  const columns = [
    columnHelper.display({
      id: "order",
      size: 90,
      header: t("reviews.disputes.colOrder"),
      cell: ({ row }) => {
        const order = row.original.order
        const id =
          order && (order.display_id != null || order.order_number)
            ? orderLabel(order.order_number, order.display_id)
            : null
        return (
          <span className="sm-cell-strong">
            {id == null ? "—" : t("orderQueue.orderNo", { id })}
          </span>
        )
      },
    }),
    columnHelper.display({
      id: "customer",
      size: 170,
      header: t("orderQueue.colCustomer"),
      cell: ({ row }) => {
        const order = row.original.order
        if (!order?.customer_name) {
          return "—"
        }
        return (
          <span className="flex items-center gap-x-2">
            <span className="truncate">{order.customer_name}</span>
            {order.is_company && (
              <Badge size="2xsmall" color="blue">
                {t("orderQueue.companyBadge")}
              </Badge>
            )}
          </span>
        )
      },
    }),
    columnHelper.accessor("category", {
      size: 120,
      header: t("reviews.disputes.colCategory"),
      cell: ({ getValue }) => t(disputeCategoryMeta(getValue()).label),
    }),
    // Суть жалобы прямо в очереди: до T4.11 её можно было прочитать только
    // пролистав карточку заказа до дна.
    columnHelper.accessor("description", {
      size: 200,
      header: t("reviews.disputes.colComplaint"),
      cell: ({ getValue }) => (
        <span className="truncate" title={getValue()}>
          {getValue()}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.order?.total ?? null, {
      id: "total",
      size: 120,
      header: t("orderQueue.colTotal"),
      headerAlign: "right",
      cell: ({ row }) => {
        const order = row.original.order
        return (
          <span className="sm-cell-num sm-cell-strong">
            {order?.total == null
              ? "—"
              : formatAmount(order.total, order.currency_code)}
          </span>
        )
      },
    }),
    // Возраст обращения и просрочка: «что висит третий день» — первый вопрос
    // утром (МЕШАЕТ 8 Ф-прогона). У закрытых претензий счётчик молчит: ничего
    // они уже не ждут, а тикающие «408 ч» рядом со «Решён» врут оператору.
    columnHelper.accessor("age_hours", {
      size: 150,
      header: t("reviews.disputes.colAge"),
      cell: ({ row }) => {
        if (DISPUTE_CLOSED.includes(row.original.status)) {
          return "—"
        }
        const waiting = waitingUnit(row.original.age_hours)
        return (
          <span className="flex items-center gap-x-2">
            <span className="shrink-0">
              {waiting.unit === "days"
                ? t("reviews.disputes.ageDays", { count: waiting.value })
                : t("reviews.disputes.ageHours", { count: waiting.value })}
            </span>
            {/* shrink-0: без него длинная подпись «просрочено» сжималась и
                вылезала под колонку статуса. */}
            {row.original.overdue && (
              <Badge size="2xsmall" color="red" className="shrink-0">
                {t("reviews.card.overdue")}
              </Badge>
            )}
          </span>
        )
      },
    }),
    columnHelper.accessor("status", {
      size: 170,
      header: t("common.status"),
      // Точка + текст — идиома StatusCell стандартных списков ядра.
      cell: ({ getValue }) => {
        const meta = disputeStatusMeta(getValue())
        return (
          <span className="flex items-center gap-x-2">
            {/* shrink-0: во flex длинная подпись статуса сжимала точку до нуля
                («На рассмотрении» шёл без метки). */}
            <span className={`size-2 shrink-0 rounded-full ${meta.dotClass}`} />
            <span className="truncate">{t(meta.label)}</span>
          </span>
        )
      },
    }),
    // Последствие решения: по закрытым видно, что покупатель получил, без
    // открытия карточки.
    columnHelper.accessor("outcome", {
      size: 180,
      header: t("reviews.disputes.colOutcome"),
      cell: ({ getValue }) =>
        getValue() ? t(disputeOutcomeMeta(getValue()).label) : "—",
    }),
  ]

  const table = useDataTable({
    columns,
    data: data?.disputes ?? [],
    rowCount: data?.count ?? 0,
    isLoading,
    getRowId: (row) => row.id,
    // Распаковка строки — через dataTableRow: ядровый DataTable отдаёт в колбэк
    // обёртку TanStack, и прямое чтение полей РОНЯЛО этот экран (T4.11a).
    onRowClick: (_, row) => setDisputeId(dataTableRow(row).id),
    pagination: { state: pagination, onPaginationChange: setPagination },
    search: {
      state: search,
      onSearchChange: (value) => {
        setSearch(value)
        setPagination((prev) => ({ ...prev, pageIndex: 0 }))
      },
      debounce: 400,
    },
  })

  const overdue = data?.counts.overdue ?? 0
  // «Ничего не нашлось» вместо «претензий нет»: пустой список под чипом или
  // поиском ничего не говорит о том, пуста ли очередь целиком.
  const filtered = q !== "" || chip.key !== "all"

  return (
    <Container className="sm-orders divide-y p-0">
      <DataTable instance={table}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <Heading level="h1">{t("reviews.disputes.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {overdue > 0
                ? t("reviews.disputes.overdueHint", {
                    count: overdue,
                    hours: data?.sla_hours ?? 24,
                  })
                : t("reviews.disputes.slaHint", {
                    hours: data?.sla_hours ?? 24,
                  })}
            </Text>
          </div>
          <div className="flex items-center gap-x-2">
            <DataTable.Search
              placeholder={t("reviews.disputes.searchPlaceholder")}
            />
            <Button
              size="small"
              data-sm-action="register-claim"
              onClick={() => setRegisterOpen(true)}
            >
              {t("reviews.register.action")}
            </Button>
          </div>
        </div>
        <div className="sm-chips px-6 py-3">
          {DISPUTE_QUEUE_CHIPS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              // Метка чипа для скриншотера гейта U: выбор фильтра в кадре не
              // должен зависеть от языка подписи (идиома data-sm-section).
              data-sm-chip={entry.key}
              aria-pressed={entry.key === chip.key}
              className={clx("sm-chip", {
                "sm-chip-active": entry.key === chip.key,
              })}
              onClick={() => selectChip(entry)}
            >
              {t(entry.label)}
              {data && (
                <span className="sm-chip-count">
                  {disputeQueueChipCount(data.counts, entry)}
                </span>
              )}
            </button>
          ))}
        </div>
        {isError ? (
          <DataTableListError
            message={t("reviews.disputes.error")}
            onRetry={refetch}
          />
        ) : (
          <>
            {/* Фильтр у нас свой (чипы), и ядровый DataTable про него не
                знает: без этой подмены пустой чип «Отклонён» обещал «претензий
                нет», хотя в очереди их пять. */}
            <DataTable.Table
              emptyState={{
                empty: filtered
                  ? {
                      heading: t("reviews.disputes.filteredHeading"),
                      description: t("reviews.disputes.filteredDescription"),
                    }
                  : {
                      heading: t("reviews.disputes.emptyHeading"),
                      description: t("reviews.disputes.emptyDescription"),
                    },
                filtered: {
                  heading: t("reviews.disputes.filteredHeading"),
                  description: t("reviews.disputes.filteredDescription"),
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

      <DisputeCardDrawer
        disputeId={disputeId}
        onClose={() => setDisputeId(null)}
      />
      <DisputeRegisterDrawer
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />
    </Container>
  )
}

// «Претензии», не «Споры»/«Диспуты»: слово «диспут» в работе не используют
// (Асель, КОСМЕТИКА 11 Ф-прогона — в меню было одно слово, в заголовке другое).
export const config = defineRouteConfig({
  label: routeLabel({ en: "Claims", ru: "Претензии" }),
  icon: ExclamationCircle,
})

export default DisputesQueuePage
