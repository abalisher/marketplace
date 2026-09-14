import { toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { AdminOrderDocument, DocumentType } from "../lib/documents"
import { sdk } from "../lib/sdk"

type DocumentResponse = { document: AdminOrderDocument }

// Мутации документов заказа (T4.9): ручной выпуск с экрана заказа и отметка
// «отправлен покупателю». Общие для widget'а заказа и реестра документов.
export const useDocuments = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["order-documents"] })
    queryClient.invalidateQueries({ queryKey: ["documents-registry"] })
  }

  const issueMutation = useMutation({
    mutationFn: ({
      orderId,
      type,
    }: {
      orderId: string
      type: DocumentType
    }) =>
      sdk.client.fetch<DocumentResponse>(`/admin/orders/${orderId}/documents`, {
        method: "POST",
        body: { type },
      }),
    onSuccess: async (response) => {
      toast.success(
        t("documents.toast.issued", { number: response.document.number })
      )
      await queryClient.invalidateQueries({ queryKey: ["order-documents"] })
      queryClient.invalidateQueries({ queryKey: ["documents-registry"] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const markSentMutation = useMutation({
    mutationFn: (documentId: string) =>
      sdk.client.fetch<DocumentResponse>(
        `/admin/documents/${documentId}/mark-sent`,
        { method: "POST" }
      ),
    onSuccess: () => {
      toast.success(t("documents.toast.markedSent"))
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return { issueMutation, markSentMutation }
}
