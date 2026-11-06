import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { ONEC_MODULE } from "../../../../modules/onec"
import OnecModuleService from "../../../../modules/onec/service"
import { readOnecFile } from "../../../../lib/onec/file-feed"
import { feedSummary, startOnecSync } from "../../../../lib/onec/sync"
import { upsertOnecConnectionWorkflow } from "../../../../workflows/onec/upsert-onec-connection"
import { resolveOnecTenant, respondOnecError } from "../helpers"
import { AdminUploadOnecFileType } from "../validators"

// POST /admin/onec/file — каталог компании из Excel-файла (у компании нет 1С).
//
// apply = false: файл только разбирается — ответ показывает, какие колонки
// узнаны, сколько позиций и первые из них (как проверка подключения 1С).
// apply = true: тот же разбор и запуск загрузки в каталог — товары, цены и
// остатки идут тем же путём, что синхронизация с 1С; прогон в фоне (202),
// итог — в журнале прогонов (GET /admin/onec).
//
// Первая загрузка сама заводит компании файловое подключение. Компании, чей
// каталог ведёт 1С, файл можно разобрать, но не загрузить — два источника
// перетирали бы друг друга.
export async function POST(
  req: AuthenticatedMedusaRequest<AdminUploadOnecFileType>,
  res: MedusaResponse
) {
  const { tenant_id, file_name, content_base64, apply } = req.validatedBody
  const tenant = await resolveOnecTenant(req, tenant_id)
  const service = req.scope.resolve<OnecModuleService>(ONEC_MODULE)
  const connection = await service.getConnectionByTenant(tenant.id)

  try {
    const feed = readOnecFile(Buffer.from(content_base64, "base64"), file_name)
    const result = feedSummary(feed)
    if (!apply) {
      res.json({ result })
      return
    }
    if (connection && connection.source !== "file") {
      res.status(409).json({
        type: "onec_sync_error",
        code: "source_http",
        message:
          "Каталог компании ведёт её 1С — переключите источник на «Excel-файл», чтобы загружать каталог файлом",
      })
      return
    }
    if (!connection) {
      await upsertOnecConnectionWorkflow(req.scope).run({
        input: { tenant_id: tenant.id, source: "file" },
        throwOnError: true,
      })
    }
    await startOnecSync(req.scope, {
      tenant_id: tenant.id,
      trigger: "file",
      user_id: req.auth_context?.actor_id ?? null,
      feed,
      file_name,
    })
    res.status(202).json({ started: true, result })
  } catch (error) {
    if (respondOnecError(res, error)) {
      return
    }
    if (error instanceof MedusaError && error.type === MedusaError.Types.INVALID_DATA) {
      res.status(422).json({ type: "invalid_data", message: error.message })
      return
    }
    throw error
  }
}
