import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { storeOrigins } from "../../lib/cors-origins"

// CORS для `/driver/*`. Ядро ставит CORS-заголовки только своим префиксам
// (`/store` → storeCors, `/admin` → adminCors, `/auth` → authCors); у нашего
// actor-типа префикс свой, поэтому web-сборка приложения водителя получала бы
// «blocked by CORS policy» на каждый запрос (тот же случай, что с фото товаров
// в `/media/:file`). Список origin'ов — общий с витриной и мобилкой
// (`lib/cors-origins.ts`): dev-сборки Flutter web живут там же.
//
// Разрешаем только знакомые origin'ы; preflight закрываем сами — обработчика
// OPTIONS у роутов нет, и без ответа браузер получил бы 404.
const ALLOWED_HEADERS = "authorization,content-type"

export const driverCors = (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const origin = req.headers.origin
  if (origin && storeOrigins().includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin)
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS)
    res.setHeader("Access-Control-Max-Age", "86400")
    res.setHeader("Vary", "Origin")
  }

  if (req.method === "OPTIONS") {
    res.status(204).end()
    return
  }

  next()
}
