import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Button, Container, Heading, Text } from "@medusajs/ui"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import TenantCustomerDrawer from "../components/tenant-customer-drawer"
import { usePanelActor } from "../hooks/use-panel-actor"

// Над ядровым списком «Клиенты»: продавец компании заводит своего клиента.
// Ядровая кнопка «Создать» ему закрыта (POST /admin/customers — 403, кнопка
// спрятана в styles/shell.css), у сотрудника площадки виджета нет.
const TenantCustomerCreateWidget = () => {
  const { t } = useTranslation()
  const actor = usePanelActor()
  const [open, setOpen] = useState(false)

  if (actor !== "tenant_seller") {
    return null
  }

  return (
    <Container className="flex items-center justify-between gap-x-4 px-6 py-4">
      <div className="flex flex-col gap-y-1">
        <Heading level="h2">{t("tenantCustomers.widgetTitle")}</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t("tenantCustomers.widgetHint")}
        </Text>
      </div>
      <Button size="small" variant="secondary" onClick={() => setOpen(true)}>
        {t("tenantCustomers.button")}
      </Button>
      <TenantCustomerDrawer open={open} onClose={() => setOpen(false)} />
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.list.before",
})

export default TenantCustomerCreateWidget
