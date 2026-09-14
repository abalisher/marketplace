import { MedusaError } from "@medusajs/framework/utils"

// Допуск водителя к работе. Самрегистрация из пула (решение владельца
// 2026-08-25, п. 5) не означает мгновенный доступ к заказам: водитель везёт
// чужой товар и чужие деньги, поэтому заявка проходит проверку продавцом.
// pending — зарегистрировался, ждёт проверки; active — допущен к пулу заказов;
// blocked — доступ закрыт (отказ по заявке или блокировка позже).
export const DRIVER_STATUSES = ["pending", "active", "blocked"] as const
export type DriverStatus = (typeof DRIVER_STATUSES)[number]

// Отказ по заявке и блокировка — одно состояние: причина лежит в status_note.
// Блокировка обратима (разблокировали → снова допущен), поэтому blocked → active.
export const DRIVER_TRANSITIONS: Record<DriverStatus, DriverStatus[]> = {
  pending: ["active", "blocked"],
  active: ["blocked"],
  blocked: ["active"],
}

// Профиль, который водитель заполняет о себе сам. Без ФИО и госномера машины
// продавцу нечего проверять — допустить такую заявку нельзя.
export type DriverProfileView = {
  full_name?: string | null
  vehicle_plate?: string | null
}

// Чистые проверки — standalone-функции, НЕ методы сервиса (правило
// @medusajs/service-methods-must-be-async; идиома logistics/models/constants.ts).
export const isDriverProfileComplete = (driver: DriverProfileView): boolean =>
  !!driver.full_name?.trim() && !!driver.vehicle_plate?.trim()

export const assertDriverTransition = (
  from: DriverStatus,
  to: DriverStatus
): void => {
  if (!DRIVER_TRANSITIONS[from].includes(to)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      `Driver transition ${from} → ${to} is not allowed`
    )
  }
}

// Допустить к работе можно только заполненный профиль: иначе в пуле заказов
// появился бы водитель без имени и машины.
export const assertDriverActivation = (
  driver: DriverProfileView,
  to: DriverStatus
): void => {
  if (to === "active" && !isDriverProfileComplete(driver)) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "Driver profile is incomplete: full name and vehicle plate are required"
    )
  }
}
