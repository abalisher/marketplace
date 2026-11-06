import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"

// Ядровый роут, который площадка закрыла: у него есть наш заменитель, а сам он
// обходит правило площадки (см. место подключения в middlewares.ts). Отвечаем
// как на несуществующий адрес.
export const closedCoreRoute = (
  _req: MedusaRequest,
  res: MedusaResponse,
  _next: MedusaNextFunction
) => {
  res.status(404).json({
    type: "not_found",
    message: "This route is not available on this marketplace",
  })
}
