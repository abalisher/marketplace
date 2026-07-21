import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@medusajs/ui"
import {
  AdminDisputeResponse,
  AdminReviewResponse,
  DisputeStatus,
  ReviewStatus,
} from "../lib/reviews"
import { sdk } from "../lib/sdk"

// Мутации админ-UI отзывов/диспутов: модерация видимости отзыва и перевод
// диспута по стейт-машине. Инвалидируют связанные списки/виджеты.
export const useReviews = () => {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["order-reviews"] })
    queryClient.invalidateQueries({ queryKey: ["order-disputes"] })
    queryClient.invalidateQueries({ queryKey: ["dispute-queue"] })
    queryClient.invalidateQueries({ queryKey: ["review-summary"] })
  }

  const moderateReview = useMutation({
    mutationFn: (input: { id: string; status: ReviewStatus }) =>
      sdk.client.fetch<AdminReviewResponse>(
        `/admin/reviews/${input.id}/moderate`,
        { method: "POST", body: { status: input.status } }
      ),
    onSuccess: () => {
      toast.success("Review visibility updated")
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const transitionDispute = useMutation({
    mutationFn: (input: {
      id: string
      to: DisputeStatus
      resolution?: string
    }) =>
      sdk.client.fetch<AdminDisputeResponse>(
        `/admin/disputes/${input.id}/transition`,
        {
          method: "POST",
          body: {
            to: input.to,
            ...(input.resolution ? { resolution: input.resolution } : {}),
          },
        }
      ),
    onSuccess: () => {
      toast.success("Dispute updated")
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return { moderateReview, transitionDispute }
}
