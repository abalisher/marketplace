import { matchTenantRule, stripStockFields } from "../tenant-access"

// Белый список пользователей компании по ролям: что открыто, в каком виде и
// что закрыто. Продавец ведёт заказ, сборщик собирает и отгружает.
describe("matchTenantRule — продавец", () => {
  it.each([
    ["GET", "/admin/users/me", "public"],
    ["GET", "/admin/dashboard", "scoped"],
    ["GET", "/admin/order-lifecycles", "scoped"],
    ["POST", "/admin/orders/order_1/lifecycle/cancel", "order"],
    ["GET", "/admin/orders/order_1/documents/export", "order"],
    ["GET", "/admin/orders/order_1", "order"],
    ["GET", "/admin/orders", "orders_list"],
    ["GET", "/admin/customers", "customers_list"],
    ["GET", "/admin/customers/cus_1/bonus", "customer"],
    ["POST", "/admin/documents/doc_1/mark-sent", "document"],
    ["POST", "/admin/disputes/dsp_1/transition", "dispute"],
    ["POST", "/admin/users/user_1", "own_user"],
    ["GET", "/admin/returns", "order_query"],
    ["GET", "/admin/stock-locations", "stock_locations_list"],
    ["GET", "/admin/stock-locations/sloc_1", "stock_location"],
    ["GET", "/admin/notifications", "notifications"],
    ["POST", "/admin/tenant-customers", "scoped"],
    ["GET", "/admin/products", "products_list"],
    ["GET", "/admin/products/prod_1", "product"],
    ["GET", "/admin/products/prod_1/variants", "product"],
  ])("%s %s → %s", (method, path, kind) => {
    expect(matchTenantRule(method, path, "seller")?.kind).toEqual(kind)
  })

  it("товар по ссылке — с проверкой канала по id из пути", () => {
    expect(
      matchTenantRule("GET", "/admin/products/prod_9/variants/var_1", "seller")?.id
    ).toEqual("prod_9")
  })

  it("отдаёт id ресурса из пути", () => {
    expect(
      matchTenantRule("GET", "/admin/orders/order_42/lifecycle/card", "seller")?.id
    ).toEqual("order_42")
  })

  it.each([
    ["GET", "/admin/api-keys"],
    ["GET", "/admin/users"],
    ["DELETE", "/admin/users/user_1"],
    ["POST", "/admin/orders/order_1"],
    ["POST", "/admin/orders/order_1/fulfillments"],
    ["POST", "/admin/customers/cus_1"],
    ["POST", "/admin/reviews/rev_1/moderate"],
    ["GET", "/admin/procurement/receipts"],
    ["GET", "/admin/phone-otp-codes"],
    ["GET", "/admin/kaspi-mock-payments"],
    ["GET", "/admin/order-lifecycles-export"],
    // Сборку и отгрузку ведут сборщики компании.
    ["POST", "/admin/orders/order_1/lifecycle/start-assembly"],
    ["POST", "/admin/orders/order_1/lifecycle/complete-assembly"],
    ["POST", "/admin/orders/order_1/lifecycle/ship"],
    ["GET", "/admin/assembly-tasks"],
    ["POST", "/admin/assembly-tasks/astsk_1/start"],
    ["GET", "/admin/shipping-queue"],
    // Ядровое создание покупателя закрыто — только своим роутом.
    ["POST", "/admin/customers"],
    // Варианты ядро не умеет резать по каналу — список закрыт целиком.
    ["GET", "/admin/product-variants"],
    ["POST", "/admin/products/prod_1"],
  ])("закрыто: %s %s", (method, path) => {
    expect(matchTenantRule(method, path, "seller")).toBeNull()
  })
})

describe("matchTenantRule — сборщик", () => {
  it.each([
    ["GET", "/admin/users/me", "public"],
    ["GET", "/admin/tenant", "scoped"],
    ["GET", "/admin/assembly-tasks", "scoped"],
    ["POST", "/admin/assembly-tasks/astsk_1/start", "assembly_task"],
    ["POST", "/admin/assembly-tasks/astsk_1/items/astski_1", "assembly_task"],
    ["POST", "/admin/assembly-tasks/astsk_1/complete", "assembly_task"],
    ["GET", "/admin/shipping-queue", "scoped"],
    ["POST", "/admin/orders/order_1/lifecycle/ship", "order"],
    ["GET", "/admin/orders/order_1/lifecycle/card", "order"],
    ["GET", "/admin/reviews", "scoped"],
    ["GET", "/admin/reviews/summary", "scoped"],
    ["GET", "/admin/price-stock", "scoped"],
    ["POST", "/admin/price-stock", "scoped"],
    ["GET", "/admin/price-stock/history", "scoped"],
  ])("%s %s → %s", (method, path, kind) => {
    expect(matchTenantRule(method, path, "picker")?.kind).toEqual(kind)
  })

  it.each([
    ["POST", "/admin/orders/order_1/lifecycle/confirm"],
    ["POST", "/admin/orders/order_1/lifecycle/cancel"],
    ["POST", "/admin/orders/order_1/lifecycle/deliver"],
    ["POST", "/admin/orders/order_1/lifecycle/close"],
    ["POST", "/admin/orders/order_1/lifecycle/complete-assembly"],
    ["GET", "/admin/order-lifecycles"],
    ["GET", "/admin/dashboard"],
    ["GET", "/admin/orders"],
    ["GET", "/admin/customers"],
    ["POST", "/admin/tenant-customers"],
    ["GET", "/admin/documents"],
    ["POST", "/admin/reviews/rev_1/moderate"],
  ])("закрыто: %s %s", (method, path) => {
    expect(matchTenantRule(method, path, "picker")).toBeNull()
  })
})

describe("stripStockFields", () => {
  it("вырезает остатки, остальное оставляет", () => {
    expect(
      stripStockFields(
        "id,*variants.inventory_items.inventory.location_levels,+variants.inventory_quantity,title"
      )
    ).toEqual("id,title")
    expect(stripStockFields(["*variants", "variants.inventory_items.inventory.location_levels.*"])).toEqual(
      "*variants"
    )
    expect(stripStockFields("+variants.inventory_quantity")).toBeUndefined()
  })
})

// Водитель компании: заказы в доставке и вручение по коду — и больше ничего.
describe("matchTenantRule — водитель", () => {
  it("открывает очередь доставки и вручение заказа своей компании", () => {
    expect(matchTenantRule("GET", "/admin/delivery-queue", "driver")?.kind).toEqual("scoped")
    const deliver = matchTenantRule("POST", "/admin/orders/order_7/lifecycle/deliver", "driver")
    expect(deliver?.kind).toEqual("order")
    expect(deliver?.id).toEqual("order_7")
    expect(matchTenantRule("GET", "/admin/tenant", "driver")?.kind).toEqual("scoped")
    expect(matchTenantRule("GET", "/admin/users/me", "driver")?.kind).toEqual("public")
  })

  it.each([
    ["GET", "/admin/orders/order_7/lifecycle/card"],
    ["POST", "/admin/orders/order_7/lifecycle/confirm"],
    ["POST", "/admin/orders/order_7/lifecycle/cancel"],
    ["POST", "/admin/orders/order_7/payment/receive"],
    ["GET", "/admin/orders"],
    ["GET", "/admin/price-stock"],
    ["GET", "/admin/reviews"],
    ["GET", "/admin/shipping-queue"],
    ["GET", "/admin/customers"],
  ])("закрывает %s %s", (method, path) => {
    expect(matchTenantRule(method, path, "driver")).toBeNull()
  })

  it("очередь доставки закрыта продавцу и сборщику", () => {
    expect(matchTenantRule("GET", "/admin/delivery-queue", "seller")).toBeNull()
    expect(matchTenantRule("GET", "/admin/delivery-queue", "picker")).toBeNull()
  })
})
