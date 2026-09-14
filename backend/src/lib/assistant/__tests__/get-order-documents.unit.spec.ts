import { MedusaContainer } from "@medusajs/framework/types"
import { getOrderDocumentsTool } from "../tools/get-order-documents"
import { AssistantAttachment, OrderDocumentsAttachment } from "../types"

// Unit: инструмент «документы по заказу» (T2.10). Проверяем guard без заказа,
// честный ответ при отсутствии документов и вставку со ссылками на PDF.
// Контейнер подменён заглушкой: сервис модуля и query.graph — не наша логика.

const trapContainer = new Proxy(
  {},
  {
    get() {
      throw new Error("container must not be used without an order")
    },
  }
) as unknown as MedusaContainer

const containerWith = (documents: unknown[], displayId: number | null) =>
  ({
    resolve: (key: string) => {
      if (key === "query") {
        return {
          graph: async () => ({ data: [{ id: "order_1", display_id: displayId }] }),
        }
      }
      return { listDocuments: async () => documents }
    },
  }) as unknown as MedusaContainer

describe("assistant get_order_documents", () => {
  it("без оформленного заказа отвечает ошибкой и не трогает контейнер", async () => {
    const out = await getOrderDocumentsTool.execute(trapContainer, {}, {})
    expect(typeof out.error).toEqual("string")
  })

  it("документов ещё нет — честный ответ без вставки и без обещаний почты", async () => {
    const attachments: AssistantAttachment[] = []
    const out = await getOrderDocumentsTool.execute(
      containerWith([], 42),
      {},
      { lastOrderId: "order_1", attachments }
    )

    expect(out.documents).toEqual([])
    expect(attachments).toHaveLength(0)
    expect(String(out.note)).toContain("не обещай отправку файлов")
  })

  it("отдаёт документы со ссылками и кладёт вставку с номером заказа", async () => {
    const attachments: AssistantAttachment[] = []
    const out = await getOrderDocumentsTool.execute(
      containerWith(
        [
          {
            type: "invoice",
            number: "INV-2026-000001",
            file_url: "http://localhost:9000/static/invoice.pdf",
          },
        ],
        24
      ),
      {},
      { lastOrderId: "order_1", attachments }
    )

    expect(out.documents).toEqual([
      {
        doc_type: "invoice",
        title: "Счёт на оплату",
        number: "INV-2026-000001",
        url: "http://localhost:9000/static/invoice.pdf",
      },
    ])
    // Накладной ещё нет — модель должна знать, чтобы не выдавать желаемое за факт.
    expect(out.not_issued_yet).toEqual([
      "накладная выпускается, когда заказ передают в доставку",
    ])

    const attachment = attachments[0] as OrderDocumentsAttachment
    expect(attachment.type).toEqual("documents")
    expect(attachment.display_id).toEqual(24)
    expect(attachment.documents).toHaveLength(1)
  })
})
