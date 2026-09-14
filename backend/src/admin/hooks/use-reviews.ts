import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import {
  AdminDisputeResponse,
  AdminReviewResponse,
  DisputeCategory,
  DisputeOutcome,
  DisputeStatus,
  ReviewStatus,
} from "../lib/reviews"
import { sdk } from "../lib/sdk"

// Мутации админ-UI отзывов и претензий: модерация видимости отзыва, перевод
// претензии по стейт-машине (с последствием решения) и регистрация претензии
// оператором по звонку. Инвалидируют связанные списки/виджеты.
export const useReviews = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["order-reviews"] })
    queryClient.invalidateQueries({ queryKey: ["order-disputes"] })
    queryClient.invalidateQueries({ queryKey: ["dispute-queue"] })
    queryClient.invalidateQueries({ queryKey: ["dispute-card"] })
    queryClient.invalidateQueries({ queryKey: ["review-list"] })
    queryClient.invalidateQueries({ queryKey: ["review-summary"] })
    // Карточка заказа показывает активную претензию — после решения она
    // исчезает из шапки заказа (T4.11).
    queryClient.invalidateQueries({ queryKey: ["order-lifecycle"] })
    queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] })
  }

  const moderateReview = useMutation({
    mutationFn: (input: { id: string; status: ReviewStatus }) =>
      sdk.client.fetch<AdminReviewResponse>(
        `/admin/reviews/${input.id}/moderate`,
        { method: "POST", body: { status: input.status } }
      ),
    onSuccess: () => {
      toast.success(t("reviews.toast.reviewUpdated"))
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const transitionDispute = useMutation({
    mutationFn: (input: {
      id: string
      to: DisputeStatus
      resolution?: string
      // Последствие решения обязательно при удовлетворении — проверяет бэкенд.
      outcome?: DisputeOutcome
    }) =>
      sdk.client.fetch<AdminDisputeResponse>(
        `/admin/disputes/${input.id}/transition`,
        {
          method: "POST",
          body: {
            to: input.to,
            ...(input.resolution ? { resolution: input.resolution } : {}),
            ...(input.outcome ? { outcome: input.outcome } : {}),
          },
        }
      ),
    onSuccess: () => {
      toast.success(t("reviews.toast.disputeUpdated"))
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // Претензия по звонку: заказ оператор выбирает поиском, покупателя вычисляет
  // бэкенд из самого заказа.
  const registerDispute = useMutation({
    mutationFn: (input: {
      order_id: string
      category: DisputeCategory
      description: string
    }) =>
      sdk.client.fetch<AdminDisputeResponse>("/admin/disputes", {
        method: "POST",
        body: input,
      }),
    onSuccess: () => {
      toast.success(t("reviews.toast.disputeRegistered"))
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  return { moderateReview, transitionDispute, registerDispute }
}
