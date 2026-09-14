import { getServerMessages } from "@lib/i18n/server"
import { listMyOrderLifecycles } from "@lib/data/order-lifecycle"
import { listOrders } from "@lib/data/orders"
import CabinetEmpty from "@modules/cabinet/components/cabinet-empty"
import OrderRow from "@modules/cabinet/components/order-row"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Orders",
  description: "Your orders: number, date, total and stage.",
}

// Список заказов кабинета: номер, дата, сумма, стадия, слот доставки. Стадии тянем ОДНИМ
// запросом (`/store/order-lifecycles`, T10.6a) — раньше клиент дочитывал их по
// запросу на заказ. Пустой ответ по стадиям не прячет заказы: строка просто
// останется без бейджа.
export default async function CabinetOrdersPage() {
  const [orders, lifecycles, m] = await Promise.all([
    listOrders(50).catch(() => []),
    listMyOrderLifecycles(),
    getServerMessages(),
  ])

  // Стадия и слот доставки строки — из одного объекта цикла (T5.6a).
  const stages = new Map(
    lifecycles.map((lifecycle) => [lifecycle.order_id, lifecycle])
  )

  return (
    <section className="flex flex-col gap-4" data-testid="cabinet-orders">
      <div className="flex flex-col gap-1">
        <h1 className="text-heading-large text-ink">
          {m.cabinet.orders.title}
        </h1>
        <p className="text-body-large text-ink-secondary">
          {m.cabinet.orders.subtitle}
        </p>
      </div>

      {orders.length === 0 ? (
        <CabinetEmpty
          title={m.cabinet.orders.empty}
          hint={m.cabinet.orders.emptyHint}
          action={m.cabinet.orders.toChat}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              lifecycle={stages.get(order.id)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
