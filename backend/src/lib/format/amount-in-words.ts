// Сумма прописью для документов-оснований. Требуется и накладной формы З-2
// («всего отпущено ... на сумму прописью»), и счёту: документ без прописи
// бухгалтерия покупателя считает черновиком, а сумму цифрами легко подделать
// дописыванием разряда — пропись это ловит.
//
// Чистая функция (число + код валюты → строка), без Intl: Node на проде собран
// с полной ICU не везде, а склонение «тенге/тиын» ICU всё равно не знает.

type WordForms = readonly [string, string, string] // 1 / 2-4 / 5-20

// Род числительного: тысяча — женского рода («одна тысяча»), остальные разряды
// и тенге — мужского.
type Gender = "m" | "f"

const ONES: Record<Gender, readonly string[]> = {
  m: [
    "",
    "один",
    "два",
    "три",
    "четыре",
    "пять",
    "шесть",
    "семь",
    "восемь",
    "девять",
  ],
  f: [
    "",
    "одна",
    "две",
    "три",
    "четыре",
    "пять",
    "шесть",
    "семь",
    "восемь",
    "девять",
  ],
}

const TEENS = [
  "десять",
  "одиннадцать",
  "двенадцать",
  "тринадцать",
  "четырнадцать",
  "пятнадцать",
  "шестнадцать",
  "семнадцать",
  "восемнадцать",
  "девятнадцать",
]

const TENS = [
  "",
  "",
  "двадцать",
  "тридцать",
  "сорок",
  "пятьдесят",
  "шестьдесят",
  "семьдесят",
  "восемьдесят",
  "девяносто",
]

const HUNDREDS = [
  "",
  "сто",
  "двести",
  "триста",
  "четыреста",
  "пятьсот",
  "шестьсот",
  "семьсот",
  "восемьсот",
  "девятьсот",
]

const THOUSANDS: WordForms = ["тысяча", "тысячи", "тысяч"]
const MILLIONS: WordForms = ["миллион", "миллиона", "миллионов"]
const BILLIONS: WordForms = ["миллиард", "миллиарда", "миллиардов"]

// Разряды от младшего к старшему: форма слова разряда и род числительного.
const SCALES: readonly { forms: WordForms | null; gender: Gender }[] = [
  { forms: null, gender: "m" },
  { forms: THOUSANDS, gender: "f" },
  { forms: MILLIONS, gender: "m" },
  { forms: BILLIONS, gender: "m" },
]

// Формы валют: единица и разменная монета. Незнакомая валюта печатается кодом
// (документы MVP — только в тенге).
const CURRENCIES: Record<
  string,
  { major: WordForms; minor: WordForms; minorGender: Gender }
> = {
  kzt: {
    major: ["тенге", "тенге", "тенге"],
    // «Тиын» в бланках РК не склоняют: «... тенге 00 тиын» (так печатают 1С и
    // типографские бланки), поэтому все три формы одинаковы.
    minor: ["тиын", "тиын", "тиын"],
    minorGender: "m",
  },
}

// Выбор формы слова по числу: 1 рубль / 2 рубля / 5 рублей.
export const pluralForm = (value: number, forms: WordForms): string => {
  const abs = Math.abs(Math.trunc(value))
  const mod100 = abs % 100
  if (mod100 >= 11 && mod100 <= 19) {
    return forms[2]
  }
  const mod10 = abs % 10
  if (mod10 === 1) {
    return forms[0]
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return forms[1]
  }
  return forms[2]
}

// Триада 1..999 словами.
const tripletInWords = (value: number, gender: Gender): string[] => {
  const words: string[] = []
  const hundreds = Math.floor(value / 100)
  const rest = value % 100
  if (hundreds > 0) {
    words.push(HUNDREDS[hundreds])
  }
  if (rest >= 10 && rest <= 19) {
    words.push(TEENS[rest - 10])
    return words
  }
  const tens = Math.floor(rest / 10)
  const ones = rest % 10
  if (tens > 0) {
    words.push(TENS[tens])
  }
  if (ones > 0) {
    words.push(ONES[gender][ones])
  }
  return words
}

// Целое число словами («ноль» для нуля). Отрицательные — с приставкой «минус»
// (в документах не встречаются, но функция общая).
export const integerInWords = (value: number, gender: Gender = "m"): string => {
  const rounded = Math.trunc(value)
  if (rounded === 0) {
    return "ноль"
  }
  const words: string[] = []
  if (rounded < 0) {
    words.push("минус")
  }
  let rest = Math.abs(rounded)
  const triplets: number[] = []
  while (rest > 0) {
    triplets.push(rest % 1000)
    rest = Math.floor(rest / 1000)
  }
  for (let scale = triplets.length - 1; scale >= 0; scale--) {
    const triplet = triplets[scale]
    if (triplet === 0) {
      continue
    }
    // Разряды выше миллиардов в документах не бывают — старшие триады
    // печатаются мужским родом без слова разряда.
    const meta = SCALES[scale] ?? { forms: null, gender: "m" as Gender }
    words.push(...tripletInWords(triplet, scale === 0 ? gender : meta.gender))
    if (meta.forms) {
      words.push(pluralForm(triplet, meta.forms))
    }
  }
  return words.join(" ")
}

// Сумма прописью в бухгалтерском виде: «Сто двадцать три тысячи тенге 00 тиын».
// Целая часть — словами с заглавной буквы, разменная — цифрами двумя знаками
// (так печатают 1С и типовые бланки: цифры в копейках не подделаешь припиской).
export const amountInWords = (amount: number, currency: string): string => {
  const code = (currency || "kzt").toLowerCase()
  const forms = CURRENCIES[code]
  const safeAmount = Number.isFinite(amount) ? amount : 0
  const major = Math.trunc(Math.abs(safeAmount))
  const minor = Math.round((Math.abs(safeAmount) - major) * 100)
  // Округление вверх до целой единицы: 99.999 → 100 тенге 00 тиын.
  const carry = minor === 100 ? 1 : 0
  const majorFinal = major + carry
  const minorFinal = carry ? 0 : minor
  const sign = safeAmount < 0 ? "минус " : ""

  if (!forms) {
    const words = `${sign}${integerInWords(majorFinal)}`
    return `${capitalize(words)} ${code.toUpperCase()}`
  }

  const words = `${sign}${integerInWords(majorFinal)} ${pluralForm(
    majorFinal,
    forms.major
  )}`
  const minorLabel = pluralForm(minorFinal, forms.minor)
  return `${capitalize(words)} ${String(minorFinal).padStart(2, "0")} ${minorLabel}`
}

const capitalize = (value: string): string =>
  value.length === 0 ? value : value[0].toUpperCase() + value.slice(1)
