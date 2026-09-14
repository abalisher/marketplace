import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  capturePendingPayments,
  findPendingCaptures,
} from "../lib/payments/pending-captures"

// Диагностика и починка несписанных платежей (T4.14).
//
// Симптом, найденный Ф-прогоном 2026-08-18: у ВСЕХ оплаченных заказов
// `payment_collection.status = authorized`, `captured_amount = 0` — очередь
// показывала «Оплачен», а ядровая страница того же заказа «Остаток к оплате»,
// и продавцу оставалась кнопка «Получить платеж» для денег, которые он не
// проводил. С T4.14 оформление списывает платёж само
// (`workflows/steps/capture-order-payment.ts`); этот скрипт дожимает заказы,
// размещённые ДО правки, и служит отчётом, если capture в оформлении не прошёл.
//
// Запуск (флаги CLI до скрипта `medusa exec` не доходят — идиома проекта):
//   npx medusa exec ./src/scripts/check-order-captures.ts            — отчёт
//   CAPTURE=1 npx medusa exec ./src/scripts/check-order-captures.ts  — списать
export default async function checkOrderCaptures({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const capture = process.env.CAPTURE === "1"

  const pending = await findPendingCaptures(container)

  if (!pending.length) {
    logger.info("Несписанных авторизованных платежей нет.")
    return
  }

  logger.warn(`Платежей ждут списания: ${pending.length}`)
  for (const row of pending) {
    logger.warn(
      `  заказ №${row.display_id ?? row.order_id}: ${row.amount} ` +
        `${(row.currency_code ?? "").toUpperCase()} (${row.payment_id})`
    )
  }

  if (!capture) {
    logger.info("Отчёт без изменений. Списать: CAPTURE=1")
    return
  }

  const outcomes = await capturePendingPayments(container, pending)
  const failed = outcomes.filter((outcome) => outcome.error)

  logger.info(`Списано платежей: ${outcomes.length - failed.length}`)
  for (const { capture: row, error } of failed) {
    logger.error(`  ${row.payment_id} (заказ №${row.display_id}): ${error}`)
  }
}
