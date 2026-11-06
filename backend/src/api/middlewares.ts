import {
  authenticate,
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http"
import {
  StoreCreateCompany,
  StoreCreateEmployee,
  StoreCreateSpendLimit,
  StoreUpdateCompanyApplication,
} from "./store/companies/validators"
import {
  AdminGetCompaniesParams,
  AdminRejectCompany,
} from "./admin/companies/validators"
import {
  AdminRejectProductCard,
  AdminUpsertProductCard,
} from "./admin/products/validators"
import { StoreGetAlternativesParams } from "./store/products/validators"
import { requireCompaniesFeature } from "./utils/feature-gate"
import { filterProductsBySegment } from "./store/products/filter-by-segment"
import { limitStockLocationsPerCity } from "./admin/stock-locations/limit-per-city"
import {
  StoreCancelOrder,
  StoreCreateReview,
  StoreOpenDispute,
  StoreChangeOrderPaymentMethod,
  StorePlaceOrder,
  StoreSubmitPaymentReceipt,
} from "./store/orders/validators"
import {
  StoreApplyCartBonus,
  StoreInitKaspiPayment,
  StoreSelectPaymentMethod,
} from "./store/carts/validators"
import { StoreGetBonusParams } from "./store/bonus/validators"
import { StoreCreateEstimate } from "./store/estimates/validators"
import { AdminUpdateBonusConfig } from "./admin/bonus-config/validators"
import { AdminUpdateDocumentSettings } from "./admin/document-settings/validators"
import { AdminKaspiMockPay } from "./admin/kaspi-mock-payments/validators"
import {
  AdminGetDocumentsParams,
  AdminIssueOrderDocument,
} from "./admin/documents/validators"
import {
  AdminGetReviewsParams,
  AdminModerateReview,
} from "./admin/reviews/validators"
import {
  AdminGetDisputesParams,
  AdminRegisterDispute,
  AdminTransitionDispute,
} from "./admin/disputes/validators"
import { AdminUpdateScoringConfig } from "./admin/scoring-config/validators"
import { AdminSetCreditLimit } from "./admin/companies/[id]/scorecard/validators"
import { AdminUpsertMaterialNorm } from "./admin/material-norms/validators"
import {
  AdminCompleteAssemblyTask,
  AdminGetAssemblyTasksParams,
  AdminMarkAssemblyItem,
  AdminStartAssemblyTask,
} from "./admin/assembly-tasks/validators"
import { AdminGetShippingQueueParams } from "./admin/shipping-queue/validators"
import {
  AdminApplyPriceStock,
  AdminExportPriceStockParams,
  AdminGetPriceStockHistoryParams,
  AdminGetPriceStockParams,
  AdminImportPriceStock,
} from "./admin/price-stock/validators"
import {
  AdminGetOnecParams,
  AdminSyncOnec,
  AdminTestOnecConnection,
  AdminUploadOnecFile,
  AdminUpsertOnecConnection,
} from "./admin/onec/validators"
import {
  AdminCancelOrder,
  AdminCompleteAssembly,
  AdminConfirmOrder,
  AdminDeliverOrder,
  AdminGetOrderLifecyclesParams,
  AdminRescheduleOrder,
  AdminShipOrder,
} from "./admin/orders/validators"
import {
  AdminAddTripStop,
  AdminCreateTrip,
  AdminRecordGpsPing,
  AdminSetTripStatus,
  AdminSetTripStopStatus,
  AdminUpsertDeliveryTariff,
} from "./admin/logistics/validators"
import {
  AdminCreateReceipt,
  AdminCreateSupplier,
  AdminGetProductCostsParams,
  AdminParseInvoice,
  AdminUpdateSupplier,
} from "./admin/procurement/validators"
import {
  StoreAssistantCartItems,
  StoreAssistantChat,
  StoreAssistantCustomerProfile,
  StoreAssistantTranscribe,
  StoreUpsertChatConversation,
} from "./store/assistant/validators"
import {
  StoreRequestPhoneOtp,
  StoreVerifyPhoneOtp,
} from "./store/auth/phone/validators"
import {
  DriverRequestPhoneOtp,
  DriverVerifyPhoneOtp,
} from "./driver/auth/phone/validators"
import { DriverUpdateProfile } from "./driver/me/validators"
import {
  DriverRecordGpsPing,
  DriverSetStopStatus,
  DriverSetTripStatus,
} from "./driver/trips/validators"
import {
  AdminGetDriversParams,
  AdminSetDriverStatus,
} from "./admin/drivers/validators"
import {
  AdminGetPaymentSettingsParams,
  AdminUpsertPaymentSettings,
} from "./admin/payment-settings/validators"
import {
  AdminAcceptPaymentReceipt,
  AdminRecordOrderPayment,
  AdminRejectPaymentReceipt,
} from "./admin/orders/[id]/payment/validators"
import {
  AdminExportPaymentReportParams,
  AdminGetDebtsParams,
  AdminGetPaymentEntriesParams,
  AdminGetReceiptsParams,
} from "./admin/payment-report/validators"
import { closedCoreRoute } from "./utils/closed-core-route"
import { driverCors } from "./utils/driver-cors"
import { requireActiveDriver } from "./utils/require-active-driver"
import { enforceTenantAccess } from "./utils/tenant-access"
import { AdminCreateTenantCustomer } from "./admin/tenant-customers/validators"

// Сквозные middleware кастомных роутов: аутентификация store-роутов компании
// (все требуют залогиненного customer) и zod-валидация тел/query.
// Роуты /admin/* защищены аутентификацией ядра автоматически.
export default defineMiddlewares({
  routes: [
    // Продавец компании видит в admin-API только свой канал продаж (белый
    // список адресов — utils/tenant-access.ts). Без метода — значит раньше
    // ядровых валидаторов: фильтр ядровых списков подставляется до них.
    // Ядровая аутентификация /admin к этому моменту уже отработала.
    {
      matcher: "/admin/*",
      middlewares: [enforceTenantAccess],
    },
    // Юрлица заморожены на MVP (T10.9): весь домен отвечает 404, пока
    // FEATURE_COMPANIES выключен. Гейт стоит ПЕРВЫМ — раньше аутентификации и
    // валидаторов, чтобы отключённый раздел не просил вход и не разбирал тело.
    {
      matcher: "/store/companies*",
      middlewares: [
        requireCompaniesFeature,
        authenticate("customer", ["session", "bearer"]),
      ],
    },
    {
      matcher: "/store/companies",
      method: "POST",
      // Заявка юрлица несёт учредительные документы содержимым (base64):
      // 4 файла × 3 МБ + накладные расходы кодирования (см. document-files.ts).
      bodyParser: { sizeLimit: "18mb" },
      middlewares: [validateAndTransformBody(StoreCreateCompany)],
    },
    {
      matcher: "/store/companies/me",
      method: "POST",
      // Догрузка документов к заявке — тот же объём тела, что и первая подача.
      bodyParser: { sizeLimit: "18mb" },
      middlewares: [validateAndTransformBody(StoreUpdateCompanyApplication)],
    },
    {
      matcher: "/store/companies/me/employees",
      method: "POST",
      middlewares: [validateAndTransformBody(StoreCreateEmployee)],
    },
    {
      matcher: "/store/companies/me/employees/:id/spend-limits",
      method: "POST",
      middlewares: [validateAndTransformBody(StoreCreateSpendLimit)],
    },
    {
      matcher: "/admin/companies*",
      middlewares: [requireCompaniesFeature],
    },
    {
      matcher: "/admin/scoring-config*",
      middlewares: [requireCompaniesFeature],
    },
    {
      matcher: "/admin/companies",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(AdminGetCompaniesParams, {
          isList: true,
          defaults: ["id", "name", "bin", "status"],
        }),
      ],
    },
    {
      matcher: "/admin/companies/:id/reject",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminRejectCompany)],
    },
    {
      // Кастомный фильтр каталога по сегменту поверх ядрового списка товаров.
      // Матчер wildcard: так middleware регистрируется раньше ядрового
      // валидатора query (подробности — в filter-by-segment.ts).
      matcher: "/store/products*",
      method: "GET",
      middlewares: [filterProductsBySegment],
    },
    {
      matcher: "/store/products/:id/alternatives",
      method: "GET",
      middlewares: [validateAndTransformQuery(StoreGetAlternativesParams, {})],
    },
    {
      matcher: "/admin/products/:id/moderation/reject",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminRejectProductCard)],
    },
    {
      matcher: "/admin/products/:id/product-card",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpsertProductCard)],
    },
    {
      // Лимит ≤5 складов на город поверх ядрового создания склада
      // (см. limit-per-city.ts).
      matcher: "/admin/stock-locations",
      method: "POST",
      middlewares: [limitStockLocationsPerCity],
    },
    // --- Оплата корзины (payment-kaspi) ---
    // Ядровые роуты корзины доступны гостям. Инициализация оплаты (POST) —
    // только залогиненному покупателю (владение проверяет requireOwnCart).
    // Поллинг статуса (GET) доступен и гостю (T2.4, авто-поллинг в чате):
    // allowUnauthenticated пропускает гостя, владение гостевой корзиной
    // подтверждает сам cart_id (капабилити; requireCartPaymentAccess), а
    // корзина покупателя по-прежнему видна только ему.
    {
      matcher: "/store/carts/:id/payment/kaspi",
      method: "GET",
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true,
        }),
      ],
    },
    {
      matcher: "/store/carts/:id/payment/kaspi",
      method: "POST",
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(StoreInitKaspiPayment),
      ],
    },
    // Способ оплаты корзины (Kaspi QR, перевод по номеру, в долг): список —
    // как поллинг (гостю по cart_id), выбор — только вошедшему владельцу.
    {
      matcher: "/store/carts/:id/payment-method",
      method: "GET",
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true,
        }),
      ],
    },
    {
      matcher: "/store/carts/:id/payment-method",
      method: "POST",
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(StoreSelectPaymentMethod),
      ],
    },
    // Ядровые обходы оформления закрыты. Завершение корзины ядром создаёт заказ
    // без нашего жизненного цикла и без проверки оплаты (оформление — только
    // POST /store/orders), а ядровое создание платёжной сессии позволило бы
    // выбрать системный провайдер (заказ без денег) или подставить в сессию
    // чужой канал (счёт Kaspi другого продавца). Способ оплаты выбирается
    // только нашими роутами выше.
    {
      matcher: "/store/carts/:id/complete",
      method: "POST",
      middlewares: [closedCoreRoute],
    },
    {
      matcher: "/store/payment-collections/:id/payment-sessions",
      method: "POST",
      middlewares: [closedCoreRoute],
    },
    // Dev-подтверждение мок-оплаты (T8.6): доступ как у поллинга — гостевая
    // корзина подтверждается своим cart_id. Роут отвечает 404 вне KASPI_MODE=mock.
    {
      matcher: "/store/carts/:id/payment/kaspi/mock-pay",
      method: "POST",
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true,
        }),
      ],
    },
    // --- Бонусы (bonus) ---
    // Применение бонусов к корзине и бонусный счёт — только залогиненному
    // покупателю (владение корзиной проверяет requireOwnCart).
    {
      matcher: "/store/carts/:id/bonus",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/carts/:id/bonus",
      method: "POST",
      middlewares: [validateAndTransformBody(StoreApplyCartBonus)],
    },
    {
      matcher: "/store/bonus",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/bonus",
      method: "GET",
      middlewares: [validateAndTransformQuery(StoreGetBonusParams, {})],
    },
    {
      matcher: "/admin/bonus-config",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpdateBonusConfig)],
    },
    {
      matcher: "/admin/document-settings",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpdateDocumentSettings)],
    },
    {
      matcher: "/admin/kaspi-mock-payments",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminKaspiMockPay)],
    },
    {
      matcher: "/admin/reviews",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(AdminGetReviewsParams, { isList: true }),
      ],
    },
    {
      matcher: "/admin/reviews/:id/moderate",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminModerateReview)],
    },
    // Очередь претензий (экран «Претензии») и регистрация претензии по звонку.
    {
      matcher: "/admin/disputes",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(AdminGetDisputesParams, { isList: true }),
      ],
    },
    {
      matcher: "/admin/disputes",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminRegisterDispute)],
    },
    {
      matcher: "/admin/disputes/:id/transition",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminTransitionDispute)],
    },
    {
      matcher: "/admin/scoring-config",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpdateScoringConfig)],
    },
    {
      matcher: "/admin/companies/:id/scorecard/limit",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminSetCreditLimit)],
    },
    {
      matcher: "/admin/material-norms",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpsertMaterialNorm)],
    },
    // --- Заказ (order-lifecycle) ---
    // Все store-роуты заказа требуют залогиненного покупателя.
    {
      matcher: "/store/orders*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/orders/:id/payment",
      method: "POST",
      middlewares: [validateAndTransformBody(StoreChangeOrderPaymentMethod)],
    },
    // Чек Kaspi покупателя содержимым: 8 МБ файла + накладные base64.
    {
      matcher: "/store/orders/:id/payment/receipts",
      method: "POST",
      bodyParser: { sizeLimit: "12mb" },
      middlewares: [validateAndTransformBody(StoreSubmitPaymentReceipt)],
    },
    // Кабинет клиента (T10.6): стадии всех заказов, все документы одним списком
    // и текущая корзина покупателя. Роуты личные — только залогиненный
    // покупатель. `/store/carts/me` объявлен ДО ядрового `/store/carts/:id`,
    // иначе «me» уехало бы в динамический сегмент.
    {
      matcher: "/store/carts/me",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/order-lifecycles",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/documents",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/orders",
      method: "POST",
      middlewares: [validateAndTransformBody(StorePlaceOrder)],
    },
    {
      matcher: "/store/orders/:id/cancel",
      method: "POST",
      middlewares: [validateAndTransformBody(StoreCancelOrder)],
    },
    {
      // Расчёт материалов (estimator) — гость допускается, только валидация тела.
      matcher: "/store/estimates",
      method: "POST",
      middlewares: [validateAndTransformBody(StoreCreateEstimate)],
    },
    {
      matcher: "/store/orders/:id/reviews",
      method: "POST",
      middlewares: [validateAndTransformBody(StoreCreateReview)],
    },
    {
      matcher: "/store/orders/:id/disputes",
      method: "POST",
      middlewares: [validateAndTransformBody(StoreOpenDispute)],
    },
    {
      matcher: "/admin/order-lifecycles",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(AdminGetOrderLifecyclesParams, {
          isList: true,
          defaults: ["id", "status", "previous_status", "created_at"],
        }),
      ],
    },
    {
      matcher: "/admin/documents",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(AdminGetDocumentsParams, {
          isList: true,
          defaults: ["id", "type", "number", "created_at"],
        }),
      ],
    },
    {
      matcher: "/admin/orders/:id/documents",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminIssueOrderDocument)],
    },
    {
      matcher: "/admin/orders/:id/lifecycle/complete-assembly",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminCompleteAssembly)],
    },
    {
      matcher: "/admin/orders/:id/lifecycle/ship",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminShipOrder)],
    },
    {
      matcher: "/admin/orders/:id/lifecycle/deliver",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminDeliverOrder)],
    },
    {
      matcher: "/admin/orders/:id/lifecycle/confirm",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminConfirmOrder)],
    },
    {
      matcher: "/admin/orders/:id/lifecycle/cancel",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminCancelOrder)],
    },
    // Перенос доставки (T5.6b): статус заказа не меняется, поэтому роут не
    // среди переходов. GET того же адреса отдаёт доступные окна — валидации
    // тела ему не нужно.
    {
      matcher: "/admin/orders/:id/lifecycle/reschedule",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminRescheduleOrder)],
    },
    // --- Сборка заказа по категориям (assembly, T10.11) ---
    // Очередь заданий — один ресурс на два экрана: сборщик видит только свою
    // группу (подставляется из учётки), отгрузка — все задания.
    {
      matcher: "/admin/assembly-tasks",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(AdminGetAssemblyTasksParams, {
          isList: true,
          defaults: ["id", "status", "category_handle", "created_at"],
        }),
      ],
    },
    {
      matcher: "/admin/shipping-queue",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(AdminGetShippingQueueParams, {
          isList: true,
          defaults: ["id", "status", "created_at"],
        }),
      ],
    },
    // --- Интеграция с 1С компании ---
    {
      matcher: "/admin/onec",
      method: "GET",
      middlewares: [validateAndTransformQuery(AdminGetOnecParams, {})],
    },
    {
      matcher: "/admin/onec",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpsertOnecConnection)],
    },
    {
      matcher: "/admin/onec/check",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminTestOnecConnection)],
    },
    {
      matcher: "/admin/onec/sync",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminSyncOnec)],
    },
    {
      matcher: "/admin/onec/file",
      method: "POST",
      // Excel-файл каталога base64: до 10 МБ файла + накладные кодирования.
      bodyParser: { sizeLimit: "15mb" },
      middlewares: [validateAndTransformBody(AdminUploadOnecFile)],
    },
    // --- Оплаты: способы оплаты продавца, движения денег по заказу, отчёт ---
    {
      matcher: "/admin/payment-settings",
      method: "GET",
      middlewares: [validateAndTransformQuery(AdminGetPaymentSettingsParams, {})],
    },
    {
      matcher: "/admin/payment-settings",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpsertPaymentSettings)],
    },
    {
      matcher: "/admin/orders/:id/payment/receive",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminRecordOrderPayment)],
    },
    {
      matcher: "/admin/orders/:id/payment/refund",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminRecordOrderPayment)],
    },
    {
      matcher: "/admin/orders/:id/payment/receipts/:receipt_id/accept",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminAcceptPaymentReceipt)],
    },
    {
      matcher: "/admin/orders/:id/payment/receipts/:receipt_id/reject",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminRejectPaymentReceipt)],
    },
    {
      matcher: "/admin/payment-report/receipts",
      method: "GET",
      middlewares: [validateAndTransformQuery(AdminGetReceiptsParams, {})],
    },
    {
      matcher: "/admin/payment-report",
      method: "GET",
      middlewares: [validateAndTransformQuery(AdminGetPaymentEntriesParams, {})],
    },
    {
      matcher: "/admin/payment-report/debts",
      method: "GET",
      middlewares: [validateAndTransformQuery(AdminGetDebtsParams, {})],
    },
    {
      matcher: "/admin/payment-report/export",
      method: "GET",
      middlewares: [validateAndTransformQuery(AdminExportPaymentReportParams, {})],
    },
    // --- Цены и остатки одним экраном (T10.14) ---
    {
      matcher: "/admin/price-stock",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(AdminGetPriceStockParams, {
          isList: true,
          defaults: ["id", "title", "status"],
        }),
      ],
    },
    {
      matcher: "/admin/tenant-customers",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminCreateTenantCustomer)],
    },
    {
      matcher: "/admin/price-stock",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminApplyPriceStock)],
    },
    {
      matcher: "/admin/price-stock/export",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(AdminExportPriceStockParams, {
          isList: true,
          defaults: ["id", "title", "status"],
        }),
      ],
    },
    {
      matcher: "/admin/price-stock/import",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminImportPriceStock)],
    },
    {
      matcher: "/admin/price-stock/history",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(AdminGetPriceStockHistoryParams, {
          isList: true,
          defaults: ["id", "created_at"],
        }),
      ],
    },
    {
      matcher: "/admin/assembly-tasks/:id/start",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminStartAssemblyTask)],
    },
    {
      matcher: "/admin/assembly-tasks/:id/items/:item_id",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminMarkAssemblyItem)],
    },
    {
      matcher: "/admin/assembly-tasks/:id/complete",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminCompleteAssemblyTask)],
    },
    // --- Логистика: рейсы/точки/GPS/тарифы (logistics) ---
    // Admin-аутентификация — у ядра автоматом. (Отдельный gig-actor /driver/*
    // возвращается отдельной задачей пивота, см. docs/STATE.md.)
    {
      matcher: "/admin/logistics/trips",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminCreateTrip)],
    },
    {
      matcher: "/admin/logistics/trips/:id/status",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminSetTripStatus)],
    },
    {
      matcher: "/admin/logistics/trips/:id/stops",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminAddTripStop)],
    },
    {
      matcher: "/admin/logistics/trips/:id/stops/:stop_id/status",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminSetTripStopStatus)],
    },
    {
      matcher: "/admin/logistics/trips/:id/gps",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminRecordGpsPing)],
    },
    {
      matcher: "/admin/logistics/tariffs",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpsertDeliveryTariff)],
    },
    // --- Закуп: поставщики/приходы (procurement) ---
    // Admin-аутентификация — у ядра автоматом. Проводка (POST /receipts/:id/post)
    // без тела — валидатор не нужен.
    {
      matcher: "/admin/procurement/suppliers",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminCreateSupplier)],
    },
    {
      matcher: "/admin/procurement/suppliers/:id",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminUpdateSupplier)],
    },
    {
      matcher: "/admin/procurement/receipts",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminCreateReceipt)],
    },
    {
      // Себестоимость и наценка позиции для карточки товара (T4.9a).
      matcher: "/admin/procurement/product-costs",
      method: "GET",
      middlewares: [validateAndTransformQuery(AdminGetProductCostsParams, {})],
    },
    {
      // ИИ-приёмка: распознать накладную (Gemini). Тело — base64-файл до
      // MAX_INVOICE_BYTES (8 МБ) плюс накладные расходы кодирования: 8 МБ в
      // base64 — это ≈10.7 МБ строки. Дефолтного лимита тела Medusa не хватало,
      // и снимок накладной с телефона падал с 413 ещё до валидатора.
      matcher: "/admin/procurement/parse-invoice",
      method: "POST",
      bodyParser: { sizeLimit: "12mb" },
      middlewares: [validateAndTransformBody(AdminParseInvoice)],
    },
    // --- Вход покупателя по номеру телефона (auth-phone, T10.7) ---
    // Оба роута публичные: это и есть вход (гость получает код и сессию).
    // Ядровая аутентификация здесь не нужна — токен выдаёт сам роут verify.
    {
      matcher: "/store/auth/phone/otp",
      method: "POST",
      middlewares: [validateAndTransformBody(StoreRequestPhoneOtp)],
    },
    {
      matcher: "/store/auth/phone/verify",
      method: "POST",
      middlewares: [validateAndTransformBody(StoreVerifyPhoneOtp)],
    },
    // --- Водитель-gig: свой actor-тип `/driver/*` (T5.1) ---
    // CORS ставим сами: ядро знает только свои префиксы (/store, /admin,
    // /auth), а web-сборка приложения водителя ходит из браузера. Гейт стоит
    // ПЕРВЫМ и закрывает preflight — до аутентификации и валидаторов.
    {
      matcher: "/driver*",
      middlewares: [driverCors],
    },
    // Роуты входа публичные: водитель получает код и сессию до всякого токена
    // (вход = самрегистрация). Токен выдаёт сам роут verify.
    {
      matcher: "/driver/auth/phone/otp",
      method: "POST",
      middlewares: [validateAndTransformBody(DriverRequestPhoneOtp)],
    },
    {
      matcher: "/driver/auth/phone/verify",
      method: "POST",
      middlewares: [validateAndTransformBody(DriverVerifyPhoneOtp)],
    },
    // Всё остальное под `/driver/*` — только по токену водителя: actor_type
    // `driver` не пускает ни покупательский токен, ни админский.
    // Сессии у приложения нет (мобильный клиент), поэтому только bearer.
    {
      matcher: "/driver/me*",
      middlewares: [authenticate("driver", ["bearer"])],
    },
    {
      matcher: "/driver/me",
      method: "POST",
      middlewares: [validateAndTransformBody(DriverUpdateProfile)],
    },
    // Пул заказов и «взять заказ» (T5.2a), свои рейсы и ведение точек (T5.2b) —
    // сверх токена нужен ДОПУСК: токен выдаётся при любом статусе заявки (чтобы
    // заблокированный видел причину), а к работе пускаем только допущенного.
    {
      matcher: "/driver/orders*",
      middlewares: [
        authenticate("driver", ["bearer"]),
        requireActiveDriver,
      ],
    },
    {
      matcher: "/driver/trips*",
      middlewares: [
        authenticate("driver", ["bearer"]),
        requireActiveDriver,
      ],
    },
    // Владение рейсом проверяет сам роут (правило — lib/logistics/driver-trips.ts):
    // это не аутентификация, а «чей рейс», и чужой рейс отдаёт 404.
    {
      matcher: "/driver/trips/:id/status",
      method: "POST",
      middlewares: [validateAndTransformBody(DriverSetTripStatus)],
    },
    {
      matcher: "/driver/trips/:id/stops/:stop_id/status",
      method: "POST",
      middlewares: [validateAndTransformBody(DriverSetStopStatus)],
    },
    {
      matcher: "/driver/trips/:id/gps",
      method: "POST",
      middlewares: [validateAndTransformBody(DriverRecordGpsPing)],
    },
    // --- Водители в панели продавца: очередь заявок и допуск (T5.1) ---
    {
      matcher: "/admin/drivers",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(AdminGetDriversParams, { isList: true }),
      ],
    },
    {
      matcher: "/admin/drivers/:id/status",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminSetDriverStatus)],
    },
    // --- Разговорный ассистент покупателя (assistant, Gemini function-calling) ---
    // Гость допускается (покупатель начинает как гость; идиома estimator).
    // authenticate с allowUnauthenticated: гостя пропускает БЕЗ ошибки, а у
    // залогиненного покупателя проставляет auth_context.actor_id — инструменты
    // корзины привязывают её к покупателю, когда он авторизован.
    // Тело чата несёт вложения содержимым (base64, T10.4): до 3 файлов, не
    // больше 12 МБ суммарно + накладные расходы кодирования и история диалога.
    {
      matcher: "/store/assistant/chat",
      method: "POST",
      bodyParser: { sizeLimit: "20mb" },
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true,
        }),
        validateAndTransformBody(StoreAssistantChat),
      ],
    },
    // Потоковый вариант того же хода (T10.1d, SSE): тело и авторизация те же —
    // отдельная запись нужна потому, что matcher выше совпадает строго.
    {
      matcher: "/store/assistant/chat/stream",
      method: "POST",
      bodyParser: { sizeLimit: "20mb" },
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true,
        }),
        validateAndTransformBody(StoreAssistantChat),
      ],
    },
    // Состав корзины чата для полосы корзины над композером (T10.15): корзину
    // меняют оба пути — кнопки и сам ассистент, — поэтому её надо уметь
    // перечитать после хода модели.
    {
      matcher: "/store/assistant/cart",
      method: "GET",
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true,
        }),
      ],
    },
    // Счётчики «−/+» на карточках подбора (T10.15): запись в корзину БЕЗ хода
    // модели. Авторизация та же, что у чата — гость собирает корзину сам.
    {
      matcher: "/store/assistant/cart/items",
      method: "POST",
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true,
        }),
        validateAndTransformBody(StoreAssistantCartItems),
      ],
    },
    // История чата на всех устройствах покупателя: только вошедший. Тело —
    // лента диалога целиком (сотни реплик), отсюда предел больше обычного.
    {
      matcher: "/store/assistant/conversations*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/assistant/conversations",
      method: "POST",
      bodyParser: { sizeLimit: "4mb" },
      middlewares: [validateAndTransformBody(StoreUpsertChatConversation)],
    },
    {
      // Мини-форма доставки в ленте чата: только вошедший покупатель.
      matcher: "/store/assistant/customer-profile",
      method: "POST",
      middlewares: [
        authenticate("customer", ["session", "bearer"]),
        validateAndTransformBody(StoreAssistantCustomerProfile),
      ],
    },

    // Распознавание голосового сообщения (T10.2): аудио → текст, БЕЗ хода
    // модели-ассистента. Гость допускается — говорить он начинает до входа.
    // Тело несёт запись содержимым (base64): 8 МБ записи + накладные расходы
    // кодирования (см. lib/assistant/speech.ts).
    {
      matcher: "/store/assistant/transcribe",
      method: "POST",
      bodyParser: { sizeLimit: "12mb" },
      middlewares: [
        authenticate("customer", ["session", "bearer"], {
          allowUnauthenticated: true,
        }),
        validateAndTransformBody(StoreAssistantTranscribe),
      ],
    },
  ],
})
