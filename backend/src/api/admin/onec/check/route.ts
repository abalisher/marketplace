import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ONEC_MODULE } from "../../../../modules/onec"
import OnecModuleService from "../../../../modules/onec/service"
import { decryptSecret } from "../../../../lib/onec/secret"
import { testOnecConnection } from "../../../../lib/onec/sync"
import { resolveOnecTenant, respondOnecError } from "../helpers"
import { AdminTestOnecConnectionType } from "../validators"

// Адрес — /check, а не /test: прод-сборка Medusa выбрасывает каталоги с именем
// «test» (build-tools/compiler.js), и роут молча пропадал со стенда.
//
// POST /admin/onec/check — проверить подключение: запросить номенклатуру у 1С и
// разобрать её, ничего не записывая в каталог. Отвечает, сколько позиций
// пришло, какие поля ответа узнаны и первые позиции — по ним видно, правильно
// ли площадка понимает выгрузку, ДО первой синхронизации.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminTestOnecConnectionType>,
  res: MedusaResponse
) {
  const { tenant_id, base_url, stock_url, login, password } = req.validatedBody
  const tenant = await resolveOnecTenant(req, tenant_id)
  const service = req.scope.resolve<OnecModuleService>(ONEC_MODULE)
  const saved = await service.getConnectionByTenant(tenant.id)

  try {
    const credentials = {
      base_url: base_url ?? saved?.base_url,
      // Пустая строка — проверить без сервиса остатков.
      stock_url: stock_url === undefined ? saved?.stock_url ?? null : stock_url || null,
      login: login ?? saved?.login,
      password:
        password ||
        (saved?.password_cipher ? decryptSecret(saved.password_cipher) : undefined),
    }
    if (!credentials.base_url || !credentials.login || !credentials.password) {
      res.status(400).json({
        type: "invalid_data",
        message: "Укажите адрес сервиса 1С, логин и пароль",
      })
      return
    }
    const result = await testOnecConnection(
      credentials as {
        base_url: string
        stock_url: string | null
        login: string
        password: string
      }
    )
    res.json({ result })
  } catch (error) {
    if (respondOnecError(res, error)) {
      return
    }
    // Ответ пришёл, но не разобран (нет списка номенклатуры).
    res.status(422).json({
      type: "onec_error",
      code: "bad_response",
      message: (error as Error)?.message ?? "Ответ 1С не разобран",
    })
  }
}
