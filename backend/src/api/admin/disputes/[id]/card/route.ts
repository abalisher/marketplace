import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { buildDisputeCard } from "./card"

// GET /admin/disputes/:id/card — рабочее место претензии для drawer'а очереди
// (T4.11): претензия со сроком, заказ целиком, отзывы и история обращений
// покупателя одним ответом. Сборка — в card.ts.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  res.json({ dispute_card: await buildDisputeCard(req.scope, req.params.id) })
}
