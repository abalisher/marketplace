import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SCORING_MODULE } from "../../../../../../modules/scoring"
import ScoringModuleService from "../../../../../../modules/scoring/service"
import { setCompanyCreditLimitWorkflow } from "../../../../../../workflows/set-company-credit-limit"
import { AdminSetCreditLimitType } from "../validators"

// POST /admin/companies/:id/scorecard/limit — ручная корректировка лимита
// отсрочки (перекрывает вычисленный; null — сброс). Событие scoring.limit_changed
// (аудит). Admin-only — контракт не трогаем.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminSetCreditLimitType>,
  res: MedusaResponse
) {
  await setCompanyCreditLimitWorkflow(req.scope).run({
    input: {
      company_id: req.params.id,
      manual_limit: req.validatedBody.manual_limit,
      note: req.validatedBody.note ?? null,
    },
    throwOnError: true,
  })

  const scoringService =
    req.scope.resolve<ScoringModuleService>(SCORING_MODULE)
  const card = await scoringService.getScoreCard(req.params.id)
  const available = await scoringService.availableCredit(req.params.id)
  res.json({
    scorecard: {
      company_id: req.params.id,
      exists: !!card,
      score: card ? Number(card.score) : 0,
      credit_limit: card ? Number(card.credit_limit) : 0,
      manual_limit: card?.manual_limit != null ? Number(card.manual_limit) : null,
      reserved: card ? Number(card.reserved) : 0,
      available_credit: available,
      components: card?.components ?? null,
      note: card?.note ?? null,
    },
  })
}
