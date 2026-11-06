import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ONEC_MODULE } from "../modules/onec"
import OnecModuleService from "../modules/onec/service"
import { OnecSyncError, runOnecSync } from "../lib/onec/sync"

// Синхронизация каталогов компаний с их 1С по расписанию. Крон частый, а
// реальный шаг у каждой компании свой (interval_minutes подключения): прогон
// стартует, если с начала прошлого прошло не меньше интервала. Компании идут
// по очереди — 1С:Fresh не любит параллельных тяжёлых выгрузок, а ошибка одной
// компании не мешает остальным.
export default async function syncOnecJob(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const service = container.resolve<OnecModuleService>(ONEC_MODULE)

  // Каталог из Excel по расписанию не обновляется — его обновляет загрузка
  // нового файла.
  const connections = await service.listOnecConnections(
    { enabled: true, source: "http" },
    { take: null }
  )
  const now = Date.now()

  for (const connection of connections) {
    const last = await service.getLastRun(connection.tenant_id)
    const intervalMs = Math.max(5, connection.interval_minutes) * 60 * 1000
    if (last && now - new Date(last.started_at).getTime() < intervalMs) {
      continue
    }
    try {
      await runOnecSync(container, {
        tenant_id: connection.tenant_id,
        trigger: "schedule",
      })
    } catch (error) {
      if (error instanceof OnecSyncError && error.code === "busy") {
        continue
      }
      logger.error(
        `[onec] scheduled sync failed for tenant ${connection.tenant_id}: ${
          (error as { message?: string })?.message
        }`
      )
    }
  }
}

export const config = {
  name: "sync-onec",
  schedule: "*/5 * * * *", // проверка каждые 5 минут; шаг компании — interval_minutes
}
