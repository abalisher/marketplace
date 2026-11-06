import { ExecArgs } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { TENANT_MODULE } from "../modules/tenant"
import TenantModuleService from "../modules/tenant/service"
import { OnecRequestError } from "../lib/onec/client"
import { decryptSecret } from "../lib/onec/secret"
import { runOnecSync, testOnecConnection } from "../lib/onec/sync"
import { upsertOnecConnectionWorkflow } from "../workflows/onec/upsert-onec-connection"

// Подключить компанию к её 1С (или обновить подключение) и проверить его.
// Данные — из окружения, пароль не печатается и в историю команд не попадает:
//
//   ONEC_TENANT_SLUG=orgstroy \
//   ONEC_URL=https://1cfresh.kz/a/ea60/107068/hs/items/getxtsitems \
//   [ONEC_STOCK_URL=https://1cfresh.kz/a/ea60/107068/hs/items/getitems] \
//   ONEC_LOGIN=... ONEC_PASSWORD=... \
//   [ONEC_ENABLED=true] [ONEC_INTERVAL=30] [ONEC_SYNC_NOW=true] \
//   npx medusa exec ./src/scripts/setup-onec.ts
//
// Без ONEC_PASSWORD сохранённый пароль остаётся прежним. ONEC_SYNC_NOW=true —
// сразу провести синхронизацию (иначе её проведёт расписание или кнопка в
// панели «Интеграция 1С»). То же самое продавец делает сам на экране панели.
const env = (key: string) => {
  const value = process.env[key]?.trim()
  return value ? value : undefined
}

export default async function setupOnec({ container }: ExecArgs) {
  const log = (message: string) => console.log(message)
  const slug = env("ONEC_TENANT_SLUG")
  if (!slug) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Задайте ONEC_TENANT_SLUG — slug компании"
    )
  }
  const tenants = container.resolve<TenantModuleService>(TENANT_MODULE)
  const [tenant] = await tenants.listTenants({ slug }, { take: 1 })
  if (!tenant) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Компания «${slug}» не найдена`)
  }

  const interval = env("ONEC_INTERVAL")
  const enabled = env("ONEC_ENABLED")
  const { result: connection } = await upsertOnecConnectionWorkflow(container).run({
    input: {
      tenant_id: tenant.id,
      base_url: env("ONEC_URL"),
      ...(process.env.ONEC_STOCK_URL !== undefined
        ? { stock_url: env("ONEC_STOCK_URL") ?? null }
        : {}),
      login: env("ONEC_LOGIN"),
      password: process.env.ONEC_PASSWORD || undefined,
      ...(enabled !== undefined ? { enabled: enabled === "true" } : {}),
      ...(interval !== undefined ? { interval_minutes: Number(interval) } : {}),
    },
    throwOnError: true,
  })
  log(
    `+ подключение 1С для «${tenant.name}»: ${connection.base_url}${connection.stock_url ? ` + остатки ${connection.stock_url}` : ""} (${connection.login}), расписание ${
      connection.enabled ? `каждые ${connection.interval_minutes} мин` : "выключено"
    }`
  )

  // Проверка: запрос и разбор без записи в каталог.
  try {
    // Скрипт заводит подключение к 1С (source = http): адрес, логин и пароль
    // у него обязательны — шаг сохранения без них не пропускает.
    const feed = await testOnecConnection({
      base_url: connection.base_url!,
      stock_url: connection.stock_url,
      login: connection.login!,
      password:
        process.env.ONEC_PASSWORD || decryptSecret(connection.password_cipher!),
    })
    log(
      `✓ 1С ответила за ${(feed.duration_ms / 1000).toFixed(1)} с: записей ${feed.total}, годных позиций ${feed.received}`
    )
    log(`  поля: ${JSON.stringify(feed.fields)}`)
    if (feed.stock) {
      log(
        `  остатки: строк ${feed.stock.received}, совпало с номенклатурой ${feed.stock.matched}, ${feed.stock.applied ? "применены" : "не применены"}`
      )
    }
    feed.sample.slice(0, 5).forEach((item) =>
      log(
        `  · ${item.name} [${item.article ?? item.code ?? item.key}] — ${item.price ?? "без цены"} ₸, остаток ${item.stock ?? "—"} ${item.unit ?? ""}`
      )
    )
    feed.issues.slice(0, 10).forEach((issue) =>
      log(`  ! ${issue.name ?? issue.key ?? ""}: ${issue.message}`)
    )
  } catch (error) {
    const message =
      error instanceof OnecRequestError
        ? `${error.code}: ${error.message}`
        : (error as Error)?.message
    log(`✗ проверка не прошла — ${message}`)
    return
  }

  if (env("ONEC_SYNC_NOW") === "true") {
    const run = await runOnecSync(container, {
      tenant_id: tenant.id,
      trigger: "manual",
    })
    log(
      `= синхронизация: ${run.status}${run.error ? ` (${run.error})` : ""} — получено ${run.received}, создано ${run.created}, обновлено ${run.updated}, снято ${run.hidden}, убрано из канала ${run.detached}, ошибок ${run.failed}`
    )
    run.issues.slice(0, 20).forEach((issue) =>
      log(`  ! ${issue.name ?? issue.key ?? ""}: ${issue.message}`)
    )
  }
}
