import { orderLabel } from "../../lib/order-label"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { EllipsisHorizontal, Star } from "@medusajs/icons"
import {
  Button,
  Container,
  DropdownMenu,
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
import { usePanelActor } from "../../hooks/use-panel-actor"
import { useReviews } from "../../hooks/use-reviews"
import { formatDate } from "../../lib/date"
import {
  AdminReviewListResponse,
  AdminReviewRow,
  ReviewStatus,
  ReviewTarget,
  reviewTargetMeta,
} from "../../lib/reviews"
import { routeLabel } from "../../lib/route-label"
import { sdk } from "../../lib/sdk"
import "../../styles/orders.css"
import { DataTableListError } from "../../components/data-table-list-error"

const PAGE_SIZE = 20

// Чипы видимости и объекта оценки: label — i18n-ключи, value — параметр роута
// (undefined — без фильтра).
const STATUS_CHIPS: { key: string; label: string; value?: ReviewStatus }[] = [
  { key: "all", label: "reviews.chip.all" },
  { key: "published", label: "reviews.list.chipPublished", value: "published" },
  { key: "hidden", label: "reviews.list.chipHidden", value: "hidden" },
]

const TARGET_CHIPS: { key: string; label: string; value?: ReviewTarget }[] = [
  { key: "any", label: "reviews.list.chipAnyTarget" },
  { key: "supplier", label: "reviews.target.supplier", value: "supplier" },
  { key: "delivery", label: "reviews.target.delivery", value: "delivery" },
]

const columnHelper = createDataTableColumnHelper<AdminReviewRow>()

// Раздел «Отзывы» панели продавца (T4.11, блокер 4 Ф-прогона 2026-08-18: раздела
// отзывов и действий с ними не было вовсе — отзыв можно было увидеть только
// внизу карточки конкретного заказа). Список с фильтрами по видимости и объекту
// оценки, поиск, скрытие/публикация из «…»-меню строки; в шапке — рейтинги
// поставщика и доставки (оцениваются раздельно, ТЗ).
//
// Идиома — экран «Заказы»/«Претензии»: строку целиком собирает
// GET /admin/reviews, экран ничего не пересчитывает.
const ReviewsPage = () => {
  const { t } = useTranslation()
  const { moderateReview } = useReviews()
  // Модерация (скрыть/опубликовать) — у площадки: компания отзывы о себе не
  // прячет. Продавец и сборщик компании видят отзывы только на чтение.
  const actor = usePanelActor()
  const canModerate = actor === "staff"

  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })
  const [search, setSearch] = useState("")
  const [statusKey, setStatusKey] = useState("all")
  const [targetKey, setTargetKey] = useState("any")

  const statusChip =
    STATUS_CHIPS.find((entry) => entry.key === statusKey) ?? STATUS_CHIPS[0]
  const targetChip =
    TARGET_CHIPS.find((entry) => entry.key === targetKey) ?? TARGET_CHIPS[0]
  const q = search.trim()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      "review-list",
      pagination.pageIndex,
      pagination.pageSize,
      statusChip.key,
      targetChip.key,
      q,
    ],
    queryFn: () =>
      sdk.client.fetch<AdminReviewListResponse>("/admin/reviews", {
        query: {
          limit: pagination.pageSize,
          offset: pagination.pageIndex * pagination.pageSize,
          ...(statusChip.value ? { status: statusChip.value } : {}),
          ...(targetChip.value ? { target: targetChip.value } : {}),
          ...(q ? { q } : {}),
        },
      }),
    placeholderData: keepPreviousData,
  })

  // Список под фильтром пуст ≠ отзывов нет вовсе.
  const filtered =
    q !== "" || statusChip.key !== "all" || targetChip.key !== "any"

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
      size: 190,
      header: t("orderQueue.colCustomer"),
      cell: ({ row }) => (
        <span className="truncate">
          {row.original.order?.customer_name ?? "—"}
        </span>
      ),
    }),
    columnHelper.accessor("target", {
      size: 130,
      header: t("reviews.list.colTarget"),
      cell: ({ getValue }) => t(reviewTargetMeta(getValue()).label),
    }),
    columnHelper.accessor("rating", {
      size: 90,
      header: t("reviews.list.colRating"),
      cell: ({ getValue }) => (
        <span className="sm-cell-strong">
          {t("reviews.list.rating", { rating: getValue() })}
        </span>
      ),
    }),
    columnHelper.accessor("comment", {
      size: 300,
      header: t("reviews.list.colComment"),
      cell: ({ getValue }) => (
        <span className="truncate" title={getValue() ?? undefined}>
          {getValue() ?? "—"}
        </span>
      ),
    }),
    columnHelper.accessor("created_at", {
      size: 120,
      header: t("reviews.disputes.colOpened"),
      cell: ({ getValue }) => {
        const value = getValue()
        return value ? formatDate(value) : "—"
      },
    }),
    columnHelper.accessor("status", {
      size: 120,
      header: t("common.status"),
      cell: ({ getValue }) => (
        <span className="flex items-center gap-x-2">
          <span
            className={`size-2 shrink-0 rounded-full ${
              getValue() === "hidden"
                ? "bg-ui-tag-neutral-icon"
                : "bg-ui-tag-green-icon"
            }`}
          />
          <span>
            {t(
              getValue() === "hidden"
                ? "reviews.list.statusHidden"
                : "reviews.list.statusPublished"
            )}
          </span>
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.id, {
      id: "row_action",
      size: 60,
      header: "",
      cell: ({ row }) => {
        if (!canModerate) {
          return null
        }
        const review = row.original
        const next: ReviewStatus =
          review.status === "hidden" ? "published" : "hidden"
        return (
          <DropdownMenu>
            <DropdownMenu.Trigger asChild>
              <Button
                size="small"
                variant="transparent"
                // Меню живёт в кликабельной строке — клик по нему не должен
                // открывать ничего ещё.
                onClick={(event) => event.stopPropagation()}
              >
                <EllipsisHorizontal />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                onClick={(event) => {
                  event.stopPropagation()
                  moderateReview.mutate({ id: review.id, status: next })
                }}
              >
                {t(
                  next === "hidden"
                    ? "reviews.widget.hide"
                    : "reviews.widget.publish"
                )}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu>
        )
      },
    }),
  ]

  const table = useDataTable({
    columns,
    data: data?.reviews ?? [],
    rowCount: data?.count ?? 0,
    isLoading,
    getRowId: (row) => row.id,
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

  // Средние оценки поставщика и доставки — по опубликованным отзывам (скрытые в
  // рейтинг не идут, правило модуля).
  const summaryLine = (data?.summaries ?? [])
    .map((summary) =>
      t("reviews.list.summaryPart", {
        target: t(reviewTargetMeta(summary.target).label),
        average: summary.average,
        count: summary.count,
      })
    )
    .join(" · ")

  return (
    <Container className="sm-orders divide-y p-0">
      <DataTable instance={table}>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-4">
          <div className="flex flex-col gap-y-1">
            <Heading level="h1">{t("reviews.list.title")}</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {summaryLine || t("reviews.list.noSummary")}
            </Text>
          </div>
          <DataTable.Search
            placeholder={t("reviews.list.searchPlaceholder")}
          />
        </div>
        <div className="sm-chips px-6 py-3">
          {STATUS_CHIPS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              // Метка чипа для скриншотера гейта U (см. экран «Претензии»).
              data-sm-chip={entry.key}
              aria-pressed={entry.key === statusChip.key}
              className={clx("sm-chip", {
                "sm-chip-active": entry.key === statusChip.key,
              })}
              onClick={() => {
                setStatusKey(entry.key)
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
            >
              {t(entry.label)}
              {data && (
                <span className="sm-chip-count">
                  {entry.value
                    ? data.counts[entry.value]
                    : data.counts.total}
                </span>
              )}
            </button>
          ))}
          {/* Вторая группа фильтров — объект оценки: поставщика и доставку
              оценивают раздельно, и смотрят их тоже раздельно. Отделяем зазором,
              иначе два активных чипа рядом читаются как один список. */}
          <span className="w-4" aria-hidden="true" />
          {TARGET_CHIPS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              data-sm-chip={"target-" + entry.key}
              aria-pressed={entry.key === targetChip.key}
              className={clx("sm-chip", {
                "sm-chip-active": entry.key === targetChip.key,
              })}
              onClick={() => {
                setTargetKey(entry.key)
                setPagination((prev) => ({ ...prev, pageIndex: 0 }))
              }}
            >
              {t(entry.label)}
            </button>
          ))}
        </div>
        {isError ? (
          <DataTableListError
            message={t("reviews.list.error")}
            onRetry={refetch}
          />
        ) : (
          <>
            {/* Чипы и поиск — наши, ядровый DataTable про них не знает: без
                подмены пустой чип «Скрытые» обещал «отзывов нет», хотя
                опубликованных три (гейт U по T4.11). */}
            <DataTable.Table
              emptyState={{
                empty: filtered
                  ? {
                      heading: t("reviews.list.filteredHeading"),
                      description: t("reviews.list.filteredDescription"),
                    }
                  : {
                      heading: t("reviews.list.emptyHeading"),
                      description: t("reviews.list.emptyDescription"),
                    },
                filtered: {
                  heading: t("reviews.list.filteredHeading"),
                  description: t("reviews.list.filteredDescription"),
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

export const config = defineRouteConfig({
  label: routeLabel({ en: "Reviews", ru: "Отзывы" }),
  icon: Star,
})

export default ReviewsPage
