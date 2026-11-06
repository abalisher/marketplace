import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { Container } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import OrderPaymentSection from "../components/order-payment-section"
import { usePanelActor } from "../hooks/use-panel-actor"
import { AdminOrderPayment } from "../lib/payments"
import { sdk } from "../lib/sdk"

// Оплата заказа на ядровой странице заказа: тот же блок, что в карточке
// очереди (способ, суммы, долг, журнал, отметки денег). Данные —
// GET /admin/orders/:id/payment. Заказ, оформленный до способов оплаты
// (payment: null), блока не получает: его оплату показывает ядро.
const OrderPaymentCardWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const actor = usePanelActor()
  const { data: response } = useQuery({
    queryKey: ["order-payment", data.id],
    queryFn: () =>
      sdk.client.fetch<{ payment: AdminOrderPayment | null }>(
        `/admin/orders/${data.id}/payment`
      ),
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  })

  const payment = response?.payment
  if (!payment) {
    return null
  }

  return (
    <Container className="px-6 py-4">
      <OrderPaymentSection
        orderId={data.id}
        displayId={data.display_id ?? null}
        payment={payment}
        readOnly={actor === "picker"}
      />
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderPaymentCardWidget
