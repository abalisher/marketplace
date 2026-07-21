import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { ScoringInputs } from "../../modules/scoring/models/constants"

export type GatherCompanyScoringInputsStepInput = {
  company_id: string
}

// Завершёнными для скоринга считаем доставленные/закрытые заказы; штрафом —
// отменённые/возвращённые.
const COMPLETED_STATUSES = ["delivered", "closed"]
const RETURN_STATUSES = ["canceled", "returned"]

const MS_PER_DAY = 86_400_000

// Собирает входные факторы скоринга компании из её истории заказов: количество и
// сумма завершённых заказов, число возвратов/отмен, срок работы (tenure). Через
// query.graph по link company↔order (+ вложенный order_lifecycle.status); суммы
// заказов — через СЕРВИС order (query.graph не отдаёт BigNumber-тоталы надёжно,
// см. get-order-items). Модуль scoring заказы/компанию не знает — сбор здесь, в
// workflow-слое (изоляция). Нет компании/заказов → нулевые факторы.
export const gatherCompanyScoringInputsStep = createStep(
  "gather-company-scoring-inputs",
  async (input: GatherCompanyScoringInputsStepInput, { container }) => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const orderService = container.resolve(Modules.ORDER)

    const { data: companies } = await query.graph({
      entity: "company",
      fields: [
        "id",
        "created_at",
        "orders.id",
        "orders.order_lifecycle.status",
      ],
      filters: { id: input.company_id },
    })

    const company = companies?.[0] as
      | {
          created_at?: string | Date
          orders?: { id: string; order_lifecycle?: { status?: string } }[]
        }
      | undefined

    if (!company) {
      const empty: ScoringInputs = {
        orders_count: 0,
        orders_total: 0,
        returns_count: 0,
        tenure_days: 0,
      }
      return new StepResponse({ inputs: empty })
    }

    const orders = company.orders ?? []
    const completed = orders.filter((o) =>
      COMPLETED_STATUSES.includes(o.order_lifecycle?.status ?? "")
    )
    const returns_count = orders.filter((o) =>
      RETURN_STATUSES.includes(o.order_lifecycle?.status ?? "")
    ).length

    // Сумма завершённых заказов — через сервис order (надёжные тоталы).
    let orders_total = 0
    for (const o of completed) {
      const order = await orderService.retrieveOrder(o.id)
      orders_total += Number(order.total ?? 0)
    }

    const tenure_days = company.created_at
      ? Math.max(
          0,
          Math.floor(
            (Date.now() - new Date(company.created_at).getTime()) / MS_PER_DAY
          )
        )
      : 0

    const inputs: ScoringInputs = {
      orders_count: completed.length,
      orders_total,
      returns_count,
      tenure_days,
    }
    return new StepResponse({ inputs })
  }
)
