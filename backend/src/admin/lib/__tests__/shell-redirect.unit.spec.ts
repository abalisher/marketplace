import {
  DELIVERY_PATH,
  HOME_PATH,
  PICKER_PATH,
  SHIPPING_PATH,
  REVIEWS_PATH,
  STOCK_PATH,
  LOGIN_PATH,
  QUEUE_PATH,
  redirectFor,
} from "../shell-redirect"

// Ядровый список заказов /app/orders продавцу не нужен: экран «Заказы» у нас
// свой (T4.2b), а два одинаковых раздела рядом владелец назвал дублем
// («почему страница заказы дублируются?», 2026-08-12). Тест закрепляет ровно
// то, что решает правило: какие адреса подменяются, какие — нет, и что вход
// по-прежнему заканчивается «Дашбордом», а не очередью заказов.

const ORDER_PAGE = "/app/orders/order_01JABCDEF"

describe("redirectFor", () => {
  // Сборщик: в панели у него задания сборки и отгрузка. До ограничения роль
  // `picker` падала в `owner` и сборщик открывал панель магазина целиком.
  it("сборщика уводит на задания сборки с любого чужого адреса панели", () => {
    for (const target of [
      "/app",
      "/app/dashboard",
      "/app/order-queue",
      "/app/orders",
      "/app/inventory",
      "/app/settings/profile",
    ]) {
      expect(redirectFor(target, "/app", "picker")).toBe(PICKER_PATH)
    }
  })

  it("сборщика не уводит с его страниц и со входа", () => {
    expect(redirectFor(PICKER_PATH, PICKER_PATH, "picker")).toBeNull()
    expect(redirectFor(SHIPPING_PATH, PICKER_PATH, "picker")).toBeNull()
    expect(redirectFor(REVIEWS_PATH, PICKER_PATH, "picker")).toBeNull()
    expect(redirectFor(STOCK_PATH, PICKER_PATH, "picker")).toBeNull()
    expect(redirectFor(`${PICKER_PATH}/`, PICKER_PATH, "picker")).toBeNull()
    expect(redirectFor("/app/login", "/app/login", "picker")).toBeNull()
  })

  it("роль сборщика не меняет правил для остальных", () => {
    expect(redirectFor("/app", "/app", "seller")).toBe(HOME_PATH)
    expect(redirectFor("/app", "/app", "owner")).toBe(HOME_PATH)
    expect(redirectFor("/app", "/app", null)).toBe(HOME_PATH)
  })

  it("уводит ядровый список заказов на наш экран", () => {
    expect(redirectFor("/app/orders", ORDER_PAGE)).toBe(QUEUE_PATH)
  })

  it("уводит список заказов и со слэшем на конце", () => {
    expect(redirectFor("/app/orders/", ORDER_PAGE)).toBe(QUEUE_PATH)
  })

  it("уводит корень панели на «Дашборд»", () => {
    // Ядро на `/app` само делает redirect на свой список заказов — перехват
    // должен случиться раньше, иначе продавец увидит ядровую таблицу.
    expect(redirectFor("/app", "/app")).toBe(HOME_PATH)
    expect(redirectFor("/app/", "/app/")).toBe(HOME_PATH)
  })

  it("НЕ трогает страницу самого заказа", () => {
    // Карточка заказа — ядровая и рабочая: на неё ведёт клик по строке очереди.
    expect(redirectFor(ORDER_PAGE, QUEUE_PATH)).toBeNull()
  })

  it("НЕ трогает вложенные адреса заказа", () => {
    expect(redirectFor(`${ORDER_PAGE}/fulfillment`, ORDER_PAGE)).toBeNull()
  })

  it("НЕ трогает адреса, начинающиеся так же", () => {
    expect(redirectFor(QUEUE_PATH, HOME_PATH)).toBeNull()
    expect(redirectFor("/app/order-queue/settings", QUEUE_PATH)).toBeNull()
  })

  it("после входа ведёт на «Дашборд», а не на очередь заказов", () => {
    // Роутер ядра делает replaceState('/app/orders') прямо на странице входа:
    // не различай мы источник перехода, общее правило увело бы на «Заказы» и
    // отменило решение T4.1a «панель открывается сводкой дня».
    expect(redirectFor("/app/orders", LOGIN_PATH)).toBe(HOME_PATH)
    expect(redirectFor("/app", LOGIN_PATH)).toBe(HOME_PATH)
  })

  it("не перехватывает возврат на страницу, с которой выкинуло по сессии", () => {
    expect(redirectFor(ORDER_PAGE, LOGIN_PATH)).toBeNull()
  })
})

// Водитель компании: в панели у него один экран — «Доставка».
describe("redirectFor — водитель", () => {
  it("уводит с любого адреса панели на «Доставку»", () => {
    for (const target of ["/app", HOME_PATH, QUEUE_PATH, ORDER_PAGE, PICKER_PATH, STOCK_PATH]) {
      expect(redirectFor(target, "/app", "driver")).toBe(DELIVERY_PATH)
    }
  })

  it("оставляет «Доставку» и вход", () => {
    expect(redirectFor(DELIVERY_PATH, DELIVERY_PATH, "driver")).toBeNull()
    expect(redirectFor(`${DELIVERY_PATH}/`, DELIVERY_PATH, "driver")).toBeNull()
    expect(redirectFor(LOGIN_PATH, LOGIN_PATH, "driver")).toBeNull()
  })
})
