import { orderLabel } from "../lib/order-label"
import { ArrowDownTray } from "@medusajs/icons"
import { Button, Input, Select, Table, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { formatDateTime } from "../lib/date"
import { formatTengeExact } from "../lib/money"
import { ORDER_PAYMENT_METHOD_LABEL } from "../lib/order"
import { JOURNAL_PERIODS, JournalPeriod, journalQuery } from "../lib/payment-report"
import {
  AdminPaymentReportResponse,
  PAYMENT_CHANNEL_LABEL,
  PAYMENT_CHANNELS,
  PaymentChannel,
} from "../lib/payments"
import { sdk } from "../lib/sdk"

const PAGE_SIZE = 50
const ALL = "all"

type Props = {
  salesChannelId?: string
  showSeller: boolean
  onOpenOrder: (orderId: string) => void
  onExport: (query: string) => void
  exporting: boolean
}

// Журнал оплат: каждое поступление и возврат денег за период — с заказом,
// покупателем, способом и тем, кто отметил; итоги по тому, как пришли деньги.
const PaymentsJournalTab = ({
  salesChannelId,
  showSeller,
  onOpenOrder,
  onExport,
  exporting,
}: Props) => {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<JournalPeriod>("month")
  const [kind, setKind] = useState<"payment" | "refund" | undefined>()
  const [channel, setChannel] = useState<PaymentChannel | undefined>()
  const [q, setQ] = useState("")
  const [offset, setOffset] = useState(0)
  const filter = { sales_channel_id: salesChannelId, period, kind, channel, q }

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["payment-report", "journal", salesChannelId, period, kind, channel, q, offset],
    queryFn: () =>
      sdk.client.fetch<AdminPaymentReportResponse>(
        `/admin/payment-report${journalQuery(filter, { limit: PAGE_SIZE, offset })}`
      ),
  })

  const totals = data?.totals
  const rows = data?.entries ?? []
  const count = data?.count ?? 0
  const reset = () => setOffset(0)

  return (
    <div className="flex flex-col gap-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Total label={t("payments.journal.received")} value={totals ? formatTengeExact(totals.received) : "—"} />
        <Total label={t("payments.journal.refunded")} value={totals ? formatTengeExact(totals.refunded) : "—"} />
        <Total label={t("payments.journal.net")} value={totals ? formatTengeExact(totals.net) : "—"} />
        <div className="flex flex-col gap-y-1 rounded-lg border border-ui-border-base p-3">
          <Text size="xsmall" className="text-ui-fg-subtle">
            {t("payments.journal.byChannel")}
          </Text>
          {totals && Object.keys(totals.by_channel).length ? (
            Object.entries(totals.by_channel).map(([key, value]) => (
              <Text key={key} size="xsmall" className="tabular-nums">
                {t(PAYMENT_CHANNEL_LABEL[key as PaymentChannel])}: {formatTengeExact(value ?? 0)}
              </Text>
            ))
          ) : (
            <Text size="xsmall">—</Text>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {JOURNAL_PERIODS.map((value) => (
          <Button
            key={value}
            size="small"
            variant={period === value ? "primary" : "secondary"}
            onClick={() => {
              setPeriod(value)
              reset()
            }}
          >
            {t(`payments.journal.period.${value}`)}
          </Button>
        ))}
        <div className="w-[170px]">
          <Select
            size="small"
            value={kind ?? ALL}
            onValueChange={(value) => {
              setKind(value === ALL ? undefined : (value as "payment" | "refund"))
              reset()
            }}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={ALL}>{t("payments.journal.allKinds")}</Select.Item>
              <Select.Item value="payment">{t("payments.kind.payment")}</Select.Item>
              <Select.Item value="refund">{t("payments.kind.refund")}</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <div className="w-[170px]">
          <Select
            size="small"
            value={channel ?? ALL}
            onValueChange={(value) => {
              setChannel(value === ALL ? undefined : (value as PaymentChannel))
              reset()
            }}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={ALL}>{t("payments.journal.allChannels")}</Select.Item>
              {PAYMENT_CHANNELS.map((value) => (
                <Select.Item key={value} value={value}>
                  {t(PAYMENT_CHANNEL_LABEL[value])}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Input
            size="small"
            type="search"
            placeholder={t("payments.searchPlaceholder")}
            value={q}
            onChange={(event) => {
              setQ(event.target.value)
              reset()
            }}
          />
          <Button
            size="small"
            variant="secondary"
            isLoading={exporting}
            onClick={() => onExport(journalQuery(filter))}
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
          {isLoading ? t("common.loading") : t("payments.journal.empty")}
        </Text>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>{t("payments.col.date")}</Table.HeaderCell>
                  <Table.HeaderCell>{t("payments.col.order")}</Table.HeaderCell>
                  <Table.HeaderCell>{t("payments.col.customer")}</Table.HeaderCell>
                  {showSeller && <Table.HeaderCell>{t("payments.col.seller")}</Table.HeaderCell>}
                  <Table.HeaderCell>{t("payments.col.method")}</Table.HeaderCell>
                  <Table.HeaderCell>{t("payments.col.channel")}</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">{t("payments.col.sum")}</Table.HeaderCell>
                  <Table.HeaderCell>{t("payments.col.actor")}</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rows.map((row) => (
                  <Table.Row
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => onOpenOrder(row.order_id)}
                  >
                    <Table.Cell>{formatDateTime(row.occurred_at)}</Table.Cell>
                    <Table.Cell>
                      {orderLabel(row.order_number, row.order_display_id)}
                    </Table.Cell>
                    <Table.Cell>{row.customer_name ?? row.customer_phone ?? "—"}</Table.Cell>
                    {showSeller && <Table.Cell>{row.seller_name ?? "—"}</Table.Cell>}
                    <Table.Cell>{t(ORDER_PAYMENT_METHOD_LABEL[row.method])}</Table.Cell>
                    <Table.Cell>{t(PAYMENT_CHANNEL_LABEL[row.channel])}</Table.Cell>
                    <Table.Cell
                      className={
                        row.kind === "refund"
                          ? "text-right text-ui-fg-error tabular-nums"
                          : "text-right tabular-nums"
                      }
                    >
                      {row.kind === "refund" ? "−" : "+"}
                      {formatTengeExact(row.amount)}
                    </Table.Cell>
                    <Table.Cell>
                      {row.actor_type === "system"
                        ? t("payments.actor.system")
                        : row.actor_name ?? "—"}
                      {row.note ? (
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          {row.note}
                        </Text>
                      ) : null}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          {count > PAGE_SIZE && (
            <div className="flex items-center justify-between">
              <Text size="xsmall" className="text-ui-fg-subtle">
                {t("payments.journal.pageInfo", {
                  from: offset + 1,
                  to: Math.min(offset + PAGE_SIZE, count),
                  count,
                })}
              </Text>
              <div className="flex gap-2">
                <Button
                  size="small"
                  variant="secondary"
                  disabled={offset === 0}
                  onClick={() => setOffset(Math.max(offset - PAGE_SIZE, 0))}
                >
                  {t("payments.journal.prev")}
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  disabled={offset + PAGE_SIZE >= count}
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                >
                  {t("payments.journal.next")}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const Total = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-y-1 rounded-lg border border-ui-border-base p-3">
    <Text size="xsmall" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text size="large" weight="plus" className="tabular-nums">
      {value}
    </Text>
  </div>
)

export default PaymentsJournalTab
