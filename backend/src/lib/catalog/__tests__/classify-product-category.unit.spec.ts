import { CATALOG_CATEGORIES } from "../categories"
import { classifyProductCategory } from "../classify-product-category"

// Unit: разбор каталога по четырём категориям (T10.10). Классификатор нужен
// миграционному скрипту apply-catalog-categories — ошибка здесь тихо уводит
// товар не к тому сборщику, поэтому проверяем и спорные названия, и товары
// вне ассортимента.

describe("classifyProductCategory", () => {
  it("relates a product by the head word of its title", () => {
    expect(classifyProductCategory("Гипсокартон ГКЛ 12.5 мм")).toEqual(
      "finishing"
    )
    expect(classifyProductCategory("Кабель ВВГнг-LS 3×2.5")).toEqual(
      "electrical"
    )
    expect(classifyProductCategory("Труба полипропиленовая PN20")).toEqual(
      "plumbing"
    )
    expect(classifyProductCategory("Анкер клиновой")).toEqual("fasteners")
  })

  it("keeps «Саморез по гипсокартону» in fasteners: what it IS wins over what it is FOR", () => {
    // Самый длинный кусок названия — «гипсокартон» (отделка), но товар всё-таки
    // метиз: категорию задаёт главное слово, иначе сборщик отделки получил бы
    // чужую позицию.
    expect(classifyProductCategory("Саморез по гипсокартону")).toEqual(
      "fasteners"
    )
    expect(classifyProductCategory("Дюбель-гвоздь")).toEqual("fasteners")
    expect(classifyProductCategory("Подрозетник для бетона D68")).toEqual(
      "electrical"
    )
  })

  it("falls back to the longest match when the head word says nothing", () => {
    expect(classifyProductCategory("Смесь сухая для стяжки")).toEqual(
      "finishing"
    )
    // Первое слово — не из справочника, решает самое длинное совпадение.
    expect(classifyProductCategory("Гибкая подводка для смесителя")).toEqual(
      "plumbing"
    )
  })

  it("ignores case and «ё»", () => {
    expect(classifyProductCategory("ШПАКЛЁВКА финишная")).toEqual("finishing")
    expect(classifyProductCategory("шпаклевка стартовая")).toEqual("finishing")
  })

  it("returns null for goods outside the four categories", () => {
    // Общестрой ушёл из ассортимента (решение владельца 2026-09-01): скрипт
    // обязан увидеть их как «вне ассортимента», а не разложить наугад.
    for (const title of [
      "Песок строительный мытый",
      "Щебень гранитный фр. 5–20 мм",
      "Кирпич керамический рядовой М150",
      "Арматура А500С 12 мм",
      "Газоблок автоклавный D500",
      "Доска обрезная хвоя 50×150×6000",
      "Металлочерепица Монтеррей 0.45 мм",
      "Утеплитель минеральная вата 100 мм",
    ]) {
      expect(classifyProductCategory(title)).toBeNull()
    }
  })

  it("has exactly four categories with unique handles", () => {
    expect(CATALOG_CATEGORIES).toHaveLength(4)
    expect(new Set(CATALOG_CATEGORIES.map((c) => c.handle)).size).toEqual(4)
    for (const category of CATALOG_CATEGORIES) {
      expect(category.keywords.length).toBeGreaterThan(0)
      expect(category.name.trim()).not.toEqual("")
    }
  })
})
