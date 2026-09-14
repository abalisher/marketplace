// DTO admin-API водителей (backend/src/api/admin/drivers/**) и метаданные
// допуска для экранов панели. Статусы продублированы из модели намеренно: код
// модуля нельзя импортировать в браузерный бандл админки.

export type DriverStatus = "pending" | "active" | "blocked"

export type AdminDriver = {
  id: string
  phone: string
  full_name: string | null
  vehicle_model: string | null
  vehicle_plate: string | null
  capacity_kg: number | null
  status: DriverStatus
  // Причина отказа или блокировки — её водитель видит у себя в приложении.
  status_note: string | null
  status_changed_at: string | null
  // Кто решил — именем сотрудника, а не `user_id` (сервер id наружу не отдаёт).
  status_changed_by_name: string | null
  // Считает сервер: без ФИО и госномера заявку допустить нельзя.
  profile_complete: boolean
  created_at: string | null
}

export type AdminDriversListResponse = {
  drivers: AdminDriver[]
  count: number
  offset: number
  limit: number
}

export type AdminDriverResponse = {
  driver: AdminDriver
}

// Метаданные допуска. label — i18n-ключ (рендерится через t(...) в местах
// потребления). color — палитра StatusBadge (карточка), dotClass — точка в
// списках (идиома StatusCell стандартных таблиц ядра).
export const DRIVER_STATUS_META: Record<
  DriverStatus,
  { label: string; color: "orange" | "green" | "red"; dotClass: string }
> = {
  pending: {
    label: "drivers.status.pending",
    color: "orange",
    dotClass: "bg-ui-tag-orange-icon",
  },
  active: {
    label: "drivers.status.active",
    color: "green",
    dotClass: "bg-ui-tag-green-icon",
  },
  blocked: {
    label: "drivers.status.blocked",
    color: "red",
    dotClass: "bg-ui-tag-red-icon",
  },
}

// Машина одной строкой: «ГАЗель Next · 123 ABC 02». Водитель заполняет профиль
// сам и мог указать только часть — строка собирается из того, что есть.
export const driverVehicleLabel = (driver: {
  vehicle_model: string | null
  vehicle_plate: string | null
}): string =>
  [driver.vehicle_model, driver.vehicle_plate]
    .map((part) => part?.trim())
    .filter((part): part is string => !!part)
    .join(" · ")
