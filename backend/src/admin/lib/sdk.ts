import Medusa from "@medusajs/js-sdk"

// Клиент админ-API для кастомных экранов админки. Админка всегда отдаётся
// самим бэкендом (dev и prod) — базовый URL относительный, авторизация —
// сессия залогиненного admin-пользователя. Без import.meta.env: файл проходит
// и через CJS-компиляцию бэкенда (medusa build), где import.meta запрещён.
export const sdk = new Medusa({
  baseUrl: "/",
  auth: {
    type: "session",
  },
})
