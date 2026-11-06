import { MedusaService } from "@medusajs/framework/utils"
import OnecConnection from "./models/onec-connection"
import OnecItem from "./models/onec-item"
import OnecSyncRun from "./models/onec-sync-run"

// Прогон, «висящий» в running дольше этого, считается оборванным (процесс
// перезапустили посреди синхронизации): он больше не мешает новому прогону.
export const ONEC_RUN_STALE_MS = 60 * 60 * 1000

class OnecModuleService extends MedusaService({
  OnecConnection,
  OnecSyncRun,
  OnecItem,
}) {
  async getConnectionByTenant(tenantId: string) {
    const [connection] = await this.listOnecConnections(
      { tenant_id: tenantId },
      { take: 1 }
    )
    return connection ?? null
  }

  async listRecentRuns(tenantId: string, take = 20) {
    return this.listOnecSyncRuns(
      { tenant_id: tenantId },
      { take, order: { started_at: "DESC" } }
    )
  }

  async getLastRun(tenantId: string) {
    const [run] = await this.listRecentRuns(tenantId, 1)
    return run ?? null
  }

  // Идёт ли у компании прогон прямо сейчас (не оборванный).
  async hasActiveRun(tenantId: string, now = new Date()) {
    const running = await this.listOnecSyncRuns(
      { tenant_id: tenantId, status: "running" },
      { take: 5 }
    )
    return running.some(
      (run) =>
        now.getTime() - new Date(run.started_at).getTime() < ONEC_RUN_STALE_MS
    )
  }

  async listTenantItems(tenantId: string) {
    return this.listOnecItems({ tenant_id: tenantId }, { take: null })
  }
}

export default OnecModuleService
