import { randomInt } from "crypto"

// Код получения заказа: 6 цифр. Выдаётся при входе в доставку, проверяется при
// вручении (assertDeliveryConfirmation). Вынесен из шага issue-delivery-code —
// тот же код выдаёт догон статуса из ядра (sync-lifecycle-status), когда заказ
// проскочил в доставку через ядровый интерфейс.
export const generateDeliveryCode = () =>
  randomInt(0, 1_000_000).toString().padStart(6, "0")
