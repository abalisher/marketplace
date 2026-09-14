import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// GET /store/carts/me — незавершённая корзина текущего покупателя (кабинет,
// T10.6). До неё у клиентов не было пути с сервера: корзину создаёт ассистент
// в ходе диалога и возвращает её id токеном сессии, поэтому «текущая корзина»
// жила только в состоянии клиента — на другом устройстве раздел «Корзина» был
// бы пуст. Здесь корзину находит БЭКЕНД: последняя обновлённая корзина
// покупателя без completed_at.
//
// Отдаём только id: содержимое клиент читает ядровым GET /store/carts/:id
// (там уже есть все поля, промо и кредитные линии) — не дублируем сериализацию
// корзины ядра. Нет корзины — cart_id: null, это штатный ответ.
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: carts } = await query.graph({
    entity: "cart",
    fields: ["id", "updated_at"],
    filters: {
      customer_id: req.auth_context.actor_id,
      completed_at: null,
    },
    pagination: { order: { updated_at: "DESC" }, take: 1 },
  })

  res.json({ cart_id: carts.length ? carts[0].id : null })
}
