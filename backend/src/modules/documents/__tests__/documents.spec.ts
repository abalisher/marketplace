import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { DOCUMENTS_MODULE } from ".."
import DocumentsModuleService from "../service"
import Document from "../models/document"
import DocumentSetting from "../models/document-setting"
import DocumentSequence from "../models/document-sequence"

jest.setTimeout(120000)

// Интеграционный тест модуля: singleton реквизитов, нумерация по типу/году и
// выпуск с версионностью из docs/modules/documents.md. Раннер поднимает модуль
// на временной БД (.env.test).
moduleIntegrationTestRunner<DocumentsModuleService>({
  moduleName: DOCUMENTS_MODULE,
  moduleModels: [Document, DocumentSetting, DocumentSequence],
  resolve: "./src/modules/documents",
  testSuite: ({ service }) => {
    describe("DocumentsModuleService", () => {
      it("creates the settings singleton with defaults and reuses it", async () => {
        const settings = await service.getOrCreateSettings()

        expect(settings.id).toMatch(/^docset_/)
        expect(settings.seller_name).toEqual("Marketplace")

        // Повторный вызов возвращает ту же строку, а не плодит новые.
        const again = await service.getOrCreateSettings()
        expect(again.id).toEqual(settings.id)
        const [, count] = await service.listAndCountDocumentSettings()
        expect(count).toEqual(1)
      })

      it("issues sequential numbers per type within a year", async () => {
        // Изолированный год (2020) — не пересекается с issueDocument-тестами,
        // которые нумеруют текущим годом.
        const now = new Date("2020-03-01T00:00:00Z")
        const a = await service.nextDocumentNumber("invoice", now)
        const b = await service.nextDocumentNumber("invoice", now)
        const c = await service.nextDocumentNumber("waybill", now)

        expect(a).toEqual("INV-2020-000001")
        expect(b).toEqual("INV-2020-000002")
        // Отдельная последовательность на каждый тип.
        expect(c).toEqual("WB-2020-000001")
      })

      it("rejects an unknown document type when numbering", async () => {
        await expect(
          // @ts-expect-error — проверяем защиту от неизвестного типа в рантайме.
          service.nextDocumentNumber("receipt")
        ).rejects.toThrow(/Unknown document type/)
      })

      it("issues a first document version with a fresh number and full visibility", async () => {
        const doc = await service.issueDocument({
          order_id: "order_1",
          type: "invoice",
          snapshot: { total: 6000 },
          total_money: 6000,
          total_bonus: 0,
        })

        expect(doc.id).toMatch(/^doc_/)
        expect(doc.version).toEqual(1)
        expect(doc.is_latest).toEqual(true)
        expect(doc.number).toMatch(/^INV-\d{4}-\d{6}$/)
        expect(doc.file_id).toBeNull()
        expect(doc.visible_to_buyer).toEqual(true)
        expect(doc.visible_to_seller).toEqual(true)
        expect(Number(doc.total_money)).toEqual(6000)
      })

      it("re-issuing supersedes the previous version and keeps the number", async () => {
        const first = await service.issueDocument({
          order_id: "order_2",
          type: "invoice",
          snapshot: { total: 1000 },
        })
        const second = await service.issueDocument({
          order_id: "order_2",
          type: "invoice",
          snapshot: { total: 2000 },
        })

        expect(second.version).toEqual(2)
        expect(second.is_latest).toEqual(true)
        // Переиздание — новая версия ТОГО ЖЕ документа: номер сохраняется.
        expect(second.number).toEqual(first.number)

        const reloadedFirst = await service.retrieveDocument(first.id)
        expect(reloadedFirst.is_latest).toEqual(false)

        // Разные типы по одному заказу независимы — свой номер и своя версия.
        const waybill = await service.issueDocument({
          order_id: "order_2",
          type: "waybill",
          snapshot: {},
        })
        expect(waybill.version).toEqual(1)
        expect(waybill.number).not.toEqual(first.number)
      })

      it("attaches a rendered file to a document", async () => {
        const doc = await service.issueDocument({
          order_id: "order_3",
          type: "waybill",
          snapshot: {},
        })

        const updated = await service.attachRenderedFile({
          document_id: doc.id,
          file_id: "file_123",
          file_url: "http://localhost:9000/static/file_123.pdf",
        })

        expect(updated.file_id).toEqual("file_123")
        expect(updated.file_url).toContain("file_123")
      })
    })
  },
})
