import { orderLabel } from "../lib/order-label"
import { ArrowDownTray } from "@medusajs/icons"
import { Button, Input, StatusBadge, Table, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { formatDate } from "../lib/date"
import { formatTengeExact } from "../lib/money"
import { debtsQuery } from "../lib/payment-report"
import {
  AdminDebtsResponse,
  DebtState,
  ORDER_PAYMENT_STATUS_META,
} from "../lib/payments"
import { sdk } from "../lib/sdk"

const STATES: DebtState[] = ["open", "requested", "closed", "all"]

type Props = {
  salesChannelId?: string
  // Колонка «Продавец» — сотруднику площадки, когда смотрит всех продавцов.
  showSeller: boolean
  onOpenOrder: (orderId: string) => void
  onExport: (query: string) => void
  exporting: boolean
}

// Долги покупателей: итоги (всего должны, просрочено, ждут решения) и список
// заказов «в долг» — просроченные первыми. Клик по строке открывает карточку
// заказа, где продавец отмечает погашение.
const PaymentsDebtsTab = ({
  salesChannelId,
  showSeller,
  onOpenOrder,
  onExport,
  exporting,
}: Props) => {
  const { t } = useTranslation()
  const [state, setState] = useState<DebtState>("open")
  const [q, setQ] = useState("")
  const filter = { sales_channel_id: salesChannelId, state, q }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["payment-report", "debts", salesChannelId, state, q],
    queryFn: () =>
      sdk.client.fetch<AdminDebtsResponse>(`/admin/payment-report/debts${debtsQuery(filter)}`),
  })

  const totals = data?.totals
  const rows = data?.debts ?? []

  return (
    <div className="flex flex-col gap-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Total
          label={t("payments.debts.outstanding")}
          value={totals ? formatTengeExact(totals.outstanding) : "—"}
          hint={totals ? t("payments.debts.openHint", { orders: totals.open_count, buyers: totals.buyers }) : ""}
        />
        <Total
          label={t("payments.debts.overdue")}
          value={totals ? formatTengeExact(totals.overdue) : "—"}
          danger={!!totals && totals.overdue > 0}
        />
        <Total
          label={t("payments.debts.requested")}
          value={totals ? String(totals.requested_count) : "—"}
          hint={totals && totals.requested_count ? formatTengeExact(totals.requested_amount) : ""}
        />
        <Total
          label={t("payments.debts.openOrders")}
          value={totals ? String(totals.open_count) : "—"}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {STATES.map((value) => (
          <Button
            key={value}
            size="small"
            variant={state === value ? "primary" : "secondary"}
            onClick={() => setState(value)}
          >
            {t(`payments.debts.state.${value}`)}
          </Button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Input
            size="small"
            type="search"
            placeholder={t("payments.searchPlaceholder")}
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
          <Button
            size="small"
            variant="secondary"
            isLoading={exporting}
            onClick={() => onExport(debtsQuery(filter))}
          >
            <ArrowDownTray />
            {t("payments.export")}
          </Button>
        </div>
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
          {isLoading ? t("common.loading") : t(`payments.debts.empty.${state}`)}
        </Text>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{t("payments.col.order")}</Table.HeaderCell>
                <Table.HeaderCell>{t("payments.col.customer")}</Table.HeaderCell>
                {showSeller && <Table.HeaderCell>{t("payments.col.seller")}</Table.HeaderCell>}
                <Table.HeaderCell className="text-right">{t("payments.col.amount")}</Table.HeaderCell>
                <Table.HeaderCell className="text-right">{t("payments.col.paid")}</Table.HeaderCell>
                <Table.HeaderCell className="text-right">{t("payments.col.outstanding")}</Table.HeaderCell>
                <Table.HeaderCell>{t("payments.col.dueDate")}</Table.HeaderCell>
                <Table.HeaderCell>{t("payments.col.status")}</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rows.map((row) => {
                const meta = ORDER_PAYMENT_STATUS_META[row.status]
                return (
                  <Table.Row
                    key={row.order_id}
                    className="cursor-pointer"
                    onClick={() => onOpenOrder(row.order_id)}
                  >
                    <Table.Cell>
                      {orderLabel(row.order_number, row.order_display_id)}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col">
                        <Text size="small">{row.customer_name ?? row.customer_phone ?? "—"}</Text>
                        {row.customer_name && row.customer_phone && (
                          <Text size="xsmall" className="text-ui-fg-subtle">
                            {row.customer_phone}
                          </Text>
                        )}
                      </div>
                    </Table.Cell>
                    {showSeller && <Table.Cell>{row.seller_name ?? "—"}</Table.Cell>}
                    <Table.Cell className="text-right tabular-nums">
                      {formatTengeExact(row.amount)}
                    </Table.Cell>
                    <Table.Cell className="text-right tabular-nums">
                      {formatTengeExact(row.paid_amount)}
                    </Table.Cell>
                    <Table.Cell className="text-right font-medium tabular-nums">
                      {formatTengeExact(row.outstanding)}
                    </Table.Cell>
                    <Table.Cell>
                      {row.due_date ? (
                        <span className={row.overdue ? "text-ui-fg-error" : undefined}>
                          {formatDate(row.due_date)}
                          {row.overdue
                            ? ` · ${t("payments.debts.overdueDays", { count: row.overdue_days })}`
                            : ""}
                        </span>
                      ) : (
                        "—"
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <StatusBadge color={row.overdue ? "red" : meta.color}>
                        {row.overdue ? t("payments.status.overdue") : t(meta.label)}
                      </StatusBadge>
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

const Total = ({
  label,
  value,
  hint,
  danger,
}: {
  label: string
  value: string
  hint?: string
  danger?: boolean
}) => (
  <div className="flex flex-col gap-y-1 rounded-lg border border-ui-border-base p-3">
    <Text size="xsmall" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text size="large" weight="plus" className={danger ? "text-ui-fg-error tabular-nums" : "tabular-nums"}>
      {value}
    </Text>
    {hint ? (
      <Text size="xsmall" className="text-ui-fg-subtle">
        {hint}
      </Text>
    ) : null}
  </div>
)

export default PaymentsDebtsTab
