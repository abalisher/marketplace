import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { recomputeCompanyScoringWorkflow } from "../workflows/recompute-company-scoring"

// Периодический пересчёт рейтинга одобренных компаний (ТЗ 4.7). Пересчёт также
// идёт событийно при закрытии заказа (subscribers/recompute-scoring-on-order-closed);
// крон — страховка/актуализация tenure (растёт со временем без событий). Скан
// линеен по числу approved-компаний — на масштабе MVP приемлемо. Ошибка одной
// компании не роняет прогон.
export default async function recomputeScoringJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const { data: companies } = await query.graph({
    entity: "company",
    fields: ["id"],
    filters: { status: "approved" },
  })

  let recomputed = 0
  for (const company of companies as { id: string }[]) {
    try {
      await recomputeCompanyScoringWorkflow(container).run({
        input: { company_id: company.id },
        throwOnError: true,
      })
      recomputed += 1
    } catch (error) {
      logger.error(
        `[scoring] recompute failed for company ${company.id}: ${
          (error as { message?: string })?.message
        }`
      )
    }
  }

  if (recomputed > 0) {
    logger.info(`[scoring] recomputed ${recomputed} company scorecard(s)`)
  }
}

export const config = {
  name: "recompute-scoring",
  schedule: "0 3 * * *", // ежедневно ночью — рейтинг меняется медленно
}
