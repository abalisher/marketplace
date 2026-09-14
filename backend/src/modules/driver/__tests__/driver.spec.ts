import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { DRIVER_MODULE } from ".."
import DriverModuleService from "../service"
import Driver from "../models/driver"

jest.setTimeout(120000)

// Интеграционный тест модуля: сценарии сервиса на временной БД (.env.test) —
// самрегистрация по номеру, заполнение профиля водителем, решение продавца по
// заявке. Чистые инварианты проверяет driver-rules.unit.spec.ts.
moduleIntegrationTestRunner<DriverModuleService>({
  moduleName: DRIVER_MODULE,
  moduleModels: [Driver],
  resolve: "./src/modules/driver",
  testSuite: ({ service }) => {
    let seq = 0
    const nextPhone = () => `+7701${String(3000000 + ++seq).padStart(7, "0")}`

    describe("DriverModuleService", () => {
      it("заводит заявку в «ожидает проверки»", async () => {
        const driver = await service.registerDriver({ phone: nextPhone() })

        expect(driver.id).toMatch(/^drv_/)
        expect(driver.status).toEqual("pending")
        expect(driver.full_name).toBeNull()
      })

      it("повторная регистрация с того же номера не плодит водителей", async () => {
        const phone = nextPhone()
        const first = await service.registerDriver({ phone })
        const second = await service.registerDriver({ phone })

        expect(second.id).toEqual(first.id)
        expect(await service.findByPhone(phone)).toMatchObject({ id: first.id })
      })

      it("находит по номеру и молчит про незнакомый", async () => {
        expect(await service.findByPhone(nextPhone())).toBeNull()
      })

      it("сохраняет профиль: пробелы срезаны, госномер в верхнем регистре", async () => {
        const driver = await service.registerDriver({ phone: nextPhone() })
        const updated = await service.updateProfile({
          id: driver.id,
          full_name: "  Бауыржан   Сатыбалдиев ",
          vehicle_model: "ГАЗель Next",
          vehicle_plate: " 123 abc 02 ",
          capacity_kg: 1500,
        })

        expect(updated.full_name).toEqual("Бауыржан Сатыбалдиев")
        expect(updated.vehicle_plate).toEqual("123 ABC 02")
        expect(updated.capacity_kg).toEqual(1500)
      })

      it("не присланные поля профиля не трогает", async () => {
        const driver = await service.registerDriver({ phone: nextPhone() })
        await service.updateProfile({ id: driver.id, full_name: "Иванов" })
        const updated = await service.updateProfile({
          id: driver.id,
          vehicle_plate: "777AAA02",
        })

        expect(updated.full_name).toEqual("Иванов")
        expect(updated.vehicle_plate).toEqual("777AAA02")
      })

      it("пустое значение в профиле очищает поле", async () => {
        const driver = await service.registerDriver({ phone: nextPhone() })
        await service.updateProfile({ id: driver.id, vehicle_model: "Газель" })
        const cleared = await service.updateProfile({
          id: driver.id,
          vehicle_model: "  ",
        })

        expect(cleared.vehicle_model).toBeNull()
      })

      it("отклоняет неположительную грузоподъёмность", async () => {
        const driver = await service.registerDriver({ phone: nextPhone() })
        await expect(
          service.updateProfile({ id: driver.id, capacity_kg: 0 })
        ).rejects.toThrow(/capacity/)
      })

      it("допускает к работе заполненный профиль и помнит, кто решил", async () => {
        const driver = await service.registerDriver({ phone: nextPhone() })
        await service.updateProfile({
          id: driver.id,
          full_name: "Бауыржан",
          vehicle_plate: "123ABC02",
        })

        const active = await service.setStatus({
          id: driver.id,
          status: "active",
          actor_id: "usr_seller",
        })

        expect(active.status).toEqual("active")
        expect(active.status_changed_by).toEqual("usr_seller")
        expect(active.status_changed_at).toBeTruthy()
      })

      it("не допускает к работе незаполненный профиль", async () => {
        const driver = await service.registerDriver({ phone: nextPhone() })

        await expect(
          service.setStatus({ id: driver.id, status: "active" })
        ).rejects.toThrow(/incomplete/)
      })

      it("блокирует с причиной и разблокирует обратно", async () => {
        const driver = await service.registerDriver({ phone: nextPhone() })
        await service.updateProfile({
          id: driver.id,
          full_name: "Бауыржан",
          vehicle_plate: "123ABC02",
        })

        const blocked = await service.setStatus({
          id: driver.id,
          status: "blocked",
          note: "Не выходит на связь",
        })
        expect(blocked.status).toEqual("blocked")
        expect(blocked.status_note).toEqual("Не выходит на связь")

        const back = await service.setStatus({ id: driver.id, status: "active" })
        expect(back.status).toEqual("active")
        // Причина прошлой блокировки не тянется за водителем.
        expect(back.status_note).toBeNull()
      })

      it("держит стейт-машину допуска", async () => {
        const driver = await service.registerDriver({ phone: nextPhone() })

        await expect(
          service.setStatus({ id: driver.id, status: "pending" as never })
        ).rejects.toThrow(/not allowed/)
      })
    })
  },
})
