import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
} from "@medusajs/framework/utils"
import { createUserAccountWorkflow } from "@medusajs/medusa/core-flows"
import {
  linkCatalogToChannel,
  provisionTenantChannel,
} from "../lib/tenants/provision"
import { TenantRole } from "../lib/tenants/scope"
import { ORDER_PREFIX_PATTERN } from "../lib/orders/order-number"
import { TENANT_MODULE } from "../modules/tenant"
import TenantModuleService from "../modules/tenant/service"
import { ONEC_MODULE } from "../modules/onec"
import OnecModuleService from "../modules/onec/service"

// Завести или обновить компанию-продавца на площадке (мультипродавец).
// Идемпотентно: повторный запуск с теми же данными ничего не ломает, с новыми —
// обновляет переданные поля карточки и цену доставки (не переданные остаются
// как есть; новой компании цена по умолчанию — 2000 ₸).
//
// Что делает:
//   1. канал продаж, склад, доставку с ценой компании и publishable key витрины
//      (lib/tenants/provision.ts);
//   2. карточку компании (реквизиты для документов, контакты для витрины);
//   3. продавца, сборщика и водителя панели — пользователей со связью
//      tenant ↔ user и ролью (seller | picker | driver): admin-API отдаёт им только данные канала
//      компании и только работу их роли (api/utils/tenant-access.ts);
//   4. весь опубликованный каталог — в канал компании (каталог и цены общие).
//
// Запуск (данные — из окружения, ничего секретного в коде):
//   TENANT_SLUG=orgstroy TENANT_NAME='ИП ORGSTROY' TENANT_BIN=790421300458 \
//   TENANT_ORDER_PREFIX=ORG \
//   TENANT_ADDRESS='г. Астана, …' TENANT_PHONE='+7 701 111 22 33' \
//   TENANT_BANK_NAME='АО «Kaspi Bank»' TENANT_BANK_BIK=CASPKZKA \
//   TENANT_BANK_IBAN=KZ… TENANT_DIRECTOR='…' TENANT_DELIVERY_PRICE=2000 \
//   TENANT_SELLER_EMAIL=seller-orgstroy@… TENANT_SELLER_PASSWORD=… \
//   TENANT_PICKER_EMAIL=picker-orgstroy@… TENANT_PICKER_PASSWORD=… \
//   TENANT_DRIVER_EMAIL=driver-orgstroy@… TENANT_DRIVER_PASSWORD=… \
//   npx medusa exec ./src/scripts/setup-tenant.ts
//
// Сборщиков у компании может быть несколько — запуск со следующим
// TENANT_PICKER_EMAIL добавляет ещё одного. TENANT_PICKER_GROUP (handle
// категории) ограничивает сборщика одной категорией; без него он собирает всё.
// Пароль нужен только при создании пользователя; у существующего не меняется и
// в лог не пишется.

const SLUG = /^[a-z0-9-]{1,64}$/

// Поле карточки компании ← переменная окружения.
const DETAIL_ENV = {
  bin: "TENANT_BIN",
  phone: "TENANT_PHONE",
  email: "TENANT_EMAIL",
  address: "TENANT_ADDRESS",
  logo_url: "TENANT_LOGO_URL",
  bank_name: "TENANT_BANK_NAME",
  bank_bik: "TENANT_BANK_BIK",
  bank_iban: "TENANT_BANK_IBAN",
  director_name: "TENANT_DIRECTOR",
  footer_note: "TENANT_FOOTER_NOTE",
  // Код компании в номере заказа («ORG» → ORG-26-0007), 2–4 латинские буквы.
  order_prefix: "TENANT_ORDER_PREFIX",
} as const

const env = (name: string): string | undefined => {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

const required = (name: string): string => {
  const value = env(name)
  if (!value) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `Не задан ${name}`)
  }
  return value
}

export default async function setupTenant({ container }: ExecArgs) {
  const log = (line: string) => console.log(line)

  const slug = required("TENANT_SLUG").toLowerCase()
  if (!SLUG.test(slug)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "TENANT_SLUG — латиница, цифры и дефис (до 64 символов)"
    )
  }
  const name = required("TENANT_NAME")
  const orderPrefix = env("TENANT_ORDER_PREFIX")
  if (orderPrefix !== undefined && !ORDER_PREFIX_PATTERN.test(orderPrefix)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "TENANT_ORDER_PREFIX — 2–4 заглавные латинские буквы (код в номере заказа)"
    )
  }
  const priceEnv = env("TENANT_DELIVERY_PRICE")
  const deliveryPrice = priceEnv === undefined ? undefined : Number(priceEnv)
  if (
    deliveryPrice !== undefined &&
    (!Number.isInteger(deliveryPrice) || deliveryPrice < 0)
  ) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "TENANT_DELIVERY_PRICE — целое число тенге"
    )
  }

  log(`=== Компания ${name} (${slug}) ===`)

  const channel = await provisionTenantChannel(
    container,
    { name, address: env("TENANT_ADDRESS"), delivery_price: deliveryPrice },
    log
  )

  const tenantService = container.resolve<TenantModuleService>(TENANT_MODULE)
  // Обновление меняет только переданные поля: запуск «добавить сборщика» не
  // должен стирать реквизиты компании.
  const details = Object.fromEntries(
    Object.entries(DETAIL_ENV)
      .map(([field, name]) => [field, env(name)] as const)
      .filter(([, value]) => value !== undefined)
  )
  const [existing] = await tenantService.listTenants({ slug }, { take: 1 })
  const tenant = existing
    ? await tenantService.updateTenants({
        id: existing.id,
        name,
        sales_channel_id: channel.sales_channel_id,
        ...details,
      })
    : await tenantService.createTenants({
        slug,
        status: "active",
        name,
        sales_channel_id: channel.sales_channel_id,
        ...details,
      })
  log(`${existing ? "—" : "+"} карточка компании: ${tenant.id}`)

  const sellerEmail = env("TENANT_SELLER_EMAIL")
  if (sellerEmail) {
    await ensureMember(container, tenant.id, sellerEmail, { role: "seller" }, log)
  }
  // Водитель: заказы компании в доставке и вручение по коду (/app/delivery).
  const driverEmail = env("TENANT_DRIVER_EMAIL")
  if (driverEmail) {
    await ensureMember(container, tenant.id, driverEmail, { role: "driver" }, log)
  }
  const pickerEmail = env("TENANT_PICKER_EMAIL")
  if (pickerEmail) {
    await ensureMember(
      container,
      tenant.id,
      pickerEmail,
      { role: "picker", assembly_group: env("TENANT_PICKER_GROUP") ?? "" },
      log
    )
  }

  // Компания, чей каталог ведёт её 1С (exclusive_catalog), общий каталог
  // площадки не получает: синхронизация всё равно убрала бы его из канала.
  const onecConnection = await container
    .resolve<OnecModuleService>(ONEC_MODULE)
    .getConnectionByTenant(tenant.id)
  if (onecConnection?.exclusive_catalog) {
    log("— каталог ведёт 1С компании: общий каталог площадки не подключаю")
  } else if (env("TENANT_LINK_CATALOG") !== "false") {
    await linkCatalogToChannel(container, channel.sales_channel_id, log)
  }

  log("Готово.")
}

const ROLE_TITLE: Record<TenantRole, string> = {
  seller: "продавец",
  picker: "сборщик",
  driver: "водитель",
}

const PASSWORD_ENV: Record<TenantRole, string> = {
  seller: "TENANT_SELLER_PASSWORD",
  picker: "TENANT_PICKER_PASSWORD",
  driver: "TENANT_DRIVER_PASSWORD",
}

// Пользователь панели компании: роль оболочки (+ группа сборщика) в metadata и
// связь с компанией. Связь у пользователя одна — прежняя (с другой компанией)
// снимается. Пустое значение в metadata ядро удаляет — так снимается группа.
async function ensureMember(
  container: ExecArgs["container"],
  tenantId: string,
  email: string,
  metadata: { role: TenantRole; assembly_group?: string },
  log: (line: string) => void
) {
  const userService = container.resolve(Modules.USER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const title = ROLE_TITLE[metadata.role]
  const passwordEnv = PASSWORD_ENV[metadata.role]

  let [user] = await userService.listUsers({ email }, { take: 1 })
  if (!user) {
    const password = required(passwordEnv)
    const registered = await container
      .resolve(Modules.AUTH)
      .register("emailpass", { body: { email, password } })
    if (!registered.success || !registered.authIdentity) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Не удалось создать вход для ${email}: ${registered.error}`
      )
    }
    const { result } = await createUserAccountWorkflow(container).run({
      input: {
        authIdentityId: registered.authIdentity.id,
        userData: { email, metadata },
      },
    })
    user = result
    log(`+ ${title}: ${email}`)
  } else {
    await userService.updateUsers({ id: user.id, metadata })
  }

  const { data } = await query.graph({
    entity: "user",
    fields: ["id", "tenant.id"],
    filters: { id: user.id },
  })
  const currentTenantId = (data[0] as { tenant?: { id: string } | null })?.tenant?.id
  if (currentTenantId === tenantId) {
    return
  }
  if (currentTenantId) {
    await link.dismiss({
      [TENANT_MODULE]: { tenant_id: currentTenantId },
      [Modules.USER]: { user_id: user.id },
    })
  }
  await link.create({
    [TENANT_MODULE]: { tenant_id: tenantId },
    [Modules.USER]: { user_id: user.id },
  })
  log(`+ ${email} — ${title} компании`)
}
