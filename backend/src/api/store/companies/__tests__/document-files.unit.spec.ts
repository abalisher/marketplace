import {
  MAX_COMPANY_DOCUMENT_BYTES,
  decodedByteLength,
  parseCompanyDocuments,
  sanitizeDocumentFilename,
} from "../document-files"

describe("правила приёма учредительных документов", () => {
  describe("decodedByteLength", () => {
    it("считает размер файла до кодирования, учитывая хвостовые «=»", () => {
      // "abc" → "YWJj" (без padding), "ab" → "YWI=" , "a" → "YQ=="
      expect(decodedByteLength(Buffer.from("abc").toString("base64"))).toBe(3)
      expect(decodedByteLength(Buffer.from("ab").toString("base64"))).toBe(2)
      expect(decodedByteLength(Buffer.from("a").toString("base64"))).toBe(1)
    })

    it("пустая строка — нулевой размер", () => {
      expect(decodedByteLength("")).toBe(0)
      expect(decodedByteLength("   ")).toBe(0)
    })

    it("файл на пределе проходит, файл сверх предела — нет", () => {
      const atLimit = Buffer.alloc(MAX_COMPANY_DOCUMENT_BYTES).toString(
        "base64"
      )
      const overLimit = Buffer.alloc(MAX_COMPANY_DOCUMENT_BYTES + 1).toString(
        "base64"
      )

      expect(decodedByteLength(atLimit)).toBeLessThanOrEqual(
        MAX_COMPANY_DOCUMENT_BYTES
      )
      expect(decodedByteLength(overLimit)).toBeGreaterThan(
        MAX_COMPANY_DOCUMENT_BYTES
      )
    })
  })

  describe("sanitizeDocumentFilename", () => {
    it("ставит расширение по типу файла", () => {
      expect(sanitizeDocumentFilename("Устав", "application/pdf")).toBe(
        "Устав.pdf"
      )
      expect(sanitizeDocumentFilename("печать", "image/png")).toBe("печать.png")
      expect(sanitizeDocumentFilename("скан", "image/jpeg")).toBe("скан.jpg")
    })

    it("срезает путь и заменяет прежнее расширение", () => {
      expect(
        sanitizeDocumentFilename("C:\\docs\\ustav.PDF", "application/pdf")
      ).toBe("ustav.pdf")
      expect(
        sanitizeDocumentFilename("../../etc/passwd", "application/pdf")
      ).toBe("passwd.pdf")
    })

    it("вычищает служебные символы и не оставляет пустое имя", () => {
      expect(
        sanitizeDocumentFilename('спр"авка?*.pdf', "application/pdf")
      ).toBe("спр-авка.pdf")
      expect(sanitizeDocumentFilename("///", "application/pdf")).toBe(
        "document.pdf"
      )
      expect(sanitizeDocumentFilename("...", "application/pdf")).toBe(
        "document.pdf"
      )
    })

    it("длинное имя обрезается", () => {
      const name = sanitizeDocumentFilename("и".repeat(200), "application/pdf")
      expect(name).toBe(`${"и".repeat(80)}.pdf`)
    })
  })

  describe("parseCompanyDocuments", () => {
    it("читает список уже приложенных документов", () => {
      const documents = [
        { name: "Устав.pdf", url: "/static/ustav.pdf" },
        { name: "Приказ.pdf", url: "/static/prikaz.pdf" },
      ]

      expect(parseCompanyDocuments(documents)).toEqual(documents)
    })

    it("пустая заявка — пустой список (колонка не заполнена)", () => {
      expect(parseCompanyDocuments(null)).toEqual([])
      expect(parseCompanyDocuments(undefined)).toEqual([])
      // Колонка jsonb типизирована как объект — не массив считаем «пусто».
      expect(parseCompanyDocuments({ name: "Устав" })).toEqual([])
    })

    it("битые записи отбрасываются: ссылка без имени модератору бесполезна", () => {
      expect(
        parseCompanyDocuments([
          { name: "Устав.pdf", url: "/static/ustav.pdf" },
          { url: "/static/orphan.pdf" },
          { name: "Без ссылки" },
          null,
          "строка",
        ])
      ).toEqual([{ name: "Устав.pdf", url: "/static/ustav.pdf" }])
    })
  })
})
