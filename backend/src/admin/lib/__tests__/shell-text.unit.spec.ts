import { coreLabel, isNoiseRowTitle } from "../shell-text"

// Часть надписей дашборд рисует строкой в коде, а не через i18n: «Total
// pending» на карточке платежей, статусы платежа, идентификаторы провайдеров
// (`pp_kaspi_kaspi`) и дата «02 Sep, 2026, 14:02:49». Их подменяет текстовый
// слой оболочки. Тест закрепляет главные свойства правила: подмена идёт по
// ТОЧНОМУ совпадению узла целиком (иначе слой начнёт переписывать чужой текст —
// адреса, имена, комментарии) и только в русской панели.

describe("coreLabel", () => {
  it("переводит подписи карточки платежей", () => {
    expect(coreLabel("Total pending", "ru")).toBe("Ожидает оплаты")
    expect(coreLabel("Pending", "ru")).toBe("Ожидает")
    expect(coreLabel("Captured", "ru")).toBe("Оплачен")
    expect(coreLabel("Add", "ru")).toBe("Добавить")
  })

  it("называет провайдеров по-человечески", () => {
    // Ядро печатает идентификатор как есть и «капитализирует» его стилем —
    // продавец читает «Pp_kaspi_kaspi».
    expect(coreLabel("pp_kaspi_kaspi", "ru")).toBe("Kaspi QR")
    expect(coreLabel("pp_system_default", "ru")).toBe("Оплата вручную")
    expect(coreLabel("manual_manual", "ru")).toBe("Своя доставка")
  })

  it("не смотрит на отступы вокруг текста", () => {
    expect(coreLabel("\n  Total pending\n", "ru")).toBe("Ожидает оплаты")
  })

  it("не трогает текст, в котором подпись лишь часть", () => {
    expect(coreLabel("Total pending: 12 000 ₸", "ru")).toBeNull()
    expect(coreLabel("Оплата через pp_kaspi_kaspi", "ru")).toBeNull()
  })

  it("в английской панели оставляет ядровые надписи как есть", () => {
    expect(coreLabel("Total pending", "en")).toBeNull()
    expect(coreLabel("Captured", "en")).toBeNull()
  })

  it("переводит дату ядра на язык панели", () => {
    // Ядро печатает дату своим форматтером с английскими месяцами независимо
    // от языка панели, поэтому дату пересчитываем в обеих локалях. В тестах
    // локаль панели английская (нет document), так что проверяем сам факт
    // пересчёта: строка ядра ушла, дата осталась той же.
    const label = coreLabel("02 Sep, 2026, 14:02:49", "en")
    expect(label).not.toBeNull()
    expect(label).not.toContain("02 Sep, 2026")
    expect(label).toContain("2026")
    expect(coreLabel("03 Aug, 2026", "ru")).toContain("2026")
  })

  it("не принимает за дату похожий текст", () => {
    expect(coreLabel("02 Sep 2026", "ru")).toBeNull()
    expect(coreLabel("02 Сен, 2026, 14:02:49", "ru")).toBeNull()
    expect(coreLabel("Заказ от 02 Sep, 2026, 14:02:49", "ru")).toBeNull()
  })

  it("не трогает всё остальное", () => {
    expect(coreLabel("", "ru")).toBeNull()
    expect(coreLabel("   ", "ru")).toBeNull()
    expect(coreLabel("Ожидает оплаты", "ru")).toBeNull()
    expect(coreLabel("Отгрузка", "ru")).toBeNull()
  })
})

describe("isNoiseRowTitle", () => {
  it("узнаёт таможенные поля карточки товара в обеих локалях", () => {
    expect(isNoiseRowTitle("MID код")).toBe(true)
    expect(isNoiseRowTitle("HS код")).toBe(true)
    expect(isNoiseRowTitle("Mid code")).toBe(true)
    expect(isNoiseRowTitle("HS code")).toBe(true)
  })

  it("не трогает рабочие поля", () => {
    expect(isNoiseRowTitle("Высота")).toBe(false)
    expect(isNoiseRowTitle("Вес")).toBe(false)
    expect(isNoiseRowTitle("Страна происхождения")).toBe(false)
  })
})
