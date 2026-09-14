import { listMyDocuments } from "@lib/data/documents"
import { getServerMessages } from "@lib/i18n/server"
import CabinetEmpty from "@modules/cabinet/components/cabinet-empty"
import DocumentRow from "@modules/cabinet/components/document-row"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Documents",
  description: "Invoices, waybills and acts for all of your orders.",
}

// Документы всех заказов одним списком (T10.6): счёт, накладная, акт. Раздел
// существует ровно затем, чтобы накладную можно было найти, не вспоминая, в
// каком заказе она была.
export default async function CabinetDocumentsPage() {
  const [documents, m] = await Promise.all([
    listMyDocuments(),
    getServerMessages(),
  ])

  return (
    <section className="flex flex-col gap-4" data-testid="cabinet-documents">
      <div className="flex flex-col gap-1">
        <h1 className="text-heading-large text-ink">
          {m.cabinet.documents.title}
        </h1>
        <p className="text-body-large text-ink-secondary">
          {m.cabinet.documents.subtitle}
        </p>
      </div>

      {documents.length === 0 ? (
        <CabinetEmpty
          title={m.cabinet.documents.empty}
          hint={m.cabinet.documents.emptyHint}
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {documents.map((document) => (
            <DocumentRow key={document.id} document={document} />
          ))}
        </ul>
      )}
    </section>
  )
}
