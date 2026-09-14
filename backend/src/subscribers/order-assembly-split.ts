import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { splitOrderAssemblyWorkflow } from "../workflows/split-order-assembly"

// Распад оплаченного заказа на задания сборки (T10.11). Ядро эмитит
// order.placed из completeCartWorkflow, а place-order пропускает только
// оплаченную корзину (100% предоплата) — значит «размещён» здесь и есть
// «оплачен». Задания — вторичный артефакт, как счёт в order-invoice: их
// создание в подписчике, а не внутри place-order, чтобы сбой распада не
// откатывал оплаченный заказ. Идемпотентность — в самом workflow.
export default async function splitOrderAssembly({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const { result } = await splitOrderAssemblyWorkflow(container).run({
    input: { order_id: data.id },
  })

  if (result.created_ids.length) {
    logger.info(
      `[assembly] заказ ${data.id} разложен на ${result.created_ids.length} ` +
        `задание(й) сборки: ${result.tasks
          .map((t) => t.category_handle)
          .join(", ")}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
