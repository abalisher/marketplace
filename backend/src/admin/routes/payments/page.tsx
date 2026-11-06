import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CreditCard } from "@medusajs/icons"
import { Container, Heading, Select, Tabs, Text, toast } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import OrderCardDrawer from "../../components/order-card-drawer"
import PaymentSettingsForm from "../../components/payment-settings-form"
import PaymentsDebtsTab from "../../components/payments-debts-tab"
import PaymentsJournalTab from "../../components/payments-journal-tab"
import PaymentsReceiptsTab from "../../components/payments-receipts-tab"
import { usePanelActor } from "../../hooks/use-panel-actor"
import { reportFileName } from "../../lib/payment-report"
import {
  AdminPaymentSellersResponse,
  AdminPaymentSettingsResponse,
} from "../../lib/payments"
import { routeLabel } from "../../lib/route-label"
import { sdk } from "../../lib/sdk"

const ALL_SELLERS = "all"

// «Оплаты и долги»: долги покупателей (кто, сколько, срок, просрочка), чеки
// Kaspi от покупателей (ждут решения продавца), журнал
// поступлений и возвратов денег и способы оплаты продавца (Kaspi QR, перевод на
// номер Kaspi, в долг). Продавец компании видит только свои деньги и свои
// настройки (компанию бэкенд берёт из входа); сотрудник площадки выбирает
// продавца или смотрит отчёт по всем.
const PaymentsPage = () => {
  const { t } = useTranslation()
  const actor = usePanelActor()
  const isStaff = actor === "staff"
  const [seller, setSeller] = useState<string>(ALL_SELLERS)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  // Список продавцов — только сотруднику площадки (продавцу компании он не
  // нужен и бэкенд его не отдаёт).
  const sellers = useQuery({
    queryKey: ["payment-settings", "sellers"],
    queryFn: () =>
      sdk.client.fetch<AdminPaymentSellersResponse>("/admin/payment-settings"),
    enabled: isStaff,
  })

  const salesChannelId = isStaff && seller !== ALL_SELLERS ? seller : undefined

  const settings = useQuery({
    queryKey: ["payment-settings", "seller", isStaff ? salesChannelId : "own"],
    queryFn: () =>
      sdk.client.fetch<AdminPaymentSettingsResponse>(
        `/admin/payment-settings${salesChannelId ? `?sales_channel_id=${salesChannelId}` : ""}`
      ),
    enabled: actor !== undefined && (!isStaff || !!salesChannelId),
  })

  // Выгрузка файлом: тянем CSV с авторизацией и отдаём браузеру ссылкой
  // (идиома экспорта «Цен и остатков»).
  const exportReport = async (view: "entries" | "debts", query: string) => {
    setExporting(true)
    try {
      const response = await fetch(
        `/admin/payment-report/export${query}${query ? "&" : "?"}view=${view}`,
        { credentials: "include" }
      )
      if (!response.ok) {
        throw new Error(t("payments.exportFailed"))
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = reportFileName(view, new Date())
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      setExporting(false)
    }
  }

  return (
    <Container className="flex flex-col gap-y-6 px-6 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-y-1">
          <Heading level="h1">{t("payments.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {t("payments.subtitle")}
          </Text>
        </div>
        {isStaff && (
          <div className="w-[260px]">
            <Select value={seller} onValueChange={setSeller}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value={ALL_SELLERS}>{t("payments.allSellers")}</Select.Item>
                {(sellers.data?.sellers ?? []).map((entry) => (
                  <Select.Item key={entry.sales_channel_id} value={entry.sales_channel_id}>
                    {entry.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        )}
      </div>

      <Tabs defaultValue="debts">
        <Tabs.List>
          <Tabs.Trigger value="debts">{t("payments.tabs.debts")}</Tabs.Trigger>
          <Tabs.Trigger value="receipts">{t("payments.tabs.receipts")}</Tabs.Trigger>
          <Tabs.Trigger value="journal">{t("payments.tabs.journal")}</Tabs.Trigger>
          <Tabs.Trigger value="settings">{t("payments.tabs.settings")}</Tabs.Trigger>
        </Tabs.List>
        <div className="pt-4">
          <Tabs.Content value="debts">
            <PaymentsDebtsTab
              salesChannelId={salesChannelId}
              showSeller={isStaff && !salesChannelId}
              onOpenOrder={setOrderId}
              onExport={(query) => exportReport("debts", query)}
              exporting={exporting}
            />
          </Tabs.Content>
          <Tabs.Content value="receipts">
            <PaymentsReceiptsTab
              salesChannelId={salesChannelId}
              showSeller={isStaff && !salesChannelId}
              onOpenOrder={setOrderId}
            />
          </Tabs.Content>
          <Tabs.Content value="journal">
            <PaymentsJournalTab
              salesChannelId={salesChannelId}
              showSeller={isStaff && !salesChannelId}
              onOpenOrder={setOrderId}
              onExport={(query) => exportReport("entries", query)}
              exporting={exporting}
            />
          </Tabs.Content>
          <Tabs.Content value="settings">
            {isStaff && !salesChannelId ? (
              <Text size="small" className="text-ui-fg-subtle">
                {t("payments.settings.chooseSeller")}
              </Text>
            ) : settings.data ? (
              <div className="flex flex-col gap-y-4">
                {isStaff && (
                  <Text size="small" weight="plus">
                    {settings.data.seller.name}
                  </Text>
                )}
                <PaymentSettingsForm
                  salesChannelId={settings.data.seller.sales_channel_id}
                  explicitSeller={isStaff}
                  settings={settings.data.settings}
                />
              </div>
            ) : (
              <Text size="small" className="text-ui-fg-subtle">
                {settings.isError ? t("payments.loadError") : t("common.loading")}
              </Text>
            )}
          </Tabs.Content>
        </div>
      </Tabs>

      <OrderCardDrawer orderId={orderId} onClose={() => setOrderId(null)} />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Payments & debts", ru: "Оплаты и долги" }),
  icon: CreditCard,
})

export default PaymentsPage
