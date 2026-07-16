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
import { filterProductsBySegment } from "./store/products/filter-by-segment"
import { limitStockLocationsPerCity } from "./admin/stock-locations/limit-per-city"
import {
  StoreCancelOrder,
  StorePlaceOrder,
} from "./store/orders/validators"
import { StoreInitKaspiPayment } from "./store/carts/validators"
import {
  AdminCancelOrder,
  AdminCompleteAssembly,
  AdminDeliverOrder,
  AdminGetOrderLifecyclesParams,
  AdminPlaceCounterOrder,
  AdminShipOrder,
} from "./admin/orders/validators"

// Сквозные middleware кастомных роутов: аутентификация store-роутов компании
// (все требуют залогиненного customer) и zod-валидация тел/query.
// Роуты /admin/* защищены аутентификацией ядра автоматически.
export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/companies*",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/companies",
      method: "POST",
      middlewares: [validateAndTransformBody(StoreCreateCompany)],
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
    // Ядровые роуты корзины доступны гостям; наша Kaspi-оплата — только
    // залогиненному покупателю (владение корзиной проверяет requireOwnCart).
    {
      matcher: "/store/carts/:id/payment/kaspi",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/carts/:id/payment/kaspi",
      method: "POST",
      middlewares: [validateAndTransformBody(StoreInitKaspiPayment)],
    },
    // --- Заказ (order-lifecycle) ---
    // Все store-роуты заказа требуют залогиненного покупателя.
    {
      matcher: "/store/orders*",
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
      matcher: "/admin/orders/:id/lifecycle/cancel",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminCancelOrder)],
    },
    {
      // Продажа у окна (POS) — отдельный ресурс, не под /admin/orders
      // (статик-сегмент конфликтует с ядровым :id).
      matcher: "/admin/counter-orders",
      method: "POST",
      middlewares: [validateAndTransformBody(AdminPlaceCounterOrder)],
    },
  ],
})
