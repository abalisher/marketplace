import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import Driver from "./models/driver"
import {
  assertDriverActivation,
  assertDriverTransition,
  DriverStatus,
} from "./models/constants"

// Профиль водителя-gig и его допуск к работе. CRUD генерируется MedusaService;
// здесь — инварианты: один водитель на номер, стейт-машина допуска, запрет
// допускать незаполненный профиль. Выдача сессии и связывание с учётной
// сущностью auth-модуля — слой workflow (модуль auth не знает о водителе, а
// водитель — об auth). См. docs/modules/driver.md.
class DriverModuleService extends MedusaService({ Driver }) {
  // Водитель по номеру в каноне +7XXXXXXXXXX (null — такого ещё нет).
  async findByPhone(phone: string) {
    const [driver] = await this.listDrivers({ phone }, { take: 1 })
    return driver ?? null
  }

  // Самрегистрация: заявка заводится в pending — до проверки продавцом
  // водитель в пуле заказов не появляется. Повторная регистрация с того же
  // номера возвращает существующую заявку (вход и регистрация — один путь).
  async registerDriver(input: { phone: string; full_name?: string | null }) {
    const existing = await this.findByPhone(input.phone)
    if (existing) {
      return existing
    }
    return await this.createDrivers({
      phone: input.phone,
      full_name: normalizeName(input.full_name),
      status: "pending",
    })
  }

  // Водитель заполняет профиль о себе сам. Присланные поля перезаписываются,
  // остальные остаются как были (undefined ≠ «очистить»).
  async updateProfile(input: {
    id: string
    full_name?: string | null
    vehicle_model?: string | null
    vehicle_plate?: string | null
    capacity_kg?: number | null
  }) {
    const patch: Record<string, unknown> = { id: input.id }
    if (input.full_name !== undefined) {
      patch.full_name = normalizeName(input.full_name)
    }
    if (input.vehicle_model !== undefined) {
      patch.vehicle_model = normalizeName(input.vehicle_model)
    }
    if (input.vehicle_plate !== undefined) {
      patch.vehicle_plate = normalizePlate(input.vehicle_plate)
    }
    if (input.capacity_kg !== undefined) {
      patch.capacity_kg = normalizeCapacity(input.capacity_kg)
    }
    return await this.updateDrivers(patch)
  }

  // Продавец закрывает заявку или меняет допуск: pending → active/blocked,
  // blocked ↔ active. Причина (note) уходит водителю в приложение.
  async setStatus(input: {
    id: string
    status: DriverStatus
    note?: string | null
    actor_id?: string | null
  }) {
    const driver = await this.retrieveDriver(input.id)
    assertDriverTransition(driver.status as DriverStatus, input.status)
    assertDriverActivation(driver, input.status)

    return await this.updateDrivers({
      id: input.id,
      status: input.status,
      status_note: input.note?.trim() || null,
      status_changed_at: new Date(),
      status_changed_by: input.actor_id ?? null,
    })
  }
}

// Человеческий текст в профиле: обрезаем края и лишние пробелы внутри, пустое
// значение считаем отсутствующим (в базе — null, а не пустая строка).
const normalizeName = (value?: string | null): string | null => {
  const normalized = (value ?? "").trim().replace(/\s+/g, " ")
  return normalized || null
}

// Госномер — в верхнем регистре без лишних пробелов: его сверяют глазами на
// складе и в панели, поэтому вид должен быть одинаковым у всех водителей.
const normalizePlate = (value?: string | null): string | null =>
  normalizeName(value)?.toUpperCase() ?? null

// Грузоподъёмность — целые килограммы; 0 и мусор считаем «не указано».
const normalizeCapacity = (value?: number | null): number | null => {
  if (value === null || value === undefined) {
    return null
  }
  const capacity = Math.floor(Number(value))
  if (!Number.isFinite(capacity) || capacity <= 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Driver capacity must be a positive number of kilograms, got ${value}`
    )
  }
  return capacity
}

export default DriverModuleService
