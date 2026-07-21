import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { SCORING_MODULE } from "../../../../../modules/scoring"
import ScoringModuleService from "../../../../../modules/scoring/service"

// GET /admin/companies/:id/scorecard — карточка рейтинга компании + свободный
// лимит отсрочки (для показа продавцу перед одобрением, ТЗ 4.7). Нет карточки
// (скоринг ещё не считался) → нулевая карточка. Admin-only — контракт не трогаем.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const scoringService =
    req.scope.resolve<ScoringModuleService>(SCORING_MODULE)
  const companyId = req.params.id
  const card = await scoringService.getScoreCard(companyId)
  const available = await scoringService.availableCredit(companyId)

  res.json({
    scorecard: {
      company_id: companyId,
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
