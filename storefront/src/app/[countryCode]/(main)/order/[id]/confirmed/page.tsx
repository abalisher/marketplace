import { retrieveOrder } from "@lib/data/orders"
import { getOrderPayment } from "@lib/data/payment"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}
export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "You purchase was successful",
}

export default async function OrderConfirmedPage(props: Props) {
  const params = await props.params
  const [order, payment] = await Promise.all([
    retrieveOrder(params.id).catch(() => null),
    // Способ оплаты и инструкции (перевод, долг); null — старый заказ.
    getOrderPayment(params.id),
  ])

  if (!order) {
    return notFound()
  }

  return <OrderCompletedTemplate order={order} payment={payment} />
}
