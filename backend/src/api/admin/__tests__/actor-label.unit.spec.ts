import { actorLabel } from "../actor-label"

// Подпись автора действия в панели: журнал правок цен и «кто закрыл» в очереди
// отгрузки. Кладовщик читает графу «Кто» как «кто из наших», поэтому почта
// учётки превращается в логин (T10.14e).
describe("actorLabel", () => {
  it("имя учётки оставляет как есть", () => {
    expect(actorLabel("Продавец")).toBe("Продавец")
    expect(actorLabel("Данияр Сеитов")).toBe("Данияр Сеитов")
  })

  it("у учётки без имени показывает логин без домена", () => {
    expect(actorLabel("admin@example.com")).toBe("admin")
    expect(actorLabel("picker.finishing@stroymarket.kz")).toBe("picker.finishing")
  })

  it("пустую подпись не выдумывает", () => {
    expect(actorLabel(null)).toBeNull()
    expect(actorLabel("   ")).toBeNull()
    // Адрес без локальной части резать нечего — пусть будет виден целиком.
    expect(actorLabel("@example.com")).toBe("@example.com")
  })
})
