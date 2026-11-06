import { orderLabel } from "../../lib/order-label"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  DataTablePaginationState,
  Heading,
  StatusBadge,
  Text,
  clx,
  useDataTable,
} from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { MouseEvent, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useDocuments } from "../../hooks/use-documents"
import { dataTableRow } from "../../lib/data-table-row"
import { formatDate } from "../../lib/date"
import {
  AdminDocumentsResponse,
  AdminRegistryDocument,
  DOCUMENT_CHIPS,
  DOCUMENT_TYPE_META,
  DocumentChip,
  documentChipCount,
} from "../../lib/documents"
import { formatAmount } from "../../lib/money"
import { routeLabel } from "../../lib/route-label"
import { sdk } from "../../lib/sdk"
import "../../styles/orders.css"
import { DataTableListError } from "../../components/data-table-list-error"

const PAGE_SIZE = 20

const columnHelper = createDataTableColumnHelper<AdminRegistryDocument>()

// Экран «Документы» — реестр выпущенных документов платформы (T4.9, блокер
// контроля из фокус-группы T4.6: «реестра документов нет», управляющий не может
// ответить, ушёл ли счёт клиенту). Идиомы экрана «Заказы» (T4.2b): плотная
// таблица, чипы-фильтры со счётчиками от бэкенда, поиск, пагинация.
// Показываются ТЕКУЩИЕ версии; история версий — на странице заказа.
const DocumentsPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [search, setSearch] = useState("")
  const [chipKey, setChipKey] = useState("all")
  const [unsentOnly, setUnsentOnly] = useState(false)
  const chip =
    DOCUMENT_CHIPS.find((entry) => entry.key === chipKey) ?? DOCUMENT_CHIPS[0]

  const q = search.trim()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "documents-registry",
      pagination.pageIndex,
      pagination.pageSize,
      chip.key,
      unsentOnly,
      q,
    ],
    queryFn: () =>
      sdk.client.fetch<AdminDocumentsResponse>("/admin/documents", {
        query: {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          ...(chip.types ? { type: chip.types.join(",") } : {}),
          ...(unsentOnly ? { sent: "unsent" } : {}),
          ...(q ? { q } : {}),
        },
      }),
    placeholderData: keepPreviousData,
  })

  const selectChip = (entry: DocumentChip) => {
    setChipKey(entry.key)
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }

  // Страховка пагинации: отметка отправки и фильтры могут усадить count под
  // текущей страницей — возвращаемся на первую (идиома экрана «Заказы»).
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
    columnHelper.accessor("number", {
      id: "number",
      size: 150,
      header: t("documents.registry.colNumber"),
      cell: ({ row }) => (
        <span className="sm-cell-strong">{row.original.number}</span>
      ),
    }),
    columnHelper.accessor("type", {
      id: "type",
      size: 110,
      header: t("documents.registry.colType"),
      cell: ({ getValue }) => {
        const meta = DOCUMENT_TYPE_META[getValue()]
        return <span>{meta ? t(meta.label) : getValue()}</span>
      },
    }),
    columnHelper.display({
      id: "order",
      size: 70,
      header: t("documents.registry.colOrder"),
      cell: ({ row }) => {
        const order = row.original.order
        const id =
          order && (order.display_id != null || order.order_number)
            ? orderLabel(order.order_number, order.display_id)
            : null
        return id == null ? "—" : t("orderQueue.orderNo", { id })
      },
    }),
    columnHelper.display({
      id: "buyer",
      size: 180,
      header: t("documents.registry.colBuyer"),
      cell: ({ row }) => {
        const order = row.original.order
        if (!order?.buyer) {
          return "—"
        }
        return (
          <span className="flex items-center gap-x-2">
            <span className="truncate">{order.buyer}</span>
            {order.is_company && (
              <Badge size="2xsmall" color="blue">
                {t("orderQueue.companyBadge")}
              </Badge>
            )}
          </span>
        )
      },
    }),
    columnHelper.accessor("total_money", {
      id: "total",
      size: 110,
      header: t("documents.registry.colTotal"),
      headerAlign: "right",
      cell: ({ row }) => (
        <span className="sm-cell-num sm-cell-strong">
          {formatAmount(row.original.total_money, row.original.currency_code)}
        </span>
      ),
    }),
    columnHelper.accessor("created_at", {
      id: "created_at",
      size: 120,
      header: t("documents.registry.colIssued"),
      cell: ({ getValue }) => <span>{formatDate(getValue())}</span>,
    }),
    columnHelper.display({
      id: "sent",
      size: 120,
      header: t("documents.registry.colSent"),
      cell: ({ row }) =>
        row.original.sent_to_buyer_at ? (
          <StatusBadge color="green">
            {t("documents.widget.sent")}
          </StatusBadge>
        ) : (
          <StatusBadge color="orange">
            {t("documents.registry.notSent")}
          </StatusBadge>
        ),
    }),
    // id НЕ "action" — этот id ядровый DataTable резервирует под «…»-меню
    // (грабли T4.2b, docs/modules/order.md п. 8).
    columnHelper.accessor((row) => row.id, {
      id: "row_action",
      size: 150,
      header: t("orderQueue.colAction"),
      headerAlign: "right",
      cell: ({ row }) => <RowAction document={row.original} />,
    }),
  ]

  const table = useDataTable({
    columns,
    data: data?.documents ?? [],
    rowCount: data?.count ?? 0,
    isLoading,
    getRowId: (row) => row.id,
    onRowClick: (_, row) => {
      const { order } = dataTableRow(row)
      if (order) {
        navigate(`/orders/${order.id}`)
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

  const requisitesMissing = data?.requisites_missing ?? []

  return (
    <Container className="sm-orders divide-y p-0">
      <DataTable instance={table}>
        <div className="flex items-center justify-between gap-x-4 px-6 py-4">
          <Heading level="h1">{t("documents.registry.title")}</Heading>
          <DataTable.Search
            placeholder={t("documents.registry.searchPlaceholder")}
          />
        </div>

        {/* Пока реквизиты неполные, документы не выпускаются вовсе — реестр
            должен сказать об этом и увести в настройки. */}
        {requisitesMissing.length > 0 && (
          <div className="flex flex-col items-start gap-y-2 px-6 py-3">
            <Text size="small" className="text-ui-fg-error">
              {t("documents.registry.requisitesMissing")}
            </Text>
            <Button
              size="small"
              variant="secondary"
              onClick={() => navigate("/settings/document-requisites")}
            >
              {t("documents.registry.fillRequisites")}
            </Button>
          </div>
        )}

        <div className="sm-chips px-6 py-3">
          {DOCUMENT_CHIPS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              aria-pressed={entry.key === chip.key}
              className={clx("sm-chip", {
                "sm-chip-active": entry.key === chip.key,
              })}
              onClick={() => selectChip(entry)}
            >
              {t(entry.label)}
              {data && (
                <span className="sm-chip-count">
                  {documentChipCount(data.counts, entry)}
                </span>
              )}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={unsentOnly}
            className={clx("sm-chip", { "sm-chip-active": unsentOnly })}
            onClick={() => {
              setUnsentOnly((prev) => !prev)
              setPagination((prev) => ({ ...prev, pageIndex: 0 }))
            }}
          >
            {t("documents.registry.chipUnsent")}
          </button>
        </div>

        {isError ? (
          <DataTableListError
            message={t("documents.registry.error")}
            onRetry={refetch}
          />
        ) : (
          <>
            <DataTable.Table
              emptyState={{
                empty: {
                  heading: t("documents.registry.emptyHeading"),
                  description: t("documents.registry.emptyDescription"),
                },
                filtered: {
                  heading: t("documents.registry.filteredHeading"),
                  description: t("documents.registry.filteredDescription"),
                },
              }}
            />
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
    </Container>
  )
}

// Действия строки: скачать PDF и отметить документ отправленным покупателю.
const RowAction = ({ document }: { document: AdminRegistryDocument }) => {
  const { t } = useTranslation()
  const { markSentMutation } = useDocuments()

  const stop = (event: MouseEvent) => event.stopPropagation()

  return (
    <span className="flex items-center justify-end gap-x-2" onClick={stop}>
      {!document.sent_to_buyer_at && (
        <Button
          size="small"
          variant="secondary"
          isLoading={markSentMutation.isPending}
          onClick={() => markSentMutation.mutate(document.id)}
        >
          {/* В строке — короткая подпись: полная («Отметить отправленным»)
              съедает колонку действий. */}
          {t("documents.registry.markShort")}
        </Button>
      )}
      {document.file_url ? (
        <a href={document.file_url} target="_blank" rel="noreferrer">
          <Button size="small" variant="transparent">
            PDF
          </Button>
        </a>
      ) : (
        <Text size="small" className="text-ui-fg-muted">
          {t("documents.widget.rendering")}
        </Text>
      )}
    </span>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Documents", ru: "Документы" }),
  icon: DocumentText,
})

export default DocumentsPage
