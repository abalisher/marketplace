import { CATALOG_CATEGORIES, CatalogCategoryHandle } from "./categories"

// Отнесение товара к одной из четырёх категорий по названию — для разбора
// каталога, который заводили ДО решения о категориях (сиды задают категорию
// явно, здесь классификация нужна только миграционному скрипту
// apply-catalog-categories.ts).
//
// Категорию задаёт ГЛАВНОЕ слово названия — то, чем товар является, а не то,
// для чего он: «Саморез по гипсокартону» — метиз, а не отделка, хотя слово
// «гипсокартон» в названии длиннее. Поэтому сначала смотрим первое слово, и
// только если оно ни о чём не сказало — ищем по всему названию, где спор
// решает самое длинное совпавшее слово («труба профильная» — профиль, отделка,
// а не сантехника).
// null — товар не относится ни к одной категории: скрывать такой факт нельзя,
// вызывающий обязан решить, что с ним делать.

// «Ё» → «е», регистр вниз: в названиях каталога встречается и «шпаклёвка»,
// и «шпаклевка», и это одно слово.
const normalize = (value: string): string =>
  value.toLowerCase().replace(/ё/g, "е")

// Первое слово названия. Дефис — разделитель: в «Дюбель-гвоздь» главное слово
// всё равно первое.
const headWord = (title: string): string =>
  normalize(title).split(/[^\p{L}\p{N}]+/u)[0] ?? ""

export const classifyProductCategory = (
  title: string
): CatalogCategoryHandle | null => {
  const head = headWord(title)
  for (const category of CATALOG_CATEGORIES) {
    for (const keyword of category.keywords) {
      const needle = normalize(keyword)
      if (head && needle.includes(" ") === false && head.includes(needle)) {
        return category.handle
      }
    }
  }

  const haystack = normalize(title)
  let best: { handle: CatalogCategoryHandle; length: number } | null = null
  for (const category of CATALOG_CATEGORIES) {
    for (const keyword of category.keywords) {
      const needle = normalize(keyword)
      if (!haystack.includes(needle)) {
        continue
      }
      if (!best || needle.length > best.length) {
        best = { handle: category.handle, length: needle.length }
      }
    }
  }

  return best?.handle ?? null
}
