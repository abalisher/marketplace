import {
  assertDriverActivation,
  assertDriverTransition,
  DRIVER_STATUSES,
  DriverStatus,
  isDriverProfileComplete,
} from "../models/constants"

// Чистые инварианты допуска водителя: стейт-машина статуса и правило
// «нельзя допустить незаполненный профиль». Без БД.
describe("driver rules", () => {
  describe("assertDriverTransition", () => {
    it("разрешает решение по заявке и блокировку", () => {
      expect(() => assertDriverTransition("pending", "active")).not.toThrow()
      expect(() => assertDriverTransition("pending", "blocked")).not.toThrow()
      expect(() => assertDriverTransition("active", "blocked")).not.toThrow()
      // Блокировка обратима: разблокировали — снова допущен.
      expect(() => assertDriverTransition("blocked", "active")).not.toThrow()
    })

    it("не возвращает водителя в «ожидает проверки»", () => {
      for (const from of ["active", "blocked"] as DriverStatus[]) {
        expect(() => assertDriverTransition(from, "pending")).toThrow(
          /not allowed/
        )
      }
    })

    it("запрещает переход в тот же статус", () => {
      for (const status of DRIVER_STATUSES) {
        expect(() => assertDriverTransition(status, status)).toThrow(
          /not allowed/
        )
      }
    })
  })

  describe("isDriverProfileComplete", () => {
    it("требует ФИО и госномер машины", () => {
      expect(
        isDriverProfileComplete({ full_name: "Иванов", vehicle_plate: "123ABC02" })
      ).toBe(true)
      expect(isDriverProfileComplete({ full_name: "Иванов" })).toBe(false)
      expect(isDriverProfileComplete({ vehicle_plate: "123ABC02" })).toBe(false)
      expect(isDriverProfileComplete({})).toBe(false)
    })

    it("пробелы за значение не считает", () => {
      expect(
        isDriverProfileComplete({ full_name: "   ", vehicle_plate: "123ABC02" })
      ).toBe(false)
    })
  })

  describe("assertDriverActivation", () => {
    it("не допускает к заказам незаполненный профиль", () => {
      expect(() => assertDriverActivation({}, "active")).toThrow(/incomplete/)
    })

    it("блокировать можно любого", () => {
      expect(() => assertDriverActivation({}, "blocked")).not.toThrow()
    })
  })
})
