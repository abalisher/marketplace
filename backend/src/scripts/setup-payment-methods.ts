import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows"
import { PAYMENT_PROVIDER_IDS } from "../lib/payments/providers"

// Подключить способы оплаты к регионам магазина: Kaspi QR, перевод на номер
// Kaspi и «в долг» (payment-offline). Без провайдера у региона ядро не создаст
// платёжную сессию способа. Идемпотентно — шаг выкладки после миграций:
//
//   npx medusa exec ./src/scripts/setup-payment-methods.ts
//
// Какие способы принимает конкретный продавец, решают его настройки оплаты
// (экран «Оплаты и долги» → «Способы оплаты»); без настроек — только Kaspi QR.
export default async function setupPaymentMethods({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "payment_providers.id"],
  })

  for (const region of regions as {
    id: string
    name: string
    payment_providers?: { id: string }[] | null
  }[]) {
    const current = (region.payment_providers ?? []).map((p) => p.id)
    const missing = PAYMENT_PROVIDER_IDS.filter((id) => !current.includes(id))
    if (!missing.length) {
      console.log(`— ${region.name}: способы оплаты уже подключены`)
      continue
    }
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: { payment_providers: [...current, ...missing] },
      },
    })
    console.log(`+ ${region.name}: подключены ${missing.join(", ")}`)
  }
}
