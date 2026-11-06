import { CATALOG_CATEGORIES, CatalogCategoryHandle } from "./categories"

// Отнесение товара к одной из четырёх категорий по названию — для разбора
// каталога, который заводили ДО решения о категориях (сиды задают категорию
// явно, здесь классификация нужна только миграционному скрипту
// apply-catalog-categories.ts).
//
// Категорию задаёт ГЛАВНОЕ слово названия — то, чем товар является, а не то,
// для чего он: «Саморез по гипсокартону» — метиз, а не отделка, хотя слово
// «гипсокартон» в названии длиннее. Порядок проверок:
//  1. фраза из нескольких слов («труба профильная», «авт. выкл») — самая точная
//     примета, она важнее первого слова («Труба профильная» — металлопрокат,
//     отделка, а не сантехника);
//  2. первое слово названия;
//  3. самое длинное слово справочника где-либо в названии.
// Слово справочника совпадает с НАЧАЛОМ слова названия: основа «гвозд» ловит
// «гвозди», но «щит» не ловит «защитный». Исключения категории (excludes)
// снимают её с рассмотрения: «Щиток защитный» — не электрика.
// null — товар не относится ни к одной категории: скрывать такой факт нельзя,
// вызывающий обязан решить, что с ним делать.

// «Ё» → «е», регистр вниз: в названиях каталога встречается и «шпаклёвка»,
// и «шпаклевка», и это одно слово.
const normalize = (value: string): string =>
  value.toLowerCase().replace(/ё/g, "е")

// Первое слово названия. Дефис — разделитель: в «Дюбель-гвоздь» главное слово
// всё равно первое.
const headWord = (title: string): string =>
  normalize(title).split(/[^\p{L}\p{N}]+/u).find(Boolean) ?? ""

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// Фраза — ключ с пробелом, дефисом или точкой внутри.
const isPhrase = (keyword: string): boolean => /[^\p{L}\p{N}]/u.test(keyword)

// Ключ стоит в начале какого-либо слова названия.
const occursAtWordStart = (haystack: string, needle: string): boolean =>
  new RegExp(`(?:^|[^\\p{L}\\p{N}])${escapeRegExp(needle)}`, "u").test(haystack)

export const classifyProductCategory = (
  title: string
): CatalogCategoryHandle | null => {
  const haystack = normalize(title)
  const head = headWord(title)
  const categories = CATALOG_CATEGORIES.filter(
    (category) =>
      !(category.excludes ?? []).some((phrase) =>
        occursAtWordStart(haystack, normalize(phrase))
      )
  )

  const longest = (phrases: boolean): CatalogCategoryHandle | null => {
    let best: { handle: CatalogCategoryHandle; length: number } | null = null
    for (const category of categories) {
      for (const keyword of category.keywords) {
        const needle = normalize(keyword)
        if (isPhrase(needle) !== phrases || !occursAtWordStart(haystack, needle)) {
          continue
        }
        if (!best || needle.length > best.length) {
          best = { handle: category.handle, length: needle.length }
        }
      }
    }
    return best?.handle ?? null
  }

  const byPhrase = longest(true)
  if (byPhrase) {
    return byPhrase
  }

  if (head) {
    for (const category of categories) {
      for (const keyword of category.keywords) {
        const needle = normalize(keyword)
        if (!isPhrase(needle) && head.startsWith(needle)) {
          return category.handle
        }
      }
    }
  }

  return longest(false)
}
