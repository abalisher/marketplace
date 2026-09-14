import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { isCompaniesEnabled } from "../../lib/feature-flags"

// Гейт замороженного домена (T10.9). Роуты юрлиц (компании, скоринг, кредитный
// лимит) остаются в коде целиком, но с выключенным FEATURE_COMPANIES отвечают
// 404 — так же, как если бы их не было: клиент, собранный со старым флагом, не
// получит «наполовину рабочий» раздел, а увидит честное «раздела нет».
//
// 404, а не 403: 403 сообщает «функция есть, но вам нельзя» — неправда.
export const requireCompaniesFeature = (
  _req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  if (!isCompaniesEnabled()) {
    res.status(404).json({
      type: "not_found",
      message:
        "Работа с юридическими лицами отключена: магазин оформляет заказы " +
        "только на физических лиц.",
    })
    return
  }
  next()
}
