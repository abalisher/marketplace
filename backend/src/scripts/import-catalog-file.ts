import { readFileSync } from "node:fs"
import { basename } from "node:path"
import { ExecArgs } from "@medusajs/framework/types"
import { MedusaError } from "@medusajs/framework/utils"
import { TENANT_MODULE } from "../modules/tenant"
import TenantModuleService from "../modules/tenant/service"
import { readOnecFile } from "../lib/onec/file-feed"
import { feedSummary, runOnecSync } from "../lib/onec/sync"
import { ONEC_MODULE } from "../modules/onec"
import OnecModuleService from "../modules/onec/service"
import { upsertOnecConnectionWorkflow } from "../workflows/onec/upsert-onec-connection"

// Каталог компании без 1С из Excel-файла — то же, что кнопка «Загрузить в
// каталог» на экране «1С и Excel», но из консоли:
//
//   TENANT_SLUG=companyb [CATALOG_FILE=/tmp/catalog.xlsx] \
//   [CATALOG_APPLY=true] npx medusa exec ./src/scripts/import-catalog-file.ts
//
// Без CATALOG_FILE — только переключить компанию на каталог из Excel (завести
// файловое подключение). С файлом без CATALOG_APPLY=true — разобрать и
// показать, что понято, ничего не записывая.
const env = (key: string) => {
  const value = process.env[key]?.trim()
  return value ? value : undefined
}

export default async function importCatalogFile({ container }: ExecArgs) {
  const log = (message: string) => console.log(message)
  const slug = env("TENANT_SLUG")
  if (!slug) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Задайте TENANT_SLUG")
  }
  const [tenant] = await container
    .resolve<TenantModuleService>(TENANT_MODULE)
    .listTenants({ slug }, { take: 1 })
  if (!tenant) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, `Компания «${slug}» не найдена`)
  }

  const service = container.resolve<OnecModuleService>(ONEC_MODULE)
  const existing = await service.getConnectionByTenant(tenant.id)
  if (existing && existing.source !== "file") {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Каталог «${tenant.name}» ведёт её 1С — файл не загружается`
    )
  }
  const { result: connection } = await upsertOnecConnectionWorkflow(container).run({
    input: {
      tenant_id: tenant.id,
      source: "file",
    },
    throwOnError: true,
  })
  log(`${existing ? "—" : "+"} каталог «${tenant.name}» из Excel-файла`)

  const path = env("CATALOG_FILE")
  if (!path) {
    return
  }
  const fileName = basename(path)
  const feed = readOnecFile(readFileSync(path), fileName)
  const summary = feedSummary(feed)
  log(
    `Файл «${fileName}», лист «${summary.sheet}», заголовки в строке ${summary.header_row}: годных позиций ${summary.received} из ${summary.total}`
  )
  log(`  колонки: ${JSON.stringify(summary.fields)}`)
  summary.sample.slice(0, 5).forEach((item) =>
    log(
      `  · ${item.name} [${item.article ?? item.code ?? item.key}] — ${item.price ?? "без цены"} ₸, остаток ${item.stock ?? "—"} ${item.unit ?? ""}`
    )
  )
  summary.issues.forEach((issue) =>
    log(`  ! ${[issue.name, issue.key].filter(Boolean).join(" · ")} ${issue.message}`)
  )
  if (env("CATALOG_APPLY") !== "true") {
    log("Проверка без записи. Загрузить в каталог — CATALOG_APPLY=true.")
    return
  }
  const run = await runOnecSync(container, {
    tenant_id: tenant.id,
    trigger: "file",
    feed,
    file_name: fileName,
  })
  log(
    `${run.status}: создано ${run.created}, обновлено ${run.updated}, без изменений ${run.unchanged}, снято ${run.hidden}, убрано из канала ${run.detached}, ошибок ${run.failed}${run.error ? ` — ${run.error}` : ""}`
  )
  run.issues.slice(0, 20).forEach((issue) =>
    log(`  ! ${[issue.name, issue.key].filter(Boolean).join(" · ")} ${issue.message}`)
  )
}
