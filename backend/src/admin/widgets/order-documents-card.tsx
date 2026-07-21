import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { ArrowDownTray, DocumentText } from "@medusajs/icons"
import { Button, Container, Heading, StatusBadge, Text, toast } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import {
  AdminOrderDocument,
  AdminOrderDocumentsResponse,
  DOCUMENT_TYPE_META,
} from "../lib/documents"
import { sdk } from "../lib/sdk"

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—"

// Widget документов заказа на ядровой странице заказа: список всех документов-
// оснований (счёт/накладная/АВР, все версии) со скачиванием PDF по file_url и
// кнопкой экспорта исходных данных для 1С. Данные — GET /admin/orders/:id/documents.
const OrderDocumentsCardWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const { data: response, isLoading } = useQuery({
    queryKey: ["order-documents", data.id],
    queryFn: () =>
      sdk.client.fetch<AdminOrderDocumentsResponse>(
        `/admin/orders/${data.id}/documents`
      ),
  })

  const documents = response?.documents ?? []

  // Экспорт для 1С: тянем JSON через admin-API (нужен auth) и отдаём файлом.
  const exportForAccounting = async () => {
    try {
      const payload = await sdk.client.fetch<unknown>(
        `/admin/orders/${data.id}/documents/export`
      )
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `order-${data.display_id ?? data.id}-1c-export.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Documents</Heading>
        <Button
          size="small"
          variant="secondary"
          onClick={exportForAccounting}
          disabled={isLoading || documents.length === 0}
        >
          <ArrowDownTray className="text-ui-fg-subtle" />
          Export for 1C
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {isLoading ? "Loading…" : "No documents issued for this order yet."}
          </Text>
        </div>
      ) : (
        <ul className="flex flex-col">
          {documents.map((doc: AdminOrderDocument) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-x-4 px-6 py-3"
            >
              <div className="flex items-center gap-x-3">
                <DocumentText className="text-ui-fg-subtle" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-x-2">
                    <Text size="small" weight="plus">
                      {DOCUMENT_TYPE_META[doc.type]?.label ?? doc.type} ·{" "}
                      {doc.number}
                    </Text>
                    {doc.is_latest ? (
                      <StatusBadge color="green">Latest</StatusBadge>
                    ) : (
                      <StatusBadge color="grey">v{doc.version}</StatusBadge>
                    )}
                  </div>
                  <Text size="small" className="text-ui-fg-subtle">
                    {formatDate(doc.created_at)}
                  </Text>
                </div>
              </div>
              {doc.file_url ? (
                <a href={doc.file_url} target="_blank" rel="noreferrer">
                  <Button size="small" variant="transparent">
                    <ArrowDownTray className="text-ui-fg-subtle" />
                    PDF
                  </Button>
                </a>
              ) : (
                <Text size="small" className="text-ui-fg-muted">
                  rendering…
                </Text>
              )}
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderDocumentsCardWidget
