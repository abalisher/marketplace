import { toast, usePrompt } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { sdk } from "../lib/sdk"

type ModerationActionResponse = {
  product: { id: string; status: string }
}

// Мутации модерации карточек товара (submit/approve/reject) — общие для
// очереди модерации и widget'а на странице товара.
export const useProductModeration = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const confirmDialog = usePrompt()

  // Инвалидируются и наши запросы (очередь, widget), и запросы ядровой
  // страницы товара — у ядра корень queryKey тоже "products".
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["catalog-moderation"] })
    queryClient.invalidateQueries({ queryKey: ["products"] })
  }

  const submitMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch<ModerationActionResponse>(
        `/admin/products/${id}/moderation/submit`,
        { method: "POST" }
      ),
    onSuccess: () => {
      toast.success(t("productModeration.toast.submitted"))
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch<ModerationActionResponse>(
        `/admin/products/${id}/moderation/approve`,
        { method: "POST" }
      ),
    onSuccess: () => {
      toast.success(t("productModeration.toast.approved"))
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      sdk.client.fetch<ModerationActionResponse>(
        `/admin/products/${id}/moderation/reject`,
        { method: "POST", body: { reason } }
      ),
    onSuccess: () => {
      toast.success(t("productModeration.toast.rejected"))
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const approveWithConfirm = async (product: { id: string; title: string }) => {
    const confirmed = await confirmDialog({
      title: t("productModeration.approve.title"),
      description: t("productModeration.approve.description", {
        title: product.title,
      }),
      confirmText: t("productModeration.action.approve"),
      cancelText: t("common.cancel"),
      variant: "confirmation",
    })
    if (confirmed) {
      approveMutation.mutate(product.id)
    }
  }

  return { submitMutation, approveMutation, rejectMutation, approveWithConfirm }
}
