import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ASSEMBLY_MODULE } from "../modules/assembly"
import AssemblyModuleService from "../modules/assembly/service"
import { splitOrderAssemblyWorkflow } from "../workflows/split-order-assembly"

// Разложить на задания сборки заказы, оформленные ДО T10.11 (стенд наполняли
// раньше, чем появился распад). Новые заказы раскладывает подписчик на
// order.placed — этот скрипт нужен один раз для уже лежащих заказов.
//
// Берём только заказы в работе: у закрытых, доставленных и отменённых сборка
// уже позади, заводить им задания задним числом бессмысленно. Распад
// идемпотентен — повторный запуск ничего не дублирует.
//
// Запуск (по умолчанию только показывает план, ничего не меняет):
//   npx medusa exec ./src/scripts/split-existing-orders.ts
//   npx medusa exec ./src/scripts/split-existing-orders.ts apply

const PAGE = 50

// Стадии, на которых сборка ещё впереди (статусы order-lifecycle).
const OPEN_STATUSES = [
  "new",
  "confirmed",
  "assembling",
  "partially_assembled",
]

export default async function splitExistingOrders({
  container,
  args,
}: ExecArgs) {
  const apply = (args ?? []).includes("apply")
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const assembly = container.resolve<AssemblyModuleService>(ASSEMBLY_MODULE)

  console.log(
    apply
      ? "Режим: ПРИМЕНЕНИЕ изменений."
      : "Режим: сухой прогон (ничего не меняется). Добавьте аргумент apply, чтобы применить."
  )

  let offset = 0
  let split = 0
  let skipped = 0

  for (;;) {
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "display_id", "order_lifecycle.status"],
      pagination: { skip: offset, take: PAGE, order: { display_id: "ASC" } },
    })
    if (!orders.length) {
      break
    }
    offset += orders.length

    for (const order of orders as {
      id: string
      display_id?: number | null
      order_lifecycle?: { status: string } | null
    }[]) {
      const status = order.order_lifecycle?.status
      if (!status || !OPEN_STATUSES.includes(status)) {
        continue
      }

      const existing = await assembly.listAssemblyTasks({ order_id: order.id })
      if (existing.length) {
        skipped += 1
        continue
      }

      if (!apply) {
        console.log(`  заказ #${order.display_id ?? order.id} (${status}) — разложить`)
        split += 1
        continue
      }

      const { result } = await splitOrderAssemblyWorkflow(container).run({
        input: { order_id: order.id },
      })
      split += 1
      console.log(
        `+ заказ #${order.display_id ?? order.id}: ${result.tasks.length} ` +
          `задание(й) — ${result.tasks.map((t) => t.category_handle).join(", ")}`
      )
    }
  }

  console.log(
    `Итог: разложено ${split}, уже с заданиями ${skipped}.` +
      (apply ? "" : " (сухой прогон)")
  )
}
