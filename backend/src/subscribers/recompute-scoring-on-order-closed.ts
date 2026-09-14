import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { isCompaniesEnabled } from "../lib/feature-flags"
import { ORDER_STATUS_CHANGED_EVENT } from "../modules/order-lifecycle/events"
import { recomputeCompanyScoringWorkflow } from "../workflows/recompute-company-scoring"

type StatusChangedPayload = {
  order_id: string
  to: string
}

// Событийный пересчёт рейтинга: при закрытии заказа юрлица (link company↔order)
// пересчитываем скоринг его компании — свежая история влияет на лимит отсрочки
// (ТЗ 4.7). Заказы физлиц (без компании) игнорируем. Крон-джоба дополнительно
// актуализирует tenure. Пересчёт идемпотентен (upsert одной карточки).
export default async function recomputeScoringOnOrderClosed({
  event: { data },
  container,
}: SubscriberArgs<StatusChangedPayload>) {
  // Юрлица заморожены (T10.9) — скоринга нет, заказы закрываются без него.
  if (data.to !== "closed" || !isCompaniesEnabled()) {
    return
  }
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "company.id"],
    filters: { id: data.order_id },
  })
  const companyId = (orders?.[0] as { company?: { id?: string } })?.company?.id
  if (!companyId) {
    return
  }
  await recomputeCompanyScoringWorkflow(container).run({
    input: { company_id: companyId },
  })
}

export const config: SubscriberConfig = {
  event: ORDER_STATUS_CHANGED_EVENT,
}
