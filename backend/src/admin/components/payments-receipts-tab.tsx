import { orderLabel } from "../lib/order-label"
import { Button, StatusBadge, Table, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { formatDateTime } from "../lib/date"
import { formatTengeExact } from "../lib/money"
import { AdminReceiptsResponse, RECEIPT_STATUS_META } from "../lib/payments"
import { sdk } from "../lib/sdk"

type Props = {
  salesChannelId?: string
  showSeller: boolean
  onOpenOrder: (orderId: string) => void
}

// Чеки покупателей: ждущие решения (с нарушениями — первыми) или все. Решение
// принимается в карточке заказа — клик по строке её открывает.
const PaymentsReceiptsTab = ({ salesChannelId, showSeller, onOpenOrder }: Props) => {
  const { t } = useTranslation()
  const [state, setState] = useState<"waiting" | "all">("waiting")
  const params = new URLSearchParams({ state })
  if (salesChannelId) {
    params.set("sales_channel_id", salesChannelId)
  }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["payment-report", "receipts", salesChannelId, state],
    queryFn: () =>
      sdk.client.fetch<AdminReceiptsResponse>(`/admin/payment-report/receipts?${params}`),
  })
  const rows = data?.receipts ?? []

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["waiting", "all"] as const).map((value) => (
          <Button
            key={value}
            size="small"
            variant={state === value ? "primary" : "secondary"}
            onClick={() => setState(value)}
          >
            {t(`payments.receipts.state.${value}`)}
          </Button>
        ))}
        <Text size="xsmall" className="text-ui-fg-subtle">
          {t("payments.receipts.tabHint")}
        </Text>
      </div>

      {isError ? (
        <div className="flex items-center gap-3">
          <Text size="small" className="text-ui-fg-subtle">
            {t("payments.loadError")}
          </Text>
          <Button size="small" variant="secondary" onClick={() => refetch()}>
            {t("common.retry")}
          </Button>
        </div>
      ) : !rows.length ? (
        <Text size="small" className="text-ui-fg-subtle">
          {isLoading ? t("common.loading") : t(`payments.receipts.empty.${state}`)}
        </Text>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("payments.col.date")}</Table.HeaderCell>
                <Table.HeaderCell>{t("payments.col.order")}</Table.HeaderCell>
                <Table.HeaderCell>{t("payments.col.customer")}</Table.HeaderCell>
                {showSeller && <Table.HeaderCell>{t("payments.col.seller")}</Table.HeaderCell>}
                <Table.HeaderCell className="text-right">{t("payments.receipts.amount")}</Table.HeaderCell>
                <Table.HeaderCell>{t("payments.receipts.checks")}</Table.HeaderCell>
                <Table.HeaderCell>{t("payments.col.status")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rows.map((row) => {
                const meta = RECEIPT_STATUS_META[row.status]
                const fails = row.checks.filter((check) => check.level === "fail")
                return (
                  <Table.Row
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => onOpenOrder(row.order_id)}
                  >
                    <Table.Cell>{formatDateTime(row.created_at)}</Table.Cell>
                    <Table.Cell>
                      {orderLabel(row.order_number, row.order_display_id)}
                    </Table.Cell>
                    <Table.Cell>{row.customer_name ?? row.customer_phone ?? "—"}</Table.Cell>
                    {showSeller && <Table.Cell>{row.seller_name ?? "—"}</Table.Cell>}
                    <Table.Cell className="text-right tabular-nums">
                      {row.amount != null ? formatTengeExact(row.amount) : "—"}
                    </Table.Cell>
                    <Table.Cell>
                      <Text
                        size="xsmall"
                        className={fails.length ? "text-ui-fg-error" : "text-ui-fg-subtle"}
                      >
                        {fails.length
                          ? fails.map((check) => check.text).join("; ")
                          : row.checks.length
                          ? t("payments.receipts.warningsCount", { count: row.checks.length })
                          : t("payments.receipts.checksOk")}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <StatusBadge color={meta.color}>{t(meta.label)}</StatusBadge>
                    </Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
        </div>
      )}
    </div>
  )
}

export default PaymentsReceiptsTab
