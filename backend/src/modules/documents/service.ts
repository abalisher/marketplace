import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import Document from "./models/document"
import DocumentSetting from "./models/document-setting"
import DocumentSequence from "./models/document-sequence"
import {
  DOCUMENT_NUMBER_PREFIXES,
  DOCUMENT_TYPES,
  DocumentType,
} from "./models/constants"

// Сервис домена документов. CRUD генерируется MedusaService; здесь — нумерация
// (последовательность на тип/год) и выпуск с версионностью (см.
// docs/modules/documents.md). Рендер PDF (pdfkit) и связывание с File Module —
// в workflow-шаге (подзадача 2), поэтому issueDocument оставляет file_id пустым,
// а attachRenderedFile прикрепляет файл после рендера.
class DocumentsModuleService extends MedusaService({
  Document,
  DocumentSetting,
  DocumentSequence,
}) {
  // Реквизиты продавца — singleton: первая строка либо создание с дефолтами.
  async getOrCreateSettings() {
    const [existing] = await this.listDocumentSettings({}, { take: 1 })
    if (existing) {
      return existing
    }
    return await this.createDocumentSettings({})
  }

  // Следующий человекочитаемый номер для типа в пределах года. Счётчик — строка
  // document_sequence по ключу "<type>:<year>"; read-modify-write без блокировки
  // (MVP: документы формируются в workflow заказа, конкуренция низкая — как скан
  // начисления bonus). Номер присваивается ПЕРВОЙ версии документа; переиздание
  // сохраняет номер (см. issueDocument).
  async nextDocumentNumber(type: DocumentType, now: Date = new Date()) {
    if (!(DOCUMENT_TYPES as readonly string[]).includes(type)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown document type: ${type}`
      )
    }
    const year = now.getFullYear()
    const key = `${type}:${year}`
    const [seq] = await this.listDocumentSequences({ key }, { take: 1 })
    const next = (seq ? seq.value : 0) + 1
    if (seq) {
      await this.updateDocumentSequences({ id: seq.id, value: next })
    } else {
      await this.createDocumentSequences({ key, value: next })
    }
    const padded = String(next).padStart(6, "0")
    return `${DOCUMENT_NUMBER_PREFIXES[type]}-${year}-${padded}`
  }

  // Выпуск документа с версионностью: если по (order_id, type) уже есть текущая
  // версия — снимаем с неё is_latest, новая получает version+1 и ТОТ ЖЕ номер
  // (переиздание — новая версия того же документа). Первая версия получает свежий
  // номер из последовательности. Файл (PDF) прикрепляется позже, после рендера
  // (attachRenderedFile) — здесь file_id ещё null.
  async issueDocument(input: {
    order_id: string
    type: DocumentType
    snapshot: Record<string, unknown>
    total_money?: number
    total_bonus?: number
    currency_code?: string
    visible_to_buyer?: boolean
    visible_to_seller?: boolean
    note?: string | null
    now?: Date
  }) {
    const [previous] = await this.listDocuments(
      { order_id: input.order_id, type: input.type, is_latest: true },
      { take: 1 }
    )

    let version = 1
    let number: string
    if (previous) {
      version = previous.version + 1
      number = previous.number
      await this.updateDocuments({ id: previous.id, is_latest: false })
    } else {
      number = await this.nextDocumentNumber(input.type, input.now)
    }

    return await this.createDocuments({
      order_id: input.order_id,
      type: input.type,
      number,
      version,
      is_latest: true,
      snapshot: input.snapshot,
      total_money: input.total_money ?? 0,
      total_bonus: input.total_bonus ?? 0,
      currency_code: input.currency_code ?? "kzt",
      visible_to_buyer: input.visible_to_buyer ?? true,
      visible_to_seller: input.visible_to_seller ?? true,
      note: input.note ?? null,
    })
  }

  // Отметить документ отправленным покупателю. Канала отправки пока нет
  // (развилка №0), отметку ставит продавец руками с экрана заказа — управляющему
  // нужно видеть, ушёл ли счёт клиенту (T4.9). Повторная отметка обновляет
  // момент: документ могли выслать заново после переиздания.
  async markDocumentSent(document_id: string, now: Date = new Date()) {
    return await this.updateDocuments({
      id: document_id,
      sent_to_buyer_at: now,
    })
  }

  // Прикрепить отрендеренный PDF к строке документа (после шага рендера в
  // workflow, подзадача 2).
  async attachRenderedFile(input: {
    document_id: string
    file_id: string
    file_url?: string | null
  }) {
    return await this.updateDocuments({
      id: input.document_id,
      file_id: input.file_id,
      file_url: input.file_url ?? null,
    })
  }
}

export default DocumentsModuleService
