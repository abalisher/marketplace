import { Badge, Button } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { formatAmount } from "../lib/money"
import {
  ASSEMBLY_TASK_STATUS_META,
  SHIPPING_STAGE_META,
  ShippingCategoryTile,
  ShippingQueueOrder,
} from "../lib/shipping"

// Строка очереди отгрузки (T10.13): один заказ — шапка (номер, покупатель,
// адрес), плитки категорий со статусом сборки и действие «отгрузить».
// Ничего не считает: стадию, доступность перехода и сводку по позициям
// приносит GET /admin/shipping-queue.
const ShippingOrderRow = ({
  row,
  isShipping,
  onOpenCard,
  onShip,
}: {
  row: ShippingQueueOrder
  isShipping: boolean
  onOpenCard: (orderId: string) => void
  onShip: (row: ShippingQueueOrder) => void
}) => {
  const { t } = useTranslation()
  const stage = SHIPPING_STAGE_META[row.stage]
  const order = row.order

  // Что тормозит отгрузку — одной строкой над плитками. Заказ ждёт сборщиков
  // или ждёт решения по нехватке; ради этой строки экран и заводился.
  const pending = row.summary.tasks_total - row.summary.tasks_finished

  return (
    <div className="sm-ship-order">
      <div className="sm-ship-head">
        <div>
          <div className="sm-ship-title">
            <button
              type="button"
              className="sm-ship-link"
              onClick={() => onOpenCard(row.order_id)}
            >
              {order?.display_id == null
                ? t("shipping.orderNoUnknown")
                : t("orderQueue.orderNo", { id: order.display_id })}
            </button>
            <span className="text-ui-fg-subtle">·</span>
            <span>{order?.customer_name ?? "—"}</span>
            <Badge size="2xsmall" color={stage.color}>
              {t(stage.label)}
            </Badge>
          </div>
          <div className="sm-ship-sub">
            {[
              order?.address,
              order ? t("orderQueue.items", { count: order.item_count }) : null,
              order?.total == null
                ? null
                : formatAmount(order.total, order.currency_code),
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        </div>

        <div className="sm-ship-actions">
          <Button
            size="small"
            variant="primary"
            disabled={!row.can_ship || isShipping}
            isLoading={isShipping}
            onClick={() => onShip(row)}
          >
            {t("shipping.ship")}
          </Button>
        </div>
      </div>

      {row.summary.has_shortage && (
        <div className="sm-ship-warning">
          {t("shipping.shortageWarning", {
            categories: row.categories
              .filter((tile) => tile.status === "shortage")
              .map((tile) => tile.category_name)
              .join(", "),
          })}
        </div>
      )}

      {!row.summary.is_finished && (
        <div className="sm-ship-sub">
          {t("shipping.waiting", { count: pending })}
        </div>
      )}

      <div className="sm-ship-tiles">
        {row.categories.map((tile) => (
          <CategoryTile key={tile.id} tile={tile} />
        ))}
      </div>
    </div>
  )
}

// Плитка одной категории: статус точкой (идиома StatusCell ядра), кто собирает
// и сколько позиций отмечено. Списка товаров тут нет — он в карточке заказа.
const CategoryTile = ({ tile }: { tile: ShippingCategoryTile }) => {
  const { t } = useTranslation()
  const meta = ASSEMBLY_TASK_STATUS_META[tile.status]

  return (
    <div
      className={
        tile.status === "shortage"
          ? "sm-ship-tile sm-ship-tile-shortage"
          : "sm-ship-tile"
      }
    >
      <div className="sm-ship-tile-name">{tile.category_name}</div>
      <div className="sm-ship-tile-status">
        <span className={`size-2 rounded-full ${meta.dotClass}`} />
        <span>{t(meta.label)}</span>
      </div>
      <div className="sm-ship-tile-meta">
        {t("shipping.tile.marked", {
          marked: tile.items_marked,
          total: tile.items_total,
        })}
        {tile.items_missing > 0 &&
          ` · ${t("shipping.tile.missing", { count: tile.items_missing })}`}
      </div>
      {/* Имя сборщика — без подписи «Сборщик:»: плитка уже названа категорией,
          а служебные учётки групп зовутся «Сборщик <категория>» — вышло бы
          «Сборщик: Сборщик Отделочные материалы» (дефект гейта U). */}
      <div className="sm-ship-tile-meta">
        {tile.assignee_name ??
          tile.completed_by_name ??
          t("shipping.tile.noPicker")}
      </div>
    </div>
  )
}

export default ShippingOrderRow
