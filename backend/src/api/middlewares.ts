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
  ],
})
