import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { retrieveCounterCart } from "../helpers"

// GET /admin/counter-carts/:id — текущее состояние POS-корзины (позиции,
// тоталы, платёжные сессии) для экрана продажи partner-app. Не-POS корзина
// (без metadata.counter) — 404.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const cart = await retrieveCounterCart(req.scope, req.params.id)
  res.json({ cart })
}
