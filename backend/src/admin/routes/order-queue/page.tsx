import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingBag } from "@medusajs/icons"
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
import { MouseEvent, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import OrderCardDrawer from "../../components/order-card-drawer"
import { DataTableListError } from "../../components/data-table-list-error"
import { useOrderLifecycle } from "../../hooks/use-order-lifecycle"
import { dataTableRow } from "../../lib/data-table-row"
import { formatDeliverySlotShort } from "../../lib/delivery-slot"
import { formatAmount } from "../../lib/money"
import {
  AdminOrderLifecycleListItem,
  AdminOrderLifecyclesResponse,
  ORDER_QUEUE_CHIPS,
  OrderQueueChip,
  OrderTransition,
  orderPaymentStateMeta,
  orderQueueChipCount,
  orderStatusMeta,
  orderTransitions,
} from "../../lib/order"
import { routeLabel } from "../../lib/route-label"
import { sdk } from "../../lib/sdk"
import { waitingUnit } from "../../lib/waiting"
import "../../styles/orders.css"

const PAGE_SIZE = 20

const columnHelper = createDataTableColumnHelper<AdminOrderLifecycleListItem>()

// Экран «Заказы» панели продавца по макету 1b: плотная таблица (строки 44 px),
// чипы-фильтры со счётчиками, поиск по номеру/покупателю, пагинация, действие
// перехода прямо в строке. Данные строки и счётчики целиком собирает
// GET /admin/order-lifecycles (T4.2a) — экран ничего не пересчитывает.
//
// Порядок — всегда FIFO по created_at (старые сверху): это очередь на
// обработку, а не журнал. Клик по строке открывает карточку заказа drawer'ом
// 560 px поверх очереди (T4.2c) — очередь остаётся на экране, фильтр и место в
// списке не теряются.
//
// T4.12 добавил в строку то, из-за чего управляющий не мог управлять: дату
// оформления, время в текущем статусе с меткой «вне срока» и ответственного.
// Сроки стадий и ответственного считает бэкенд (order-lifecycles/sla.ts и
// assignees.ts) — экран по-прежнему ничего не пересчитывает.
//
// Колонка «Доставка» показывает СЛОТ (дату и окно приезда), появившийся в
// домене с T5.6, а не адрес: адрес на любой разумной ширине обрезался до
// «Кабанбай ба…» и не отвечал ни на один вопрос управляющего, а слот отвечает
// на главный — что везём сегодня и в какое окно. Полный адрес по-прежнему
// читается в карточке заказа и на экране «Отгрузка», где он нужен для работы.
const OrdersPage = () => {
  const { t } = useTranslation()
  // Открытая карточка заказа (drawer 1c, T4.2c): очередь остаётся на экране —
  // оператор не теряет фильтр, поиск и место в списке.
  const [cardOrderId, setCardOrderId] = useState<string | null>(null)

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [search, setSearch] = useState("")
  const [chipKey, setChipKey] = useState("all")
  const chip =
    ORDER_QUEUE_CHIPS.find((entry) => entry.key === chipKey) ??
    ORDER_QUEUE_CHIPS[0]

  const q = search.trim()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "order-lifecycle",
      "queue",
      pagination.pageIndex,
      pagination.pageSize,
      chip.key,
      q,
    ],
    queryFn: () =>
      sdk.client.fetch<AdminOrderLifecyclesResponse>("/admin/order-lifecycles", {
        query: {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          // Новые сверху (правка владельца 2026-09-06): очередь читают не как
          // «что взять следующим», а как «что приехало» — и свежий заказ,
          // упавший на четвёртую страницу, оператор просто не видит.
          order: "-created_at",
          ...(chip.statuses ? { status: chip.statuses.join(",") } : {}),
          ...(q ? { q } : {}),
        },
      }),
    // Прежняя страница остаётся на экране, пока едет новая: чипы и поиск не
    // мигают скелетом на каждый клик.
    placeholderData: keepPreviousData,
  })

  const selectChip = (entry: OrderQueueChip) => {
    setChipKey(entry.key)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  // Страховка пагинации: count может усесться под текущей страницей без смены
  // фильтров (действия в строке уводят заказы из статуса) — offset упирается в
  // пустоту, возвращаемся на первую страницу.
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
      // Ширины колонок этого экрана считаются как «контент + 24 px»: свои
      // отступы ячеек — 12 px (orders.css), ядровые px-6 не оставили бы места
      // одиннадцати колонкам.
      id: "order",
      size: 76,
      header: t("orderQueue.colOrder"),
      cell: ({ row }) => {
        const id = row.original.order?.display_id
        return (
          <span className="sm-cell-strong">
            {id == null ? "—" : t("orderQueue.orderNo", { id })}
          </span>
        )
      },
    }),
    // Слот доставки: по нему управляющий планирует день и грузит машину —
    // заказы одного окна едут вместе. Прочерк — заказ оформлен до T5.6, слота
    // у него нет и не будет.
    //
    // Слот встал НА МЕСТО колонки «Оформлен» (дата оформления, T4.12), а не
    // рядом с ней: одиннадцать колонок уже занимали 1154 px из ~1196
    // доступных на 1440, и двенадцатая уводила «Действие» за край экрана —
    // очередь теряла кнопку перехода, то есть смысл экрана. Из двух дат в
    // очереди полезнее та, по которой планируют работу; «сколько заказ стоит»
    // отвечает соседняя колонка «В статусе» с меткой «вне срока» (ровно та
    // потребность, ради которой T4.12 добавлял дату), а точная дата
    // оформления читается в карточке заказа.
    columnHelper.accessor((row) => row.delivery_date ?? null, {
      id: "slot",
      size: 112,
      header: t("orderQueue.colSlot"),
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatDeliverySlotShort(
            row.original.delivery_date,
            row.original.delivery_window
          )}
        </span>
      ),
    }),
    columnHelper.display({
      id: "customer",
      size: 150,
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
    columnHelper.display({
      id: "items",
      size: 72,
      header: t("orderQueue.colItems"),
      cell: ({ row }) => {
        const order = row.original.order
        return order ? t("orderQueue.items", { count: order.item_count }) : "—"
      },
    }),
    // accessor, а не display: headerAlign есть только у accessor-колонок.
    columnHelper.accessor((row) => row.order?.total ?? null, {
      id: "total",
      size: 116,
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
    columnHelper.display({
      id: "payment",
      size: 92,
      header: t("orderQueue.colPayment"),
      cell: ({ row }) => {
        const meta = orderPaymentStateMeta(row.original.order?.payment_state)
        return <span className={meta.className}>{t(meta.label)}</span>
      },
    }),
    // Время в текущем статусе и метка «вне срока» — главный ответ на вопрос
    // «что стоит дольше нормы». Срок у каждой стадии свой (sla.ts), считает его
    // бэкенд: у «Нового» два часа, у «В доставке» — сутки.
    columnHelper.accessor("status_hours", {
      id: "waiting",
      size: 132,
      header: t("orderQueue.colWaiting"),
      cell: ({ row }) => {
        const waiting = waitingUnit(row.original.status_hours)
        return (
          <span className="flex items-center gap-x-2">
            <span className="shrink-0">
              {waiting.unit === "days"
                ? t("orderQueue.ageDays", { count: waiting.value })
                : t("orderQueue.ageHours", { count: waiting.value })}
            </span>
            {/* shrink-0: длинная подпись иначе сжимается и вылезает в колонку
                статуса (та же правка, что в очереди претензий). */}
            {row.original.overdue && (
              <Badge size="2xsmall" color="red" className="shrink-0">
                {t("orderQueue.overdue")}
              </Badge>
            )}
          </span>
        )
      },
    }),
    // Ответственный: на сборке — сборщики, взявшие задания, иначе сотрудник,
    // последним переведший статус. «Не взят» — честный ответ, а не пустая
    // ячейка: именно такие заказы и стоят.
    columnHelper.display({
      id: "assignee",
      size: 124,
      header: t("orderQueue.colAssignee"),
      cell: ({ row }) => {
        const assignee = row.original.assignee
        if (!assignee) {
          return <span className="sm-pay-none">{t("orderQueue.assigneeNone")}</span>
        }
        // Слово роли рядом с именем в колонку не влезало: «admin оператор»
        // обрезалось до «ad… оператор» — имя, то есть главное, исчезало
        // первым (гейт U). Роль осталась подсказкой курсора.
        return (
          <span
            className="truncate"
            title={`${assignee.name} · ${t(
              `orderQueue.assignee.${assignee.role}`
            )}`}
          >
            {assignee.name}
          </span>
        )
      },
    }),
    columnHelper.accessor("status", {
      size: 168,
      header: t("common.status"),
      // Точка + текст — идиома StatusCell стандартных списков ядра.
      cell: ({ getValue }) => {
        const meta = orderStatusMeta(getValue())
        return (
          <span className="flex items-center gap-x-2">
            {/* shrink-0: во flex длинная подпись («Частично собран») сжимала
                точку до нуля — та же правка, что в очереди претензий. */}
            <span className={`size-2 shrink-0 rounded-full ${meta.dotClass}`} />
            <span className="truncate">{t(meta.label)}</span>
          </span>
        )
      },
    }),
    // id НЕ "action": этот id ядровый DataTable резервирует под узкую колонку
    // «…»-меню и игнорирует заданную ширину.
    columnHelper.accessor((row) => row.id, {
      id: "row_action",
      size: 140,
      header: t("orderQueue.colAction"),
      headerAlign: "right",
      cell: ({ row }) => (
        <RowAction item={row.original} onOpenCard={setCardOrderId} />
      ),
    }),
  ]

  const table = useDataTable({
    columns,
    data: data?.order_lifecycles ?? [],
    rowCount: data?.count ?? 0,
    isLoading,
    getRowId: (row) => row.id,
    onRowClick: (_, row) => {
      const order = dataTableRow(row).order
      if (order) {
        setCardOrderId(order.id)
      }
    },
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

  // Пусто с активным фильтром/поиском — «ничего не найдено», совсем пусто —
  // «заказов нет» (DataTable сам различает только поиск, чипы он не видит).
  const emptyContent =
    chip.key !== "all"
      ? {
          heading: t("orderQueue.filteredHeading"),
          description: t("orderQueue.filteredDescription"),
        }
      : {
          heading: t("orderQueue.emptyHeading"),
          description: t("orderQueue.emptyDescription"),
        }

  return (
    <Container className="sm-orders divide-y p-0">
      <DataTable instance={table}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <Heading level="h1">{t("orderQueue.title")}</Heading>
            {/* Просрочка числом в шапке: уведомлений продавцу система не
                рассылает, и панель — единственное место, где он об этом узнаёт
                (идиома шапки очереди претензий, T4.11). */}
            <Text size="small" className="text-ui-fg-subtle">
              {overdue > 0
                ? t("orderQueue.overdueHint", { count: overdue })
                : t("orderQueue.onTimeHint")}
            </Text>
          </div>
          <DataTable.Search placeholder={t("orderQueue.searchPlaceholder")} />
        </div>
        <div className="sm-chips px-6 py-3">
          {ORDER_QUEUE_CHIPS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              // Метка чипа — для кадров гейта U: селектор не должен зависеть от
              // языка подписи (идиома экрана «Претензии»).
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
                  {orderQueueChipCount(data.counts, entry)}
                </span>
              )}
            </button>
          ))}
        </div>
        {isError ? (
          <DataTableListError
            message={t("orderQueue.error")}
            onRetry={refetch}
          />
        ) : (
          <>
            <DataTable.Table
              emptyState={{
                empty: emptyContent,
                filtered: {
                  heading: t("orderQueue.filteredHeading"),
                  description: t("orderQueue.filteredDescription"),
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

      <OrderCardDrawer
        orderId={cardOrderId}
        onClose={() => setCardOrderId(null)}
      />
    </Container>
  )
}

// Подписи действий-переходов, которые из строки не выполнить (нужны позиции,
// fulfillment или код получения) — кнопка открывает карточку заказа, где переход
// делает сама карточка. Ключи — orderQueue.action.*.
const OPEN_ACTION_LABELS: Partial<Record<OrderTransition["path"], string>> = {
  ship: "orderQueue.action.ship",
  deliver: "orderQueue.action.deliver",
}

// Действие в строке (макет 1b): первый неопасный переход текущего статуса.
// Простые переходы (подтвердить, начать сборку, закрыть) выполняются на месте;
// сложные открывают карточку заказа (до T4.2c уводили на ядровую страницу).
// Отмена в строку не выносится — она в карточке заказа (деструктивное действие
// требует контекста).
const RowAction = ({
  item,
  onOpenCard,
}: {
  item: AdminOrderLifecycleListItem
  onOpenCard: (orderId: string) => void
}) => {
  const { t } = useTranslation()
  const { transitionMutation } = useOrderLifecycle()

  const order = item.order
  const transition = orderTransitions(item.delivery_method, item.status).find(
    (entry) => !entry.danger
  )

  if (!order || !transition) {
    return <span className="sm-cell-num sm-pay-none">—</span>
  }

  const needsCard =
    transition.needsItems ||
    transition.needsFulfillment ||
    transition.needsCode ||
    transition.prompt

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Кнопка живёт в кликабельной строке — не даём клику открыть карточку
    // вторым путём.
    event.stopPropagation()
    if (needsCard) {
      onOpenCard(order.id)
      return
    }
    transitionMutation.mutate({ orderId: order.id, transition })
  }

  return (
    <span className="flex justify-end">
      <Button
        size="small"
        variant={needsCard ? "secondary" : "primary"}
        onClick={onClick}
        isLoading={transitionMutation.isPending}
      >
        {t(
          needsCard
            ? (OPEN_ACTION_LABELS[transition.path] ?? transition.label)
            : transition.label
        )}
      </Button>
    </span>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Orders", ru: "Заказы" }),
  icon: ShoppingBag,
})

export default OrdersPage
