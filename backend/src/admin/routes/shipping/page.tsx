import { defineRouteConfig } from "@medusajs/admin-sdk"
import { HandTruck } from "@medusajs/icons"
import { Button, Container, Heading, Text, clx } from "@medusajs/ui"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import OrderCardDrawer from "../../components/order-card-drawer"
import { DataTableListError } from "../../components/data-table-list-error"
import ShippingOrderRow from "../../components/shipping-order-row"
import { useOrderLifecycle } from "../../hooks/use-order-lifecycle"
import { usePanelActor } from "../../hooks/use-panel-actor"
import { orderTransitions, transitionsForActor } from "../../lib/order"
import { routeLabel } from "../../lib/route-label"
import { sdk } from "../../lib/sdk"
import {
  AdminShippingQueueResponse,
  SHIPPING_QUEUE_CHIPS,
  ShippingChip,
  ShippingQueueOrder,
  shippingChipCount,
} from "../../lib/shipping"
import "../../styles/orders.css"
import "../../styles/shipping.css"

const PAGE_SIZE = 20

// Экран «Отгрузка» (T10.13, решение владельца 2026-08-25 п. 4: «отвечающий за
// отгрузку должен увидеть, что заказ собран»). По одному экрану видно, что
// тормозит отгрузку: очередь заказов до отправки, у каждого плитки категорий со
// статусом сборки, кто собирает и где нехватка, и действие «отгрузить»
// ровно тогда, когда сборщики отработали по всем категориям.
//
// Всё готовое приносит GET /admin/shipping-queue (стадия, сводка, доступность
// перехода и его цель) — экран ничего не пересчитывает. Клик по номеру заказа
// открывает карточку drawer'ом: очередь остаётся на месте, фильтр не теряется.
//
// Почему не DataTable: строка очереди — не одна высота. В ней от одной до
// четырёх плиток категорий, и таблица со вложенной сеткой читается хуже списка
// карточек (та же причина, что у панелей дашборда). Чипы, порядок FIFO и
// пагинация — идиомы очереди заказов.
const ShippingPage = () => {
  const { t } = useTranslation()
  const [cardOrderId, setCardOrderId] = useState<string | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [chipKey, setChipKey] = useState("all")
  // Какой заказ отгружаем: мутация в хуке одна на экран, без этого
  // «загрузка» повисла бы на всех кнопках очереди сразу.
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null)

  const chip =
    SHIPPING_QUEUE_CHIPS.find((entry) => entry.key === chipKey) ??
    SHIPPING_QUEUE_CHIPS[0]

  const { transitionMutation } = useOrderLifecycle()
  // Экран делят сотрудник площадки и сборщик компании: отгрузить может тот,
  // кому переход разрешён (см. transitionsForActor).
  const actor = usePanelActor()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["shipping-queue", chip.key, pageIndex],
    queryFn: () =>
      sdk.client.fetch<AdminShippingQueueResponse>("/admin/shipping-queue", {
        query: {
          limit: PAGE_SIZE,
          offset: pageIndex * PAGE_SIZE,
          ...(chip.stage ? { stage: chip.stage } : {}),
        },
      }),
    // Прежняя страница держится на экране, пока едет новая: чипы не мигают
    // скелетом на каждый клик.
    placeholderData: keepPreviousData,
  })

  const rows = data?.shipping_orders ?? []
  const count = data?.count ?? 0

  // Страховка пагинации: заказы уезжают из очереди сами (сборщик закрыл
  // задание, кто-то отгрузил) — offset может упереться в пустоту.
  useEffect(() => {
    if (data && pageIndex > 0 && pageIndex * PAGE_SIZE >= count) {
      setPageIndex(0)
    }
  }, [data, pageIndex, count])

  const selectChip = (entry: ShippingChip) => {
    setChipKey(entry.key)
    setPageIndex(0)
  }

  // «Отгрузить» — тот же переход, что в карточке заказа; позиции и
  // fulfillment приходят готовыми в ship_target.
  const ship = (row: ShippingQueueOrder) => {
    const transition = transitionsForActor(
      orderTransitions("delivery", row.order_status),
      actor
    ).find((entry) => entry.path === "ship")
    if (!transition || !row.ship_target) {
      return
    }
    setShippingOrderId(row.order_id)
    transitionMutation.mutate(
      {
        orderId: row.order_id,
        transition,
        body: {
          fulfillment_id: row.ship_target.fulfillment_id,
          items: row.ship_target.items,
        },
      },
      { onSettled: () => setShippingOrderId(null) }
    )
  }

  const from = count ? pageIndex * PAGE_SIZE + 1 : 0
  const to = Math.min((pageIndex + 1) * PAGE_SIZE, count)

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between gap-x-4 px-6 py-4">
        <div>
          <Heading level="h1">{t("shipping.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("shipping.subtitle")}
          </Text>
        </div>
      </div>

      <div className="sm-chips px-6 py-3">
        {SHIPPING_QUEUE_CHIPS.map((entry) => (
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
                {shippingChipCount(data.counts, entry)}
              </span>
            )}
          </button>
        ))}
      </div>

      {isError ? (
        <DataTableListError
          message={t("shipping.error")}
          onRetry={refetch}
        />
      ) : isLoading ? (
        <div className="sm-ship-empty">{t("shipping.loading")}</div>
      ) : rows.length ? (
        <>
          <div className="divide-y">
            {rows.map((row) => (
              <ShippingOrderRow
                key={row.order_id}
                row={row}
                isShipping={shippingOrderId === row.order_id}
                onOpenCard={setCardOrderId}
                onShip={ship}
              />
            ))}
          </div>
          <div className="sm-ship-footer">
            <span>
              {t("shipping.range", { from, to, count })}
              {/* Очередь просматривается до потолка — если заказов больше,
                  экран об этом говорит, а не молча их прячет. */}
              {data && data.counts.total >= data.scan_cap
                ? ` · ${t("shipping.capped", { cap: data.scan_cap })}`
                : ""}
            </span>
            <div className="sm-ship-pager">
              <Button
                size="small"
                variant="secondary"
                disabled={pageIndex === 0}
                onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              >
                {t("common.pagination.prev")}
              </Button>
              <Button
                size="small"
                variant="secondary"
                disabled={to >= count}
                onClick={() => setPageIndex((prev) => prev + 1)}
              >
                {t("common.pagination.next")}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="sm-ship-empty">
          {chip.stage ? t("shipping.emptyFiltered") : t("shipping.empty")}
        </div>
      )}

      <OrderCardDrawer
        orderId={cardOrderId}
        onClose={() => setCardOrderId(null)}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Shipping", ru: "Отгрузка" }),
  icon: HandTruck,
})

export default ShippingPage
