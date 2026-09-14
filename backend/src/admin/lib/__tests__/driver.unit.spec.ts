import { DRIVER_STATUS_META, driverVehicleLabel } from "../driver"

// Профиль водитель-gig заполняет о себе САМ, и часть полей может остаться
// пустой до самой проверки заявки. Экран обязан пережить любую комбинацию: в
// колонке «Машина» не должно появляться ни «undefined», ни висящей точки-
// разделителя без второй половины.

describe("driverVehicleLabel", () => {
  it("собирает модель и госномер через разделитель", () => {
    expect(
      driverVehicleLabel({
        vehicle_model: "ГАЗель Next",
        vehicle_plate: "123 ABC 02",
      })
    ).toBe("ГАЗель Next · 123 ABC 02")
  })

  it("отдаёт одну половину без разделителя", () => {
    expect(
      driverVehicleLabel({ vehicle_model: "ГАЗель Next", vehicle_plate: null })
    ).toBe("ГАЗель Next")
    expect(
      driverVehicleLabel({ vehicle_model: null, vehicle_plate: "123 ABC 02" })
    ).toBe("123 ABC 02")
  })

  it("пустой профиль даёт пустую строку — её экран заменяет прочерком", () => {
    expect(
      driverVehicleLabel({ vehicle_model: null, vehicle_plate: null })
    ).toBe("")
    // Пробелы вместо значения — то же, что пусто: водитель мог «заполнить»
    // поле пробелом.
    expect(driverVehicleLabel({ vehicle_model: " ", vehicle_plate: " " })).toBe(
      ""
    )
  })
})

describe("DRIVER_STATUS_META", () => {
  it("описывает все три состояния допуска", () => {
    // Статусы продублированы из модуля в браузерный слой: пропуск одного даёт
    // падение рендера на `META[status].color` (класс дефекта T4.11a).
    expect(Object.keys(DRIVER_STATUS_META).sort()).toEqual([
      "active",
      "blocked",
      "pending",
    ])
  })
})
