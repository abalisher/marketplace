// Подмена ядровых адресов панели нашими экранами (чистое правило, без DOM).
//
// ЗАЧЕМ. У панели два адреса, которые ядро считает домашними: корень `/app`
// (ядро сразу уводит с него на свой список заказов) и сам список `/app/orders`.
// Пункт «Заказы» ядра из сайдбара убран ещё в T4.2b, но адрес остаётся живым —
// на него ведут хлебная крошка со страницы заказа, поиск ⌘K, горячие клавиши
// ядра и старая закладка, и продавец видел ВТОРОЙ экран «Заказы» рядом с нашим
// («почему страница заказы дублируются?», замечание владельца 2026-08-12).
//
// Применяет правило `shell-mode.ts` — и при заходе по адресу, и при переходах
// внутри панели. Здесь только решение «куда», чтобы его можно было проверить
// тестом без браузера.

// Сводка дня: ею заканчивается вход и на неё ведёт корень панели (T4.1a).
export const HOME_PATH = "/app/dashboard"
// Рабочее место сборщика в панели — задания сборки, отгрузка собранного,
// остатки своего склада и отзывы о заказах компании, других адресов у него нет. До ограничения учётка сборщика открывала панель
// ЦЕЛИКОМ (роль `picker` не совпадала с `seller` и падала в `owner` —
// сборщик видел склад, акции, прайс-листы и все заказы магазина).
export const PICKER_PATH = "/app/picker"
export const SHIPPING_PATH = "/app/shipping"
export const REVIEWS_PATH = "/app/reviews"
export const STOCK_PATH = "/app/price-stock"
// Рабочее место водителя: заказы компании в доставке и вручение по коду.
export const DELIVERY_PATH = "/app/delivery"
// Наш экран «Заказы» (макет 1b, T4.2b).
export const QUEUE_PATH = "/app/order-queue"

export const LOGIN_PATH = "/app/login"

// Адреса, на которые ядро уводит сразу после успешного входа.
const POST_LOGIN_PATHS = ["/app", "/app/", "/app/orders"]
// Корень панели.
const ROOT_PATHS = ["/app", "/app/"]
// Ядровый список заказов.
const ORDERS_PATHS = ["/app/orders", "/app/orders/"]

/**
 * Куда уводить с адреса `target`, если переход начат со страницы `from`.
 * `role` — роль оболочки; у сборщика в панели четыре адреса: сборка, отгрузка,
 * склад, отзывы.
 * `null` — адрес наш (или ядровый, но нужный), переход идёт как есть.
 */
export const redirectFor = (
  target: string,
  from: string,
  role?: string | null
): string | null => {
  // Сборщик: любой адрес панели, кроме его собственного и входа, уводит на
  // заглушку. Роль приходит с сервера асинхронно, поэтому вызывающий код
  // обязан повторить проверку, когда роль стала известна (см. shell-mode.ts).
  // Водитель: в панели у него один экран — «Доставка».
  if (role === "driver") {
    const path = target.replace(/\/$/, "") || target
    return [DELIVERY_PATH, LOGIN_PATH].includes(path) ? null : DELIVERY_PATH
  }

  if (role === "picker") {
    const path = target.replace(/\/$/, "") || target
    return [PICKER_PATH, SHIPPING_PATH, STOCK_PATH, REVIEWS_PATH, LOGIN_PATH].includes(path)
      ? null
      : PICKER_PATH
  }

  // Сразу после входа ядро подставляет свой список заказов — но вход
  // заканчивается сводкой дня, а не заказами (решение T4.1a). Остальные
  // переходы со страницы входа не трогаем: по истечении сессии ядро возвращает
  // человека на ту страницу, с которой его выкинуло.
  if (from === LOGIN_PATH) {
    return POST_LOGIN_PATHS.includes(target) ? HOME_PATH : null
  }

  if (ROOT_PATHS.includes(target)) {
    return HOME_PATH
  }

  if (ORDERS_PATHS.includes(target)) {
    return QUEUE_PATH
  }

  return null
}
