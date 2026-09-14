import {
  missingRequisites,
  missingRequisitesMessage,
  requisitesAreComplete,
} from "../requisites"

// Полнота реквизитов продавца (T4.9): без БИН, адреса и банка документ не
// выпускается — счёт с пустыми реквизитами бухгалтерия покупателя не примет
// (блокер 20 фокус-группы T4.6).
const complete = {
  seller_name: 'ТОО «СтройМаркет»',
  seller_bin: "180540021764",
  seller_address: "г. Астана, ул. Кабанбай батыра, 53",
  seller_bank_name: 'АО «Kaspi Bank»',
  seller_bank_bik: "CASPKZKA",
  seller_iban: "KZ12 3456 7890 1234 5678",
}

describe("documents requisites", () => {
  it("считает полные реквизиты пригодными для выпуска", () => {
    expect(missingRequisites(complete)).toEqual([])
    expect(requisitesAreComplete(complete)).toBe(true)
  })

  it("называет пустые и пробельные поля", () => {
    const missing = missingRequisites({
      ...complete,
      seller_bin: null,
      seller_iban: "   ",
    })

    expect(missing).toEqual(["seller_bin", "seller_iban"])
    expect(requisitesAreComplete({ ...complete, seller_bin: null })).toBe(false)
  })

  it("не принимает ядровую заглушку имени продавца", () => {
    // Дефолт модели «Marketplace» — не название магазина: с ним документ
    // выглядит как чужой (находка фокус-группы).
    expect(missingRequisites({ ...complete, seller_name: "Marketplace" })).toEqual(
      ["seller_name"]
    )
  })

  it("пустые настройки — всё обязательное отсутствует", () => {
    expect(missingRequisites(null)).toHaveLength(6)
  })

  it("сообщение перечисляет недостающее по-русски", () => {
    const message = missingRequisitesMessage(["seller_bin", "seller_iban"])

    expect(message).toContain("БИН/ИИН")
    expect(message).toContain("IBAN")
    expect(message).toContain("Реквизиты документов")
  })
})
