import type { ReceiptVerdict } from "../../modules/order-payment/models/values"
import type { RecognizedReceipt } from "./receipt-ai"
import { roundMoney } from "./order-payment-state"

// Проверки чека Kaspi, присланного покупателем. Чистые правила: на вход —
// распознанный чек и то, с чем его сверяем (заказ, продавец, другие чеки),
// на выход — список замечаний и итог. Проверки ловят несоответствие (чужой
// получатель, чек старше заказа, повтор номера или файла) — подделку, в которой
// всё нарисовано «правильно», они не исключают: её видит только продавец в
// своём приложении Kaspi.

export type ReceiptCheckCode =
  | "not_receipt"
  | "unreadable"
  | "not_kaspi"
  | "not_success"
  | "status_unknown"
  | "amount_missing"
  | "amount_over"
  | "amount_partial"
  | "recipient_phone_mismatch"
  | "recipient_name_mismatch"
  | "recipient_bin_mismatch"
  | "recipient_unknown"
  | "recipient_unverified"
  | "date_missing"
  | "date_before_order"
  | "date_in_future"
  | "number_missing"
  | "number_reused"
  | "file_reused"
  | "comment_other_order"
  | "tamper_signs"

export type ReceiptCheckLevel = "warning" | "fail"

export type ReceiptCheck = {
  code: ReceiptCheckCode
  level: ReceiptCheckLevel
  // Подробность для человека: номер заказа повтора, признаки правки.
  detail?: string | null
}

export type ReceiptCheckContext = {
  // Сколько покупатель должен по заказу сейчас.
  outstanding: number
  order_display_id: number | null
  // Номер заказа для людей (ORG-26-0007); у заказов до 2026-11-02 — null.
  order_number?: string | null
  order_created_at: Date
  // Куда продавец просит переводить.
  seller_phone: string | null
  seller_recipient: string | null
  // ИИН/БИН продавца (компании заказа) — сверяется с чеком оплаты по Kaspi QR.
  seller_bin: string | null
  // Тот же номер квитанции или тот же файл уже были — у какого заказа.
  // Подпись того заказа («ORG-26-0003» или «№5»), null — заказ не найден.
  number_reused_by: string | number | null | undefined
  file_reused_by: string | number | null | undefined
  now: Date
}

// Погрешность времени: часы телефона и сервера, чек оплаты за минуту до
// оформления, пока покупатель ждал страницу.
const CLOCK_SLACK_MS = 15 * 60_000
const ASTANA_OFFSET = "+05:00"

// Дата чека: «2026-10-30T14:05» — местное время Казахстана, «2026-10-30» —
// только дата (тогда сравниваем концом суток).
export const receiptPaidAt = (value: string | null): { at: Date; dateOnly: boolean } | null => {
  if (!value) {
    return null
  }
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value)
  const iso = dateOnly
    ? `${value}T23:59:59${ASTANA_OFFSET}`
    : /[zZ]|[+-]\d{2}:?\d{2}$/.test(value)
    ? value
    : `${value.length === 16 ? `${value}:00` : value}${ASTANA_OFFSET}`
  const at = new Date(iso)
  return Number.isNaN(at.getTime()) ? null : { at, dateOnly }
}

const digits = (value: string | null) => (value ?? "").replace(/\D+/g, "")

// Номер получателя в чеке Kaspi обычно скрыт: «+7 707 *** ** 26». Сверяем
// только видимые цифры — начало до звёздочек и хвост после них — с номером
// продавца. Нечего сверять (номера нет или продавец его не указал) — совпал.
export const phoneMatches = (
  sellerPhone: string | null,
  receiptPhone: string | null
): boolean => {
  const seller = digits(sellerPhone).replace(/^8/, "7")
  const shown = receiptPhone ?? ""
  if (!seller || !digits(shown)) {
    return true
  }
  if (!shown.includes("*")) {
    const full = digits(shown).replace(/^8/, "7")
    return full.slice(-10) === seller.slice(-10)
  }
  const head = digits(shown.slice(0, shown.indexOf("*"))).replace(/^8/, "7")
  const tail = digits(shown.slice(shown.lastIndexOf("*") + 1))
  return (!head || seller.startsWith(head)) && (!tail || seller.endsWith(tail))
}

// Казахские буквы — к русским: Kaspi печатает имя как в документах
// («Нұржігіт Е.»), а продавец в настройках пишет как привык («Нуржигит Е.»).
const KAZAKH_LETTERS: Record<string, string> = {
  ә: "а",
  ғ: "г",
  қ: "к",
  ң: "н",
  ө: "о",
  ұ: "у",
  ү: "у",
  һ: "х",
  і: "и",
  ё: "е",
}

const nameWords = (value: string | null): string[] =>
  (value ?? "")
    .toLowerCase()
    .replace(/[әғқңөұүһіё]/g, (letter) => KAZAKH_LETTERS[letter])
    .trim()
    .split(/[\s.]+/)
    .filter(Boolean)

// Имя получателя «Нурлан Б.» против того, что продавец указал: Kaspi
// печатает имя и первую букву фамилии — сравниваем имя целиком и, если она
// есть с обеих сторон, первую букву фамилии.
export const recipientNameMatches = (
  sellerRecipient: string | null,
  receiptRecipient: string | null
): boolean => {
  const [sellerFirst, sellerLast] = nameWords(sellerRecipient)
  const [receiptFirst, receiptLast] = nameWords(receiptRecipient)
  if (!sellerFirst || !receiptFirst) {
    return true
  }
  if (sellerFirst !== receiptFirst) {
    return false
  }
  return !sellerLast || !receiptLast || sellerLast[0] === receiptLast[0]
}

// Подпись заказа повтора: номер нового вида как есть, старый display_id — «№5».
const reusedBy = (value: string | number | null | undefined): string | null =>
  value == null || value === "" ? null : typeof value === "number" ? `№${value}` : value

export const checkReceipt = (
  receipt: RecognizedReceipt | null,
  context: ReceiptCheckContext
): ReceiptCheck[] => {
  const checks: ReceiptCheck[] = []
  const add = (code: ReceiptCheckCode, level: ReceiptCheckLevel, detail?: string | null) =>
    checks.push({ code, level, detail: detail ?? null })

  if (context.file_reused_by !== undefined) {
    add("file_reused", "fail", reusedBy(context.file_reused_by))
  }
  if (!receipt) {
    add("unreadable", "warning")
    return checks
  }
  if (!receipt.is_receipt) {
    add("not_receipt", "fail")
    return checks
  }

  if (receipt.bank && !/kaspi|каспи/i.test(receipt.bank)) {
    add("not_kaspi", "warning", receipt.bank)
  }
  if (receipt.success === false) {
    add("not_success", "fail")
  } else if (receipt.success === null) {
    add("status_unknown", "warning")
  }

  if (receipt.amount === null) {
    add("amount_missing", "fail")
  } else if (roundMoney(receipt.amount) > roundMoney(context.outstanding)) {
    add("amount_over", "warning")
  } else if (roundMoney(receipt.amount) < roundMoney(context.outstanding)) {
    add("amount_partial", "warning")
  }

  // Получатель. Чек оплаты по Kaspi QR несёт ИИН/БИН продавца — самая точная
  // сверка. В квитанции перевода номера получателя обычно нет, и тогда
  // единственная улика — имя: не совпало — чек под подозрением.
  const sellerBin = digits(context.seller_bin)
  if (receipt.recipient_bin) {
    if (sellerBin && receipt.recipient_bin !== sellerBin) {
      add("recipient_bin_mismatch", "fail", `${receipt.recipient_name ?? ""} ${receipt.recipient_bin}`.trim())
    } else if (!sellerBin) {
      add("recipient_unverified", "warning")
    }
  } else {
    const phoneVisible = !!digits(receipt.recipient_phone)
    const phoneOk = phoneMatches(context.seller_phone, receipt.recipient_phone)
    if (!phoneOk) {
      add("recipient_phone_mismatch", "fail", receipt.recipient_phone)
    }
    if (!recipientNameMatches(context.seller_recipient, receipt.recipient_name)) {
      add(
        "recipient_name_mismatch",
        phoneVisible && phoneOk && digits(context.seller_phone) ? "warning" : "fail",
        receipt.recipient_name
      )
    }
    if (!phoneVisible && !receipt.recipient_name) {
      add("recipient_unknown", "warning")
    } else if (
      !(phoneVisible && digits(context.seller_phone)) &&
      !(receipt.recipient_name && nameWords(context.seller_recipient).length)
    ) {
      // Сверять не с чем: продавец не указал, на чьё имя переводить.
      add("recipient_unverified", "warning")
    }
  }

  const paid = receiptPaidAt(receipt.paid_at)
  if (!paid) {
    add("date_missing", "warning")
  } else {
    if (paid.at.getTime() > context.now.getTime() + (paid.dateOnly ? 24 * 3_600_000 : CLOCK_SLACK_MS)) {
      add("date_in_future", "fail")
    }
    // Чек только с датой: «раньше заказа» — если сутки чека кончились до заказа.
    if (paid.at.getTime() < context.order_created_at.getTime() - CLOCK_SLACK_MS) {
      add("date_before_order", "fail")
    }
  }

  if (!receipt.receipt_number) {
    add("number_missing", "warning")
  } else if (context.number_reused_by !== undefined) {
    add("number_reused", "fail", reusedBy(context.number_reused_by))
  }

  // В комментарии указан ДРУГОЙ заказ — перевод, скорее всего, за него.
  // Номер нового вида — «ORG-26-0007» (ноли в хвосте можно не писать);
  // у старых заказов — просто цифры.
  const comment = receipt.comment ?? ""
  const fullMention = /([A-Za-z]{2,4})\s*-\s*(\d{2})\s*-\s*(\d{1,6})/.exec(comment)
  if (fullMention && context.order_number) {
    const mentioned = `${fullMention[1].toUpperCase()}-${fullMention[2]}-${fullMention[3].padStart(4, "0")}`
    if (mentioned !== context.order_number) {
      add("comment_other_order", "warning", mentioned)
    }
  } else if (!fullMention && !context.order_number) {
    const mentioned = /(?:заказ|№|n)\s*№?\s*(\d{1,7})/i.exec(comment)?.[1]
    if (mentioned && context.order_display_id && Number(mentioned) !== context.order_display_id) {
      add("comment_other_order", "warning", `№${mentioned}`)
    }
  }

  if (receipt.tamper_signs.length) {
    add("tamper_signs", "warning", receipt.tamper_signs.join("; "))
  }

  return checks
}

export const receiptVerdict = (checks: ReceiptCheck[]): ReceiptVerdict =>
  checks.some((check) => check.level === "fail")
    ? "fail"
    : checks.length
    ? "warning"
    : "ok"

// Подписи замечаний — одни для покупателя, продавца и чата.
export const RECEIPT_CHECK_TEXT: Record<ReceiptCheckCode, string> = {
  not_receipt: "Это не чек об оплате",
  unreadable: "Чек не удалось прочитать — продавец проверит вручную",
  not_kaspi: "Чек не из Kaspi",
  not_success: "В чеке операция не выполнена",
  status_unknown: "В чеке не видно, что операция успешна",
  amount_missing: "В чеке не видно суммы",
  amount_over: "Сумма в чеке больше, чем нужно оплатить",
  amount_partial: "Сумма в чеке меньше, чем нужно оплатить — засчитается частью",
  recipient_phone_mismatch: "Перевод ушёл на другой номер, не продавцу",
  recipient_name_mismatch: "Имя получателя в чеке не совпадает с продавцом",
  recipient_bin_mismatch: "Оплата ушла другому продавцу — ИИН/БИН в чеке не совпадает",
  recipient_unknown: "В чеке не видно получателя",
  recipient_unverified: "Получателя не с чем сверить — укажите в способах оплаты, на чьё имя переводить",
  date_missing: "В чеке не видно даты",
  date_before_order: "Чек оплачен раньше, чем оформлен заказ",
  date_in_future: "Дата в чеке позже текущего времени",
  number_missing: "В чеке не видно номера квитанции",
  number_reused: "Этот номер квитанции уже присылали к другому заказу",
  file_reused: "Этот файл чека уже присылали",
  comment_other_order: "В комментарии к переводу указан другой заказ",
  tamper_signs: "Есть признаки правки изображения",
}
