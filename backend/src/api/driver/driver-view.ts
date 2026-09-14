import { DriverRecord } from "../../modules/driver/types"
import { isDriverProfileComplete } from "../../modules/driver/models/constants"

// Профиль водителя, как его видит приложение водителя и панель продавца.
// Технические поля записи (created_at/updated_at/deleted_at) наружу не
// отдаём; `profile_complete` считаем на сервере — клиент не должен знать, из
// каких полей складывается «заявку можно рассматривать» (правило «логика
// только в бэкенде»).
export type DriverView = {
  id: string
  phone: string
  full_name: string | null
  vehicle_model: string | null
  vehicle_plate: string | null
  capacity_kg: number | null
  status: string
  status_note: string | null
  status_changed_at: string | null
  profile_complete: boolean
  created_at: string | null
}

const iso = (value: unknown): string | null =>
  value instanceof Date ? value.toISOString() : ((value as string) ?? null)

export const toDriverView = (driver: DriverRecord): DriverView => ({
  id: driver.id,
  phone: driver.phone,
  full_name: driver.full_name ?? null,
  vehicle_model: driver.vehicle_model ?? null,
  vehicle_plate: driver.vehicle_plate ?? null,
  capacity_kg: driver.capacity_kg ?? null,
  status: driver.status,
  status_note: driver.status_note ?? null,
  status_changed_at: iso(driver.status_changed_at),
  profile_complete: isDriverProfileComplete(driver),
  created_at: iso(driver.created_at),
})
