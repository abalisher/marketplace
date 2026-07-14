import { toast, usePrompt } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"

type ModerationActionResponse = {
  product: { id: string; status: string }
}

// Мутации модерации карточек товара (submit/approve/reject) — общие для
// очереди модерации и widget'а на странице товара.
export const useProductModeration = () => {
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
      toast.success("Product submitted for moderation")
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
      toast.success("Product card approved")
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
      toast.success("Product card rejected")
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const approveWithConfirm = async (product: { id: string; title: string }) => {
    const confirmed = await confirmDialog({
      title: "Approve product card?",
      description: `The product "${product.title}" will be published and become visible to buyers.`,
      confirmText: "Approve",
      cancelText: "Cancel",
      variant: "confirmation",
    })
    if (confirmed) {
      approveMutation.mutate(product.id)
    }
  }

  return { submitMutation, approveMutation, rejectMutation, approveWithConfirm }
}
