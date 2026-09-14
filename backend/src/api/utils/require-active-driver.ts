import type {
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaResponse,
} from "@medusajs/framework/http"
import { DRIVER_MODULE } from "../../modules/driver"
import DriverModuleService from "../../modules/driver/service"

// Допуск к работе (T5.2a). Токен водителя выдаётся при ЛЮБОМ статусе заявки —
// иначе заблокированный видел бы «неверный код» вместо причины (см.
// docs/modules/driver.md). Поэтому работу с заказами закрывает отдельный гейт:
// в пул и к рейсам пускаем только допущенного (`active`).
//
// 403, а не 404: раздел существует, водителю просто ещё (или уже) нельзя —
// приложение показывает причину, а не пустой экран.
const DENIED_MESSAGE: Record<string, string> = {
  pending: "Заявка на проверке у продавца — заказы откроются после допуска",
  blocked: "Доступ к заказам закрыт",
}

export const requireActiveDriver = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const service = req.scope.resolve<DriverModuleService>(DRIVER_MODULE)

  let driver: { status: string; status_note: string | null }
  try {
    driver = (await service.retrieveDriver(req.auth_context.actor_id)) as {
      status: string
      status_note: string | null
    }
  } catch {
    // Токен есть, а профиля нет — заявку удалили после выдачи токена.
    res.status(401).json({
      reason: "driver_unknown",
      message: "Заявка не найдена — войдите заново",
    })
    return
  }

  if (driver.status !== "active") {
    // Причина отказа/блокировки написана продавцом для водителя — показываем
    // её, а не общий текст, если она есть.
    res.status(403).json({
      reason: `driver_${driver.status}`,
      message:
        driver.status_note?.trim() ||
        DENIED_MESSAGE[driver.status] ||
        DENIED_MESSAGE.blocked,
    })
    return
  }

  next()
}
