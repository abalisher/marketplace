import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import {
  createApiKeysWorkflow,
  createSalesChannelsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

// Первичная инициализация магазина на ЧИСТОЙ базе: канал продаж по умолчанию и
// публикуемый ключ витрины.
//
// Зачем отдельный скрипт. Раньше эти две сущности приезжали со стартерным сидом
// Medusa (`src/scripts/seed.ts`), но стартерный каталог из проекта вычищен
// (`cleanup-starter-catalog.ts`), а сам сид удалён — и на новой базе
// `seed-kz.ts` падает первым же шагом: «Default Sales Channel not found — run
// core seed first». Витрина без публикуемого ключа не поднимается вовсе
// (`storefront/check-env-variables.js` валит сборку). Так что для развёртывания
// с нуля этот шаг обязателен и идёт ПЕРЕД `seed-kz.ts`.
//
// Запуск: npx medusa exec ./src/scripts/bootstrap-store.ts
// Идемпотентен: существующие канал и ключ не пересоздаются, у ключа только
// досоздаётся привязка к каналу. Токен ключа печатается строкой
// `PUBLISHABLE_KEY=pk_...` — её читает скрипт развёртывания, чтобы вшить ключ в
// сборку витрины.
const SALES_CHANNEL_NAME = "Default Sales Channel"
const API_KEY_TITLE = "Default Publishable API Key"

export default async function bootstrapStore({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL)
  const apiKeyService = container.resolve(Modules.API_KEY)
  const storeService = container.resolve(Modules.STORE)

  // 1. Канал продаж по умолчанию: к нему привязываются склады, товары и
  // публикуемый ключ витрины.
  let [salesChannel] = await salesChannelService.listSalesChannels(
    { name: SALES_CHANNEL_NAME },
    { take: 1 }
  )
  if (salesChannel) {
    console.log(`— канал продаж уже есть: ${SALES_CHANNEL_NAME}`)
  } else {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: SALES_CHANNEL_NAME }] },
    })
    salesChannel = result[0]
    console.log(`+ канал продаж создан: ${SALES_CHANNEL_NAME} (${salesChannel.id})`)
  }

  // 2. Магазин указывает на этот канал как на дефолтный — иначе заказы и
  // корзины создаются без канала, и товары витрине не видны.
  const [store] = await storeService.listStores({}, { take: 1 })
  if (!store) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Магазин не найден — сначала прогоните миграции (npx medusa db:migrate)"
    )
  }
  if (store.default_sales_channel_id === salesChannel.id) {
    console.log("— дефолтный канал магазина уже проставлен")
  } else {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: { default_sales_channel_id: salesChannel.id },
      },
    })
    console.log(`+ дефолтный канал магазина: ${salesChannel.id}`)
  }

  // 3. Публикуемый ключ витрины (заголовок x-publishable-api-key). Ищем по
  // типу, а не по названию: ключ мог быть заведён руками из панели.
  const publishableKeys = await apiKeyService.listApiKeys(
    { type: "publishable" },
    { take: 1 }
  )
  let apiKey = publishableKeys[0]
  if (apiKey) {
    console.log(`— публикуемый ключ уже есть: ${apiKey.title}`)
  } else {
    const { result } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: API_KEY_TITLE,
            type: "publishable",
            created_by: "bootstrap-store",
          },
        ],
      },
    })
    apiKey = result[0]
    console.log(`+ публикуемый ключ создан: ${API_KEY_TITLE}`)
  }

  // 4. Привязка ключа к каналу: без неё Store API отвечает на запросы витрины
  // «Publishable key needs to have a sales channel configured».
  const { data: linked } = await query.graph({
    entity: "api_key",
    fields: ["id", "sales_channels.id"],
    filters: { id: apiKey.id },
  })
  const linkedChannelIds: string[] = (linked[0]?.sales_channels ?? [])
    .map((channel) => channel?.id)
    .filter((id): id is string => Boolean(id))

  if (linkedChannelIds.includes(salesChannel.id)) {
    console.log("— ключ уже привязан к каналу продаж")
  } else {
    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: { id: apiKey.id, add: [salesChannel.id] },
    })
    console.log("+ ключ привязан к каналу продаж")
  }

  // Строка для скрипта развёртывания: ключ вшивается в бандл витрины на сборке.
  console.log(`PUBLISHABLE_KEY=${apiKey.token}`)
}
