import { model } from "@medusajs/framework/utils"

// Как запущена синхронизация: по расписанию (jobs/sync-onec.ts), кнопкой или
// загрузкой Excel-файла.
export const ONEC_SYNC_TRIGGERS = ["schedule", "manual", "file"] as const
export type OnecSyncTrigger = (typeof ONEC_SYNC_TRIGGERS)[number]

// Итог прогона:
//  running — идёт сейчас (второй параллельный прогон той же компании не стартует);
//  success — всё применено;
//  partial — применено, но часть позиций не прошла (список в issues);
//  empty   — 1С ответила пустым списком, каталог НЕ тронут (пустой ответ — почти
//            всегда сбой выгрузки, а не «у компании ничего нет»);
//  failed  — 1С недоступна или ответ не разобран, каталог не тронут.
export const ONEC_SYNC_STATUSES = [
  "running",
  "success",
  "partial",
  "empty",
  "failed",
] as const
export type OnecSyncStatus = (typeof ONEC_SYNC_STATUSES)[number]

// Журнал синхронизаций компании с 1С: когда, чем кончилась и сколько позиций
// создано / обновлено / снято. По нему экран «Интеграция 1С» показывает, живо ли
// подключение, а расписание понимает, пора ли запускать следующий прогон.
const OnecSyncRun = model
  .define("onec_sync_run", {
    id: model.id({ prefix: "onecrun" }).primaryKey(),
    tenant_id: model.text(),
    trigger: model.enum([...ONEC_SYNC_TRIGGERS]),
    status: model.enum([...ONEC_SYNC_STATUSES]).default("running"),
    started_at: model.dateTime(),
    finished_at: model.dateTime().nullable(),
    // Позиций в ответе 1С и что с ними стало.
    received: model.number().default(0),
    created: model.number().default(0),
    updated: model.number().default(0),
    unchanged: model.number().default(0),
    // Позиции, пропавшие из 1С: товар снят с витрины (не удалён).
    hidden: model.number().default(0),
    // Товары общего каталога, убранные из канала компании (exclusive_catalog).
    detached: model.number().default(0),
    failed: model.number().default(0),
    // Причина провала прогона целиком (недоступна 1С, нет прав, битый ответ).
    error: model.text().nullable(),
    // Замечания по позициям: [{ key, name, message }], не больше сотни.
    issues: model.json().nullable(),
    user_id: model.text().nullable(),
    // Имя загруженного файла (прогон из Excel).
    file_name: model.text().nullable(),
  })
  .indexes([{ on: ["tenant_id", "started_at"], where: "deleted_at IS NULL" }])

export default OnecSyncRun
