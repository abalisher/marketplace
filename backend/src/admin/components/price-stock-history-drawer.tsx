import { Button, Drawer, Table, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { formatDateTime } from "../lib/date"
import { formatTenge } from "../lib/money"
import {
  AdminPriceStockHistoryResponse,
  AdminPriceStockHistoryRow,
  priceStockRowTitle,
} from "../lib/price-stock"
import { sdk } from "../lib/sdk"

const PAGE_SIZE = 20

type Props = {
  open: boolean
  // Журнал одной позиции (кнопка в строке) или весь (кнопка в шапке).
  variantId?: string | null
  onClose: () => void
}

// «Было → стало» одной строкой: пустая половина — эту величину правка не
// трогала (цену подняли, остаток не тронули — и наоборот).
const change = (
  from: number | null,
  to: number | null,
  format: (value: number) => string
): string | null => {
  if (to == null) {
    return null
  }
  return `${from == null ? "—" : format(from)} → ${format(to)}`
}

// Журнал правок цены и остатка (T10.14): кто, когда, было → стало. Ядро
// истории не хранит — журнал ведёт модель PriceChange модуля catalog, поэтому
// это единственное место, где видно, кто поменял цену.
const PriceStockHistoryDrawer = ({ open, variantId, onClose }: Props) => {
  const { t } = useTranslation()
  const [page, setPage] = useState(0)

  // Открыли заново — с первой страницы: чужая позиция и чужое место в ленте.
  useEffect(() => {
    if (open) {
      setPage(0)
    }
  }, [open, variantId])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["price-stock", "history", variantId ?? null, page],
    enabled: open,
    queryFn: () =>
      sdk.client.fetch<AdminPriceStockHistoryResponse>(
        "/admin/price-stock/history",
        {
          query: {
            limit: PAGE_SIZE,
            offset: page * PAGE_SIZE,
            ...(variantId ? { variant_id: variantId } : {}),
          },
        }
      ),
  })

  const rows = data?.price_changes ?? []
  const count = data?.count ?? 0
  const from = count === 0 ? 0 : page * PAGE_SIZE + 1
  const to = Math.min(count, (page + 1) * PAGE_SIZE)

  const line = (row: AdminPriceStockHistoryRow) => {
    const price = change(row.old_price, row.new_price, formatTenge)
    const stock = change(row.old_stock, row.new_stock, (value) => String(value))
    return (
      <Table.Row key={row.id}>
        <Table.Cell>
          <div className="flex flex-col">
            <span>
              {priceStockRowTitle({
                title: row.product_title,
                variant_title: row.variant_title,
              })}
            </span>
            <Text size="xsmall" className="text-ui-fg-muted">
              {formatDateTime(row.created_at)}
            </Text>
          </div>
        </Table.Cell>
        <Table.Cell>
          <div className="flex flex-col">
            {price && <span className="sm-ps-nums">{price}</span>}
            {stock && (
              <span className="sm-ps-nums">
                {t("priceStock.history.stockChange", { change: stock })}
              </span>
            )}
            {/* Склад — только у правки остатка: цена в магазине одна, а
                «остаток 373 → 370» при двух складах не отвечает «где»
                (Ф-прогон Данияра). Склада может не быть у старых правок и у
                удалённого склада — тогда строка остаётся как была. */}
            {stock && row.location_name && (
              <Text size="xsmall" className="text-ui-fg-muted">
                {row.location_name}
              </Text>
            )}
          </div>
        </Table.Cell>
        <Table.Cell>
          <div className="flex flex-col">
            <span>{row.changed_by_name ?? t("common.unknownValue")}</span>
            {row.source === "import" && (
              <Text size="xsmall" className="text-ui-fg-muted">
                {t("priceStock.history.sourceImport")}
              </Text>
            )}
          </div>
        </Table.Cell>
      </Table.Row>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
    >
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>{t("priceStock.history.title")}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="overflow-y-auto p-0">
          {isError ? (
            <div className="flex flex-col items-start gap-y-2 px-6 py-4">
              <Text size="small" className="text-ui-fg-subtle">
                {t("priceStock.error")}
              </Text>
              <Button size="small" variant="secondary" onClick={() => refetch()}>
                {t("priceStock.retry")}
              </Button>
            </div>
          ) : rows.length ? (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>
                    {t("priceStock.colProduct")}
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    {t("priceStock.history.colChange")}
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    {t("priceStock.history.colAuthor")}
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>{rows.map(line)}</Table.Body>
            </Table>
          ) : (
            <div className="px-6 py-4">
              <Text size="small" className="text-ui-fg-subtle">
                {isLoading
                  ? t("common.loading")
                  : t("priceStock.history.empty")}
              </Text>
            </div>
          )}
        </Drawer.Body>
        <Drawer.Footer className="justify-between">
          <Text size="small" className="text-ui-fg-subtle">
            {t("priceStock.history.range", { from, to, total: count })}
          </Text>
          <div className="flex items-center gap-x-2">
            <Button
              size="small"
              variant="secondary"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            >
              {t("priceStock.history.prev")}
            </Button>
            <Button
              size="small"
              variant="secondary"
              disabled={to >= count}
              onClick={() => setPage((prev) => prev + 1)}
            >
              {t("priceStock.history.next")}
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export default PriceStockHistoryDrawer
