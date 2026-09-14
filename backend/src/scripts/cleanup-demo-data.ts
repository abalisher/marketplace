import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows"
import { ORDER_LIFECYCLE_MODULE } from "../modules/order-lifecycle"
import OrderLifecycleModuleService from "../modules/order-lifecycle/service"
import { DOCUMENTS_MODULE } from "../modules/documents"
import DocumentsModuleService from "../modules/documents/service"
import { BONUS_MODULE } from "../modules/bonus"
import BonusModuleService from "../modules/bonus/service"
import { COMPANY_MODULE } from "../modules/company"
import CompanyModuleService from "../modules/company/service"
import {
  findReserveDrift,
  repairReserveDrift,
} from "../lib/inventory/reconcile-reserves"
import { deleteEmployeeWorkflow } from "../workflows/delete-employee"

// Чистка стенда от демо- и тестового мусора (таск T7.2, находки фокус-группы
// панели T4.6): сотрудники читают его как рабочие данные — нечитаемые
// покупатели `sf-buyer-…@example.com`, товары «(demo)», склад в Копенгагене,
// заказы в евро, самовывоз по 0 ₸ (снят пивотом 2026-07-22), БИН из единиц.
//
// Что удаляется (каждый блок идемпотентен — повторный запуск ничего не находит):
//  1. тестовые заказы (маски email ниже) вместе с резервами, документами и
//     жизненным циклом; заказы живых прогонов (фокус-группа) сохраняются;
//  2. тестовые покупатели и их бонусные кошельки;
//  3. демо-товары «… (demo)» и «Demo Order Product» с их inventory-позициями;
//  4. склад «European Warehouse» (сид стартера) и его уровни остатков;
//  5. способы доставки стартера/самовывоза и их fulfillment-наборы —
//     остаётся единственный «Доставка по Астане» (см. риск set_delivery в STATE);
//  6. регион «Europe» (eur) — источник заказов в евро.
// Что правится, а не удаляется:
//  7. БИН демо-компаний (единицы/двойки/тройки → правдоподобный формат РК);
//  8. имена покупателей, которые панель показывает как машинные.
//
// Подготовка к показу 2026-09-07 (T12.1): к маскам добавлены сиды кадров
// кабинета (`cabinet-*`), смоуки T3.9/T3.11 и домен `@stroymarket.test`;
// заявки компаний удаляются ещё и по явным маркерам названия («Т214», «тест»).
//
// Осознанно НЕ трогаем: корзины и payment collection тестовых заказов (в панели
// не видны), auth-идентичности удалённых покупателей (без customer бесполезны).
//
// Запуск: npx medusa exec ./src/scripts/cleanup-demo-data.ts
//
// Заказы под удаление: фикстуры демо-сидов и машинные прогоны витрины/бонусов.
// Заказы ЖИВЫХ прогонов (фокус-группа) сохраняются — это единственные
// правдоподобные данные панели и артефакты отчётов (счёт INV-2026-000001).
const TEST_ORDER_EMAIL_PREFIXES = [
  "sf-buyer-",
  "e2e-bonus-",
  "demo-order-buyer@",
  "demo-methods-buyer@",
  // Сиды кадров кабинета покупателя (storefront/scripts/seed-cabinet-buyer.mjs)
  // и смоуки витрины: адрес машинный, состав заказа — фикстура. Сид пересоздаёт
  // их за секунды, поэтому чистке они не жалко (T12.1).
  "cabinet-stand-",
  "cabinet-smoke-",
  "cabinet-cart-",
  "cabinet-empty-",
  // Live-смоуки тасков T3.9 и T3.11 (заказ из ленты чата, степпер стадий).
  "t39.orders@",
  "t311.orders@",
]
// Заказы, которые нельзя удалять ни при какой маске (страховка от расширения
// масок выше: адрес живого прогона тоже машинный).
const PROTECTED_ORDER_EMAIL_PREFIXES = ["aigul.snab."]

// Покупатели под удаление: маски заказов выше + те, за кем заказов нет вовсе.
// Покупатель, за которым остался живой заказ, защищён проверкой по заказам.
const TEST_CUSTOMER_EMAIL_PREFIXES = [
  ...TEST_ORDER_EMAIL_PREFIXES,
  "probe-",
  "demo-bonus-buyer@",
  "nurlan.test@",
  "aigul.snab.",
]
// Домен смоуков заявок юрлица (T2.12/T2.14): покупатели `t212-…`, `t214-…`
// с нечитаемым именем — байты не в UTF-8, восстановить нечем (та же ловушка,
// что у названий компаний ниже). Компании этих заявок уже снесены прошлой
// чисткой, покупатели остались (T12.1).
const TEST_CUSTOMER_EMAIL_DOMAINS = ["@stroymarket.test"]
const TEST_CUSTOMER_EMAILS_EXACT = [
  "ivan@example.com",
  "dmitry@test.kz",
  "erlan@test.kz",
  "ерлан@mail.ru",
]

// Демо-товары: сид стартера и фикстура заказов.
const DEMO_PRODUCT_TITLE_MARKERS = ["(demo)", "Demo Order Product"]

// Склад сида стартера — не наш город, учёта на нём нет.
const STARTER_STOCK_LOCATION = "European Warehouse"

// Способы получения вне активного пути: самовывоз снят пивотом 2026-07-22,
// остальное — сид стартера и фикстура демо-заказов.
const DEAD_SHIPPING_OPTIONS = [
  "Standard Shipping",
  "Express Shipping",
  "Demo Standard",
  "Самовывоз: Склад Астана — Центр",
  "Самовывоз: Склад Астана — Промзона",
]
const DEAD_FULFILLMENT_SETS = [
  "European Warehouse delivery",
  "Demo Delivery",
  "Pickup — Склад Астана — Центр",
  "Pickup — Склад Астана — Промзона",
]

const STARTER_REGION = "Europe"

// Компании live-смоуков: заявка заводится store-роутом и удаляется только
// отсюда (admin-роута удаления компании нет). Маркеры явные — по названию,
// чтобы чистка не выкосила настоящую заявку с похожим именем (T12.1).
const TEST_COMPANY_NAME_MARKERS = ["Т214", "Т212", "test", "тест", "смоук"]

// БИН РК: 12 цифр — ГГММ регистрации, 5-я цифра тип (4 — резидент-юрлицо,
// 6 — ИП), 6-я — головная организация (0), далее порядковый номер.
const COMPANY_BIN_FIX: Record<string, string> = {
  "111111111111": "180440018374",
  "222222222222": "200540027461",
  "333333333333": "210640031958",
  // Заглушка live-смоука 2026-08-18: 12 цифр подряд читаются как «данные
  // не настоящие» (T12.1).
  "123456789012": "220340042763",
}

// Покупатели, которых панель показывает машинно (пустое или битое имя).
const CUSTOMER_NAME_FIX: Record<
  string,
  { first_name: string; last_name: string; phone?: string }
> = {
  "buyer@demo.kz": {
    first_name: "Арман",
    last_name: "Тулеуов",
    phone: "+7 701 000 12 34",
  },
  // Покупатели Ф-прогонов 2026-08-11/13: заказы №34 и №38 — живые данные
  // (удалять нельзя), но имя у покупателя пустое, и очередь панели показывает
  // адрес вместо человека (T12.1).
  "alisher@example.com": {
    first_name: "Алишер",
    last_name: "Акимжанов",
    phone: "+7 701 000 22 41",
  },
  "marat@example.com": {
    first_name: "Марат",
    last_name: "Сериков",
    phone: "+7 701 000 33 52",
  },
}

export default async function cleanupDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const orderService = container.resolve(Modules.ORDER)
  const customerService = container.resolve(Modules.CUSTOMER)
  const inventoryService = container.resolve(Modules.INVENTORY)
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION)
  const fulfillmentService = container.resolve(Modules.FULFILLMENT)
  const regionService = container.resolve(Modules.REGION)
  const productService = container.resolve(Modules.PRODUCT)
  const lifecycleService = container.resolve<OrderLifecycleModuleService>(
    ORDER_LIFECYCLE_MODULE
  )
  const documentsService =
    container.resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
  const bonusService = container.resolve<BonusModuleService>(BONUS_MODULE)
  const companyService =
    container.resolve<CompanyModuleService>(COMPANY_MODULE)

  const isTestOrderEmail = (email?: string | null) => {
    if (!email) {
      return false
    }
    const value = email.toLowerCase()
    if (PROTECTED_ORDER_EMAIL_PREFIXES.some((p) => value.startsWith(p))) {
      return false
    }
    return TEST_ORDER_EMAIL_PREFIXES.some((prefix) => value.startsWith(prefix))
  }

  const isTestCustomerEmail = (email?: string | null) => {
    if (!email) {
      return false
    }
    const value = email.toLowerCase()
    return (
      TEST_CUSTOMER_EMAIL_PREFIXES.some((prefix) => value.startsWith(prefix)) ||
      TEST_CUSTOMER_EMAIL_DOMAINS.some((domain) => value.endsWith(domain)) ||
      TEST_CUSTOMER_EMAILS_EXACT.includes(value)
    )
  }

  // --- 1. Тестовые заказы -------------------------------------------------
  const { data: allOrders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "email", "items.id"],
  })
  const doomedOrders = (
    allOrders as {
      id: string
      display_id: number | string
      email?: string
      items?: { id: string }[]
    }[]
  ).filter((order) => isTestOrderEmail(order.email))

  if (!doomedOrders.length) {
    logger.info("Тестовых заказов нет — пропускаю.")
  } else {
    const orderIds = doomedOrders.map((o) => o.id)
    const lineItemIds = doomedOrders.flatMap((o) =>
      (o.items ?? []).map((i) => i.id)
    )

    // Резервы: без них удалённый заказ держит остаток и оставляет пустой
    // «ID заказа» в резервациях (блокер кладовщика в T4.6).
    if (lineItemIds.length) {
      const reservations = await inventoryService.listReservationItems(
        { line_item_id: lineItemIds },
        { select: ["id"] }
      )
      if (reservations.length) {
        await inventoryService.deleteReservationItems(
          reservations.map((r) => r.id)
        )
        logger.info(`Удалено резервов: ${reservations.length}`)
      }
    }

    // Документы (счёт/АВР/накладная) удалённых заказов.
    const documents = await documentsService.listDocuments(
      { order_id: orderIds },
      { select: ["id", "number"] }
    )
    if (documents.length) {
      await documentsService.deleteDocuments(documents.map((d) => d.id))
      logger.info(
        `Удалено документов: ${documents.map((d) => d.number).join(", ")}`
      )
    }

    // Жизненный цикл заказа (кастомный модуль) + линк на заказ: без этого
    // очередь панели строит строки на осиротевших циклах.
    const { data: withLifecycle } = await query.graph({
      entity: "order",
      fields: ["id", "order_lifecycle.id"],
      filters: { id: orderIds },
    })
    const lifecycleIds = (
      withLifecycle as { order_lifecycle?: { id: string } | null }[]
    )
      .map((row) => row.order_lifecycle?.id)
      .filter((id): id is string => Boolean(id))
    if (lifecycleIds.length) {
      // Лог переходов удаляем первым: связь hasMany объявлена без каскада, и
      // удаление цикла с живыми событиями падает («tried to set relationship
      // id … but such entity does not exist»).
      const events = await lifecycleService.listOrderLifecycleEvents(
        { order_lifecycle_id: lifecycleIds },
        { select: ["id"] }
      )
      if (events.length) {
        await lifecycleService.deleteOrderLifecycleEvents(
          events.map((e) => e.id)
        )
      }
      // Линк может ссылаться на уже удалённый цикл — удаляем только
      // существующие, осиротевшие линки снимутся ниже вместе с линками заказа.
      const existingLifecycles = await lifecycleService.listOrderLifecycles(
        { id: lifecycleIds },
        { select: ["id"] }
      )
      if (existingLifecycles.length) {
        await lifecycleService.deleteOrderLifecycles(
          existingLifecycles.map((l) => l.id)
        )
      }
      logger.info(
        `Удалено жизненных циклов: ${existingLifecycles.length} (событий: ${events.length})`
      )
    }

    // Линки заказа (жизненный цикл, компания, бонусные транзакции).
    for (const orderId of orderIds) {
      await link.delete({ [Modules.ORDER]: { order_id: orderId } })
    }

    await orderService.softDeleteOrders(orderIds)
    logger.info(
      `Удалено тестовых заказов: ${doomedOrders
        .map((o) => `№${o.display_id}`)
        .join(", ")}`
    )
  }

  // --- 2. Тестовые покупатели --------------------------------------------
  // Покупателя, за которым остался живой заказ, не удаляем ни при какой маске:
  // иначе в панели у заказа исчезнет плательщик.
  const { data: liveOrders } = await query.graph({
    entity: "order",
    fields: ["id", "customer_id"],
  })
  const protectedCustomerIds = new Set(
    (liveOrders as { customer_id?: string | null }[])
      .map((o) => o.customer_id)
      .filter((id): id is string => Boolean(id))
  )

  const allCustomers = await customerService.listCustomers(
    {},
    { select: ["id", "email"] }
  )
  const doomedCustomers = allCustomers.filter(
    (c) => isTestCustomerEmail(c.email) && !protectedCustomerIds.has(c.id)
  )
  if (!doomedCustomers.length) {
    logger.info("Тестовых покупателей нет — пропускаю.")
  } else {
    const customerIds = doomedCustomers.map((c) => c.id)

    // Бонусный кошелёк (кастомный модуль) + линк на покупателя.
    const { data: withBonus } = await query.graph({
      entity: "customer",
      fields: ["id", "bonus_account.id"],
      filters: { id: customerIds },
    })
    const bonusAccountIds = (
      withBonus as { bonus_account?: { id: string } | null }[]
    )
      .map((row) => row.bonus_account?.id)
      .filter((id): id is string => Boolean(id))
    if (bonusAccountIds.length) {
      const transactions = await bonusService.listBonusTransactions(
        { account_id: bonusAccountIds },
        { select: ["id"] }
      )
      if (transactions.length) {
        await bonusService.deleteBonusTransactions(
          transactions.map((t) => t.id)
        )
      }
      await bonusService.deleteBonusAccounts(bonusAccountIds)
      logger.info(`Удалено бонусных кошельков: ${bonusAccountIds.length}`)
    }
    for (const customerId of customerIds) {
      await link.delete({ [Modules.CUSTOMER]: { customer_id: customerId } })
    }

    await customerService.deleteCustomers(customerIds)
    logger.info(`Удалено тестовых покупателей: ${customerIds.length}`)
  }

  // --- 3. Демо-товары ----------------------------------------------------
  const allProducts = await productService.listProducts(
    {},
    { select: ["id", "title"] }
  )
  const doomedProducts = allProducts.filter((p) =>
    DEMO_PRODUCT_TITLE_MARKERS.some((marker) =>
      (p.title ?? "").toLowerCase().includes(marker.toLowerCase())
    )
  )
  if (!doomedProducts.length) {
    logger.info("Демо-товаров нет — пропускаю.")
  } else {
    // inventory-позиции вариантов: удалением товара ядро их не сносит,
    // и они остаются в «Складе» без названия (блокер кладовщика в T4.6).
    const { data: withInventory } = await query.graph({
      entity: "product",
      fields: ["id", "variants.inventory_items.inventory.id"],
      filters: { id: doomedProducts.map((p) => p.id) },
    })
    const inventoryItemIds = (
      withInventory as {
        variants?: { inventory_items?: { inventory?: { id: string } }[] }[]
      }[]
    ).flatMap((product) =>
      (product.variants ?? []).flatMap((variant) =>
        (variant.inventory_items ?? [])
          .map((item) => item.inventory?.id)
          .filter((id): id is string => Boolean(id))
      )
    )

    await deleteProductsWorkflow(container).run({
      input: { ids: doomedProducts.map((p) => p.id) },
      throwOnError: true,
    })
    if (inventoryItemIds.length) {
      await inventoryService.deleteInventoryItems(inventoryItemIds)
    }
    logger.info(
      `Удалено демо-товаров: ${doomedProducts.map((p) => p.title).join(", ")}`
    )
  }

  // --- 4. Склад сида стартера --------------------------------------------
  const [starterLocation] = await stockLocationService.listStockLocations(
    { name: STARTER_STOCK_LOCATION },
    { take: 1, select: ["id", "name"] }
  )
  if (!starterLocation) {
    logger.info(`Склада «${STARTER_STOCK_LOCATION}» нет — пропускаю.`)
  } else {
    const levels = await inventoryService.listInventoryLevels(
      { location_id: starterLocation.id },
      { select: ["id"] }
    )
    if (levels.length) {
      await inventoryService.deleteInventoryLevels(levels.map((l) => l.id))
    }
    await link.delete({
      [Modules.STOCK_LOCATION]: { stock_location_id: starterLocation.id },
    })
    await stockLocationService.deleteStockLocations([starterLocation.id])
    logger.info(
      `Удалён склад «${STARTER_STOCK_LOCATION}» (уровней остатка: ${levels.length})`
    )
  }

  // --- 5. Мёртвые способы получения --------------------------------------
  const deadOptions = await fulfillmentService.listShippingOptions(
    { name: DEAD_SHIPPING_OPTIONS },
    { select: ["id", "name"] }
  )
  if (deadOptions.length) {
    await fulfillmentService.deleteShippingOptions(deadOptions.map((o) => o.id))
    logger.info(
      `Удалено способов доставки: ${deadOptions.map((o) => o.name).join(", ")}`
    )
  } else {
    logger.info("Мёртвых способов доставки нет — пропускаю.")
  }

  const deadSets = await fulfillmentService.listFulfillmentSets(
    { name: DEAD_FULFILLMENT_SETS },
    { select: ["id", "name"] }
  )
  if (deadSets.length) {
    for (const set of deadSets) {
      await link.delete({ [Modules.FULFILLMENT]: { fulfillment_set_id: set.id } })
    }
    await fulfillmentService.deleteFulfillmentSets(deadSets.map((s) => s.id))
    logger.info(
      `Удалено fulfillment-наборов: ${deadSets.map((s) => s.name).join(", ")}`
    )
  }

  // --- 6. Регион стартера -------------------------------------------------
  const [starterRegion] = await regionService.listRegions(
    { name: STARTER_REGION },
    { take: 1, select: ["id", "name"] }
  )
  if (!starterRegion) {
    logger.info(`Региона «${STARTER_REGION}» нет — пропускаю.`)
  } else {
    const { data: regionOrders } = await query.graph({
      entity: "order",
      fields: ["id", "display_id"],
      filters: { region_id: starterRegion.id },
    })
    if (regionOrders.length) {
      logger.warn(
        `Регион «${STARTER_REGION}» оставлен: на нём висят заказы ${(
          regionOrders as { display_id: number | string }[]
        )
          .map((o) => `№${o.display_id}`)
          .join(", ")}`
      )
    } else {
      await regionService.deleteRegions([starterRegion.id])
      logger.info(`Удалён регион «${STARTER_REGION}» (eur)`)
    }
  }

  // --- 7. БИН демо-компаний ----------------------------------------------
  const companies = await companyService.listCompanies(
    {},
    { select: ["id", "name", "bin"] }
  )
  const binFixes = companies.filter((c) => COMPANY_BIN_FIX[c.bin])
  for (const company of binFixes) {
    await companyService.updateCompanies({
      id: company.id,
      bin: COMPANY_BIN_FIX[company.bin],
    })
    logger.info(
      `БИН исправлен: ${company.name} ${company.bin} → ${
        COMPANY_BIN_FIX[company.bin]
      }`
    )
  }
  if (!binFixes.length) {
    logger.info("БИН-заглушек нет — пропускаю.")
  }

  // Нечитаемые названия компаний: заявки живых прогонов, где клиент прислал
  // байты не в UTF-8 (капкан кодировки Git Bash), — в очереди модерации они
  // выглядят как «??? ?214 ?????», и одобрять их вслепую нельзя (находка
  // Ф-прогона 2026-08-18). Восстановить текст нечем: исходные байты потеряны
  // при разборе JSON, в БД лежит символ замены. Приём такого имени закрыт
  // валидатором store-роута, старые записи убираем здесь.
  // Плюс заявки live-смоуков по явным маркерам названия (T12.1): у них тот же
  // путь удаления — сотрудники, затем компания.
  const unreadable = companies.filter(
    (c) =>
      c.name?.includes("�") ||
      TEST_COMPANY_NAME_MARKERS.some((marker) =>
        c.name?.toLowerCase().includes(marker.toLowerCase())
      )
  )
  if (!unreadable.length) {
    logger.info("Нечитаемых и тестовых названий компаний нет — пропускаю.")
  } else {
    // Удаление строго снизу вверх (сотрудники → компания) и через workflow:
    // он снимает link сотрудник↔customer, а hard-delete родителя с живыми
    // детьми падает на каскаде (идиома demo-company.ts).
    for (const company of unreadable) {
      // withDeleted: повторный запуск после сбоя видит уже мягко удалённых —
      // иначе они останутся висеть и снова уронят каскад.
      const employees = await companyService.listEmployees(
        { company_id: company.id },
        { select: ["id", "deleted_at"], withDeleted: true }
      )
      for (const employee of employees) {
        if (!employee.deleted_at) {
          await deleteEmployeeWorkflow(container).run({
            input: { id: employee.id },
          })
        }
      }
      if (employees.length) {
        await companyService.deleteEmployees(employees.map((e) => e.id))
      }
      await companyService.deleteCompanies(company.id)
    }
    logger.info(
      `Удалено заявок (нечитаемое/тестовое название): ${unreadable.length}`
    )
  }

  // --- 8. Машинные имена покупателей -------------------------------------
  const nameFixEmails = Object.keys(CUSTOMER_NAME_FIX)
  const nameFixCandidates = await customerService.listCustomers(
    { email: nameFixEmails },
    { select: ["id", "email", "first_name", "last_name"] }
  )
  for (const customer of nameFixCandidates) {
    const fix = CUSTOMER_NAME_FIX[customer.email!]
    if (!fix || customer.first_name === fix.first_name) {
      continue
    }
    await customerService.updateCustomers(customer.id, fix)
    logger.info(
      `Имя покупателя исправлено: ${customer.email} → ${fix.first_name} ${fix.last_name}`
    )
  }

  // Покупатели живых прогонов: у панели должно быть человеческое имя.
  const liveRunCustomers = await customerService.listCustomers(
    {},
    { select: ["id", "email", "first_name", "last_name"] }
  )
  for (const customer of liveRunCustomers) {
    if (!customer.email?.startsWith("aigul.snab.")) {
      continue
    }
    if (customer.first_name && customer.last_name) {
      continue
    }
    await customerService.updateCustomers(customer.id, {
      first_name: "Айгуль",
      last_name: "Смагулова",
    })
    logger.info(`Имя покупателя дополнено: ${customer.email}`)
  }

  // Сверка резервов ПОСЛЕ массового удаления резерваций (T4.16). Удаление
  // резервации уже отгруженного заказа вычитает количество второй раз, и
  // резерв уходит в минус — так на стенде появилось «Зарезервировано: −8» у
  // цемента (блокер Ф-прогона 2026-08-18). Чистка обязана убирать за собой:
  // иначе склад врёт до тех пор, пока это не заметит человек.
  const drift = await findReserveDrift(container)
  if (drift.length) {
    await repairReserveDrift(container, drift)
    logger.info(`Резервы выправлены после чистки: ${drift.length} уровн.`)
  }

  logger.info("Чистка демо-данных завершена.")
}
