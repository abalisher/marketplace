import { sanitizeRecognizedReceipt } from "../receipt-ai"
import {
  checkReceipt,
  phoneMatches,
  receiptPaidAt,
  receiptVerdict,
  recipientNameMatches,
} from "../receipt-checks"

const receipt = (patch: Record<string, unknown> = {}) =>
  sanitizeRecognizedReceipt({
    is_receipt: true,
    bank: "Kaspi.kz",
    success: true,
    amount: 3200,
    paid_at: "2026-10-30T14:05",
    receipt_number: "QR 1234 5678",
    recipient_name: "Нурбол Н.",
    recipient_phone: "+7 707 *** ** 26",
    sender_name: "Айгуль С.",
    comment: "Заказ №3",
    tamper_signs: [],
    ...patch,
  })

const context = (patch: Record<string, unknown> = {}) => ({
  outstanding: 3200,
  order_display_id: 3,
  order_created_at: new Date("2026-10-30T13:50:00+05:00"),
  seller_phone: "+77077126426",
  seller_recipient: "Нурбол Н",
  seller_bin: "790421300458",
  number_reused_by: undefined,
  file_reused_by: undefined,
  now: new Date("2026-10-30T15:00:00+05:00"),
  ...patch,
})

describe("проверка чека Kaspi", () => {
  it("правильный чек — без замечаний", () => {
    const checks = checkReceipt(receipt({ recipient_phone: "+7 707 *** 64 26" }), context())
    expect(checks).toEqual([])
    expect(receiptVerdict(checks)).toBe("ok")
  })

  it("чужой номер получателя, чек раньше заказа, повтор номера — нарушения", () => {
    const codes = (r: ReturnType<typeof receipt>, c = context()) =>
      checkReceipt(r, c).map((check) => `${check.code}:${check.level}`)
    expect(codes(receipt({ recipient_phone: "+7 701 *** 11 99" }))).toContain(
      "recipient_phone_mismatch:fail"
    )
    expect(codes(receipt({ paid_at: "2026-10-29T10:00" }))).toContain("date_before_order:fail")
    expect(codes(receipt(), context({ number_reused_by: 1 }))).toContain("number_reused:fail")
    expect(codes(receipt(), context({ file_reused_by: null }))).toContain("file_reused:fail")
    expect(codes(receipt({ success: false }))).toContain("not_success:fail")
    expect(codes(receipt({ is_receipt: false }))).toEqual(["not_receipt:fail"])
    expect(codes(receipt({ paid_at: "2026-10-31T10:00" }))).toContain("date_in_future:fail")
  })

  it("мягкие замечания: часть суммы, другое имя, признаки правки, другой заказ в комментарии", () => {
    const checks = checkReceipt(
      receipt({
        amount: "1 000 ₸",
        recipient_name: "Ерлан К.",
        tamper_signs: ["разные шрифты в сумме"],
        comment: "оплата заказ 7",
      }),
      context()
    )
    expect(checks.map((c) => c.code)).toEqual([
      "amount_partial",
      "recipient_name_mismatch",
      "comment_other_order",
      "tamper_signs",
    ])
    expect(receiptVerdict(checks)).toBe("warning")
  })

  it("чек только с датой сверяется сутками; нечитаемый — на ручную проверку", () => {
    expect(receiptPaidAt("2026-10-30")?.dateOnly).toBe(true)
    expect(checkReceipt(receipt({ paid_at: "2026-10-30" }), context())).toEqual([])
    expect(receiptVerdict(checkReceipt(null, context()))).toBe("warning")
  })
})

describe("номер получателя в чеке", () => {
  it("сверяет только видимые цифры скрытого номера", () => {
    expect(phoneMatches("+77077126426", "+7 707 *** ** 26")).toBe(true)
    expect(phoneMatches("+77077126426", "8 707 *** 64 26")).toBe(true)
    expect(phoneMatches("+77077126426", "+7 701 *** ** 26")).toBe(false)
    expect(phoneMatches("+77077126426", "+7 707 *** ** 99")).toBe(false)
    expect(phoneMatches("+77077126426", "87077126426")).toBe(true)
    expect(phoneMatches(null, "+7 701 *** ** 26")).toBe(true)
  })
})

// Поля — как Kaspi печатает настоящие квитанции (образцы от владельца,
// 2026-10-30): перевод клиенту Kaspi без номера получателя, оплата магазину по
// Kaspi QR с ИИН/БИН продавца, оплата услуги.
describe("настоящие форматы квитанций Kaspi", () => {
  const codes = (patch: Record<string, unknown>, c = context()) =>
    checkReceipt(receipt(patch), c).map((check) => `${check.code}:${check.level}`)

  const transfer = {
    amount: 1600,
    paid_at: "2026-10-30T14:54",
    receipt_number: "903703435701962113",
    recipient_name: "Нұржігіт Е.",
    recipient_phone: null,
    sender_name: "Нұрлыбай Н.Б.",
    comment: null,
  }

  it("перевод: номера получателя нет, имя с казахскими буквами совпадает", () => {
    expect(
      codes(transfer, context({ outstanding: 1600, seller_recipient: "Нуржигит Е." }))
    ).toEqual([])
  })

  it("перевод другому человеку без номера в чеке — нарушение, а не замечание", () => {
    expect(codes(transfer, context({ outstanding: 1600 }))).toContain(
      "recipient_name_mismatch:fail"
    )
  })

  it("перевод, а продавец не указал, на чьё имя переводить, — сверять не с чем", () => {
    expect(
      codes(transfer, context({ outstanding: 1600, seller_recipient: null }))
    ).toEqual(["recipient_unverified:warning"])
  })

  const qr = {
    amount: 1464,
    paid_at: "2026-10-30T14:26",
    receipt_number: "QR18290561703",
    recipient_name: 'SMALL / ТОО "Скиф трейд"',
    recipient_phone: null,
    recipient_bin: "0203 4000 2288",
    sender_name: "Нұрбол Н.",
    comment: null,
  }

  it("оплата по Kaspi QR чужому магазину — ИИН/БИН не совпал", () => {
    expect(codes(qr, context({ outstanding: 1464 }))).toEqual([
      "recipient_bin_mismatch:fail",
    ])
  })

  it("оплата по Kaspi QR самому продавцу — БИН совпал, название магазина не мешает", () => {
    expect(
      codes(
        { ...qr, recipient_name: "ORGSTROY / ИП ORGSTROY", recipient_bin: "790421300458" },
        context({ outstanding: 1464 })
      )
    ).toEqual([])
  })

  it("оплата услуги (НЦТ) вместо перевода продавцу — получатель чужой", () => {
    expect(
      codes(
        {
          amount: 14693,
          paid_at: "2026-06-02T23:03",
          receipt_number: "QR15808961873",
          recipient_name: "Национальный Центр Тестирования",
          recipient_phone: null,
          comment: null,
        },
        context({ outstanding: 14693 })
      )
    ).toEqual(expect.arrayContaining(["recipient_name_mismatch:fail", "date_before_order:fail"]))
  })
})

describe("имя получателя", () => {
  it("казахские буквы равны русским, фамилия — по первой букве", () => {
    expect(recipientNameMatches("Нуржигит Ермеков", "Нұржігіт Е.")).toBe(true)
    expect(recipientNameMatches("Нуржигит А.", "Нұржігіт Е.")).toBe(false)
    expect(recipientNameMatches("Айгуль", "Әйгүл С.")).toBe(false)
    expect(recipientNameMatches("Әйгүл", "Айгул С.")).toBe(true)
    expect(recipientNameMatches(null, "Нұржігіт Е.")).toBe(true)
  })

  it("ИИН/БИН из чека — только 12 цифр", () => {
    expect(receipt({ recipient_bin: "0203 4000 2288" }).recipient_bin).toBe("020340002288")
    expect(receipt({ recipient_bin: "12345" }).recipient_bin).toBeNull()
  })
})

describe("номер заказа в комментарии к переводу", () => {
  const codes = (comment: string, patch: Record<string, unknown> = {}) =>
    checkReceipt(
      receipt({ comment, recipient_phone: "+7 707 *** 64 26" }),
      context(patch)
    ).map((check) => check.code)

  it("номер нового вида: свой — без замечаний, чужой — замечание", () => {
    expect(codes("Заказ ORG-26-0003", { order_number: "ORG-26-0003" })).toEqual([])
    expect(codes("заказ org-26-3", { order_number: "ORG-26-0003" })).toEqual([])
    expect(codes("Заказ ORG-26-0004", { order_number: "ORG-26-0003" })).toContain(
      "comment_other_order"
    )
  })
})
