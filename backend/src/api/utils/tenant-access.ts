import type {
  MedusaNextFunction,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { ASSEMBLY_MODULE } from "../../modules/assembly"
import AssemblyModuleService from "../../modules/assembly/service"
import { DOCUMENTS_MODULE } from "../../modules/documents"
import DocumentsModuleService from "../../modules/documents/service"
import { REVIEWS_MODULE } from "../../modules/reviews"
import ReviewsModuleService from "../../modules/reviews/service"
import {
  TenantRole,
  TenantScope,
  loadTenantCustomerIds,
  loadChannelStockLocationIds,
  loadUserTenant,
  orderBelongsToChannel,
} from "../../lib/tenants/scope"

// Разграничение доступа пользователей компаний в admin-API (мультипродавец).
//
// В OSS-ядре Medusa прав у admin-пользователей нет: любой пользователь панели
// видит и меняет всё. Сотрудник площадки так и работает, а пользователь компании
// (связь tenant ↔ user) должен видеть только свой канал продаж — и только свою
// работу: продавец ведёт заказ (подтверждение, отмена, перенос, вручение,
// закрытие), сборщик собирает и отгружает, водитель вручает по коду.
//
// Правило — БЕЛЫЙ СПИСОК по ролям: пользователю компании открыты только
// перечисленные ниже адреса его роли, всё остальное (настройки, ключи API,
// закуп, водители, ядровые операции над заказами…) — 403. Новый роут закрыт,
// пока его сюда не внесут осознанно. Любой сбой проверки — отказ, а не доступ.
//
// Виды правил:
// - public — данных компаний в ответе нет (справочники);
// - products_list — ядровый список товаров только канала компании (каталоги
//   компаний раздельные: товары 1С/Excel живут только в своём канале);
// - product — `:id` товара должен быть в канале компании, иначе 404;
// - scoped — роут сам режет выборку по getTenantScope(req);
// - order / document / dispute / customer / assembly_task — `:id` в пути должен
//   принадлежать каналу компании, иначе 404 (как на несуществующий);
// - order_query — ядровый список по `?order_id=` заказа компании;
// - orders_list / customers_list — ядровый список, фильтр подставляется здесь
//   (клиенты — с заказами компании или заведённые ею, links/tenant-customer.ts)
//   (до ядрового валидатора — middleware регистрируется раньше роутов);
// - own_user — свой профиль без метаданных;
// - stock_locations_list / stock_location — только склады канала компании;
// - notifications — общая лента площадки, компании отдаём пустую.
//
// Из `?fields=` любого GET вырезаются остатки (STOCK_FIELD): каталог общий, а
// остатки по складам — данные конкретных компаний.

type RuleKind =
  | "public"
  | "scoped"
  | "order"
  | "document"
  | "dispute"
  | "customer"
  | "assembly_task"
  | "order_query"
  | "orders_list"
  | "customers_list"
  | "products_list"
  | "product"
  | "own_user"
  | "stock_locations_list"
  | "stock_location"
  | "notifications"

type Rule = {
  methods: readonly string[]
  pattern: RegExp
  kind: RuleKind
  roles: readonly TenantRole[]
}

const GET = ["GET"] as const
const POST = ["POST"] as const
const ANY = ["GET", "POST", "DELETE"] as const

// Оболочка панели — всем ролям; рабочие разделы склада — продавцу и сборщику.
const ALL: readonly TenantRole[] = ["seller", "picker", "driver"]
const STAFF: readonly TenantRole[] = ["seller", "picker"]
const SELLER: readonly TenantRole[] = ["seller"]
const PICKER: readonly TenantRole[] = ["picker"]
const DRIVER: readonly TenantRole[] = ["driver"]

// "/admin/orders/:id/lifecycle/*" → регулярное выражение. `:id` — один сегмент,
// хвостовой `/*` — сам адрес и всё под ним.
const compile = (pattern: string): RegExp => {
  const tail = pattern.endsWith("/*")
  const body = (tail ? pattern.slice(0, -2) : pattern)
    .split("/")
    .map((segment) =>
      segment.startsWith(":")
        ? "([^/]+)"
        : segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    )
    .join("/")
  return new RegExp(`^${body}${tail ? "(?:/.*)?" : ""}/?$`)
}

const rule = (
  methods: readonly string[],
  pattern: string,
  kind: RuleKind,
  roles: readonly TenantRole[] = SELLER
): Rule => ({ methods, pattern: compile(pattern), kind, roles })

// Порядок важен: побеждает первое совпадение среди правил роли.
export const TENANT_RULES: readonly Rule[] = [
  // Оболочка панели и справочники без данных компаний.
  rule(GET, "/admin/users/me", "public", ALL),
  rule(POST, "/admin/users/:id", "own_user", ALL),
  rule(GET, "/admin/stores/*", "public", ALL),
  rule(GET, "/admin/feature-flags", "public", ALL),
  rule(GET, "/admin/notifications", "notifications", ALL),
  rule(GET, "/admin/notifications/:id", "notifications", ALL),
  rule(GET, "/admin/regions/*", "public"),
  rule(GET, "/admin/currencies/*", "public"),
  rule(GET, "/admin/locales/*", "public", ALL),
  rule(GET, "/admin/views/*", "public"),
  rule(GET, "/admin/price-preferences/*", "public"),
  rule(GET, "/admin/shipping-options/*", "public"),
  rule(GET, "/admin/shipping-profiles/*", "public"),
  rule(GET, "/admin/stock-locations", "stock_locations_list"),
  rule(GET, "/admin/stock-locations/:id/*", "stock_location"),
  // Товары — только своего канала: каталоги компаний раздельные (1С, Excel),
  // чужие товары продавец не видит ни списком, ни по ссылке. Ядровый список
  // вариантов фильтра по каналу не знает — он закрыт (нужен ядру только для
  // обменов и претензий, а их продавец не создаёт).
  rule(GET, "/admin/products", "products_list"),
  rule(GET, "/admin/products/:id/*", "product"),
  rule(GET, "/admin/product-categories/*", "public", STAFF),
  rule(GET, "/admin/collections/*", "public"),
  rule(GET, "/admin/product-types/*", "public"),
  rule(GET, "/admin/product-tags/*", "public"),

  // Своя компания и роль в ней (шапка и оболочка панели).
  rule(GET, "/admin/tenant", "scoped", ALL),

  // Сборщик: задания сборки своей компании и отгрузка собранного.
  rule(GET, "/admin/assembly-tasks", "scoped", PICKER),
  rule(ANY, "/admin/assembly-tasks/:id/*", "assembly_task", PICKER),
  rule(GET, "/admin/shipping-queue", "scoped", PICKER),
  rule(POST, "/admin/orders/:id/lifecycle/ship", "order", PICKER),
  rule(GET, "/admin/orders/:id/lifecycle/card", "order", PICKER),

  // Водитель: заказы своей компании в доставке и вручение по коду получения
  // (код проверяет переход delivered). Остальное в заказе ему закрыто.
  rule(GET, "/admin/delivery-queue", "scoped", DRIVER),
  rule(POST, "/admin/orders/:id/lifecycle/deliver", "order", DRIVER),

  // Продавец: дашборд, очередь, документы, претензии, отзывы, цены и
  // остатки. Роуты фильтруют выборку сами.
  rule(GET, "/admin/dashboard", "scoped"),
  rule(GET, "/admin/order-lifecycles", "scoped"),
  rule(GET, "/admin/documents", "scoped"),
  rule(POST, "/admin/documents/:id/mark-sent", "document"),
  rule(GET, "/admin/disputes", "scoped"),
  rule(POST, "/admin/disputes", "scoped"),
  rule(ANY, "/admin/disputes/:id/*", "dispute"),
  // Отзывы о заказах компании — и продавцу, и сборщику (он тоже отвечает за
  // заказ); только чтение: модерация — у площадки.
  rule(GET, "/admin/reviews", "scoped", STAFF),
  rule(GET, "/admin/reviews/summary", "scoped", STAFF),
  // Остатки своих складов — и продавцу, и сборщику (склад — его работа); цену
  // компания не меняет (price_locked).
  rule([...GET, ...POST], "/admin/price-stock", "scoped", STAFF),
  rule(GET, "/admin/price-stock/export", "scoped", STAFF),
  rule(POST, "/admin/price-stock/import", "scoped", STAFF),
  rule(GET, "/admin/price-stock/history", "scoped", STAFF),
  // Подключение к своей 1С и запуск синхронизации — продавец компании; роут
  // сам берёт компанию из области запроса.
  rule([...GET, ...POST], "/admin/onec", "scoped"),
  rule(POST, "/admin/onec/check", "scoped"),
  rule(POST, "/admin/onec/sync", "scoped"),
  // Excel-файл каталога своей компании (компания — по входу, не из тела).
  rule(POST, "/admin/onec/file", "scoped"),
  rule(GET, "/admin/onec/template", "scoped"),

  // Оплаты своей компании: способы оплаты (номер для перевода, долг, ключи
  // Kaspi) и отчёт — журнал движений денег и долги покупателей.
  rule([...GET, ...POST], "/admin/payment-settings", "scoped"),
  rule(GET, "/admin/payment-report", "scoped"),
  rule(GET, "/admin/payment-report/debts", "scoped"),
  rule(GET, "/admin/payment-report/export", "scoped"),
  rule(GET, "/admin/payment-report/receipts", "scoped"),

  // Заказ компании у продавца: статус и лог, переходы продавца (сборку и
  // отгрузку ведут сборщики), документы, претензии, отзывы, ход сборки.
  // Ядровая страница заказа — только чтение (действия ядра идут в обход
  // жизненного цикла заказа).
  rule(GET, "/admin/orders/:id/lifecycle", "order"),
  rule(GET, "/admin/orders/:id/lifecycle/card", "order"),
  rule(POST, "/admin/orders/:id/lifecycle/confirm", "order"),
  rule(POST, "/admin/orders/:id/lifecycle/cancel", "order"),
  rule([...GET, ...POST], "/admin/orders/:id/lifecycle/reschedule", "order"),
  rule(POST, "/admin/orders/:id/lifecycle/deliver", "order"),
  rule(POST, "/admin/orders/:id/lifecycle/close", "order"),
  // Оплата заказа: перевод получен, долг погашен, деньги возвращены.
  rule(GET, "/admin/orders/:id/payment", "order"),
  rule(POST, "/admin/orders/:id/payment/receive", "order"),
  rule(POST, "/admin/orders/:id/payment/refund", "order"),
  // Чек покупателя: засчитать или отклонить (чек проверяется на заказ в роуте).
  rule(POST, "/admin/orders/:id/payment/receipts/:receipt_id/accept", "order"),
  rule(POST, "/admin/orders/:id/payment/receipts/:receipt_id/reject", "order"),
  rule(ANY, "/admin/orders/:id/documents/*", "order"),
  rule(ANY, "/admin/orders/:id/disputes/*", "order"),
  rule(ANY, "/admin/orders/:id/reviews/*", "order"),
  rule(GET, "/admin/orders/:id/assembly", "order"),
  rule(GET, "/admin/orders", "orders_list"),
  rule(GET, "/admin/orders/:id/*", "order"),
  rule(GET, "/admin/returns", "order_query"),
  rule(GET, "/admin/claims", "order_query"),
  rule(GET, "/admin/exchanges", "order_query"),
  rule(GET, "/admin/order-edits", "order_query"),

  // Клиенты — с заказами компании или заведённые её менеджером; ядровые
  // карточки — только чтение, новый клиент — своим роутом (компания — по
  // входу, не из тела).
  rule(POST, "/admin/tenant-customers", "scoped"),
  rule(GET, "/admin/customers", "customers_list"),
  rule(GET, "/admin/customers/:id/*", "customer"),
]

export const matchTenantRule = (
  method: string,
  path: string,
  role: TenantRole
): { kind: RuleKind; id?: string } | null => {
  for (const candidate of TENANT_RULES) {
    if (!candidate.roles.includes(role) || !candidate.methods.includes(method)) {
      continue
    }
    const match = candidate.pattern.exec(path)
    if (match) {
      return { kind: candidate.kind, id: match[1] }
    }
  }
  return null
}

const scopes = new WeakMap<object, TenantScope>()

// Область компании для текущего запроса или null — запрос сотрудника площадки.
export const getTenantScope = (req: MedusaRequest): TenantScope | null =>
  scopes.get(req) ?? null

const forbidden = (res: MedusaResponse) =>
  res.status(403).json({
    type: "not_allowed",
    message: "Раздел доступен только сотрудникам площадки.",
  })

const notFound = (res: MedusaResponse) =>
  res.status(404).json({ type: "not_found", message: "Не найдено." })

const STOCK_FIELD =
  /location_level|inventory_quantity|stocked_quantity|reserved_quantity|available_quantity|incoming_quantity/

// `?fields=a,b` (строка или повтор параметра) без полей остатков.
export const stripStockFields = (fields: unknown): string | undefined => {
  if (fields === undefined) {
    return undefined
  }
  const kept = (Array.isArray(fields) ? fields : [fields])
    .flatMap((value) => (typeof value === "string" ? value.split(",") : []))
    .map((field) => field.trim())
    .filter((field) => field && !STOCK_FIELD.test(field))
  return kept.length ? kept.join(",") : undefined
}

// Товар в канале продаж компании (связь product ↔ sales_channel ядра).
const productInChannel = async (
  container: MedusaContainer,
  productId: string,
  salesChannelId: string
): Promise<boolean> => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: ["id", "sales_channels.id"],
    filters: { id: productId },
  })
  const product = data[0] as
    | { sales_channels?: ({ id: string } | null)[] | null }
    | undefined
  return !!product?.sales_channels?.some((sc) => sc?.id === salesChannelId)
}

const firstQueryValue = (value: unknown): string | null => {
  const first = Array.isArray(value) ? value[0] : value
  return typeof first === "string" && first ? first : null
}

// Принадлежит ли компании ресурс из пути запроса.
const ownsResource = async (
  container: MedusaContainer,
  kind: RuleKind,
  id: string,
  scope: TenantScope
): Promise<boolean> => {
  const channel = scope.sales_channel_id
  switch (kind) {
    case "order":
      return orderBelongsToChannel(container, id, channel)
    case "document": {
      const [document] = await container
        .resolve<DocumentsModuleService>(DOCUMENTS_MODULE)
        .listDocuments({ id }, { take: 1 })
      return (
        !!document && orderBelongsToChannel(container, document.order_id, channel)
      )
    }
    case "dispute": {
      const [dispute] = await container
        .resolve<ReviewsModuleService>(REVIEWS_MODULE)
        .listDisputes({ id }, { take: 1 })
      return (
        !!dispute && orderBelongsToChannel(container, dispute.order_id, channel)
      )
    }
    case "assembly_task": {
      const [task] = await container
        .resolve<AssemblyModuleService>(ASSEMBLY_MODULE)
        .listAssemblyTasks({ id }, { take: 1 })
      return !!task && orderBelongsToChannel(container, task.order_id, channel)
    }
    case "customer":
      return (await loadTenantCustomerIds(container, scope)).includes(id)
    case "stock_location":
      return scope.stock_location_ids.includes(id)
    case "product":
      return productInChannel(container, id, channel)
    default:
      return false
  }
}

export async function enforceTenantAccess(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const auth = (req as MedusaRequest & {
    auth_context?: { actor_id?: string; actor_type?: string }
  }).auth_context
  // Без пользователя (вход, приглашение, секретный API-ключ владельца) решает
  // сам роут и ядровая аутентификация.
  if (!auth?.actor_id || auth.actor_type !== "user") {
    return next()
  }

  try {
    const tenant = await loadUserTenant(req.scope, auth.actor_id)
    if (!tenant) {
      return next()
    }
    if (tenant.status !== "active") {
      return res.status(403).json({
        type: "not_allowed",
        message: "Компания приостановлена на площадке.",
      })
    }

    const path = req.originalUrl.split("?")[0]
    const matched = matchTenantRule(req.method, path, tenant.role)
    if (!matched) {
      return forbidden(res)
    }

    const scope: TenantScope = {
      tenant_id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      sales_channel_id: tenant.sales_channel_id,
      stock_location_ids: await loadChannelStockLocationIds(
        req.scope,
        tenant.sales_channel_id
      ),
      role: tenant.role,
    }
    scopes.set(req, scope)

    if (req.method === "GET" && "fields" in req.query) {
      const fields = stripStockFields(req.query.fields)
      if (fields === undefined) {
        delete req.query.fields
      } else {
        req.query.fields = fields
      }
    }

    switch (matched.kind) {
      case "public":
      case "scoped":
        return next()

      case "own_user": {
        const body = (req.body ?? {}) as Record<string, unknown>
        if (matched.id !== auth.actor_id || "metadata" in body) {
          return forbidden(res)
        }
        return next()
      }

      case "order_query": {
        const orderId = firstQueryValue(req.query.order_id)
        if (
          !orderId ||
          !(await orderBelongsToChannel(req.scope, orderId, scope.sales_channel_id))
        ) {
          return forbidden(res)
        }
        // Ядро принимает и массив: `?order_id=свой&order_id=чужой` отдал бы чужое.
        req.query.order_id = orderId
        return next()
      }

      case "orders_list":
        req.query.sales_channel_id = [scope.sales_channel_id]
        return next()

      case "customers_list": {
        const allowed = await loadTenantCustomerIds(req.scope, scope)
        const requested = req.query.id
        const ids =
          requested === undefined
            ? allowed
            : (Array.isArray(requested) ? requested : [requested]).filter(
                (id): id is string =>
                  typeof id === "string" && allowed.includes(id)
              )
        // Пустой список id ядро прочло бы как «без фильтра» — отвечаем сами.
        if (!ids.length) {
          return res.json({
            customers: [],
            count: 0,
            offset: Number(req.query.offset ?? 0) || 0,
            limit: Number(req.query.limit ?? 50) || 50,
          })
        }
        req.query.id = ids
        return next()
      }

      case "products_list":
        // Подменяем, а не дополняем: `?sales_channel_id=чужой` не пройдёт.
        req.query.sales_channel_id = [scope.sales_channel_id]
        return next()

      case "stock_locations_list": {
        if (!scope.stock_location_ids.length) {
          return res.json({
            stock_locations: [],
            count: 0,
            offset: Number(req.query.offset ?? 0) || 0,
            limit: Number(req.query.limit ?? 50) || 50,
          })
        }
        req.query.id = scope.stock_location_ids
        return next()
      }

      case "notifications":
        if (matched.id) {
          return notFound(res)
        }
        return res.json({
          notifications: [],
          count: 0,
          offset: Number(req.query.offset ?? 0) || 0,
          limit: Number(req.query.limit ?? 50) || 50,
        })

      default:
        if (
          !matched.id ||
          !(await ownsResource(req.scope, matched.kind, matched.id, scope))
        ) {
          return notFound(res)
        }
        return next()
    }
  } catch (error) {
    return next(error)
  }
}
