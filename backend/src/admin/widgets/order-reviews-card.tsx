import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types"
import { EllipsisHorizontal, EyeSlash, Eye, Star } from "@medusajs/icons"
import {
  Container,
  DropdownMenu,
  Heading,
  IconButton,
  StatusBadge,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import DisputeTransitionDrawer from "../components/dispute-transition-drawer"
import { useReviews } from "../hooks/use-reviews"
import {
  AdminDispute,
  AdminDisputesResponse,
  AdminReviewsResponse,
  AdminReviewSummariesResponse,
  DISPUTE_CATEGORY_META,
  DISPUTE_STATUS_META,
  REVIEW_TARGET_META,
} from "../lib/reviews"
import { sdk } from "../lib/sdk"

// Widget отзывов и диспутов заказа на ядровой странице заказа: отзывы (с
// модерацией hide/publish в «...»-меню), диспуты (клик → drawer ведения по
// стейт-машине) и глобальная сводка рейтинга. Данные — admin-роуты reviews.
const OrderReviewsCardWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const { moderateReview } = useReviews()
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(
    null
  )

  const { data: reviewsRes } = useQuery({
    queryKey: ["order-reviews", data.id],
    queryFn: () =>
      sdk.client.fetch<AdminReviewsResponse>(
        `/admin/orders/${data.id}/reviews`
      ),
  })
  const { data: disputesRes } = useQuery({
    queryKey: ["order-disputes", data.id],
    queryFn: () =>
      sdk.client.fetch<AdminDisputesResponse>(
        `/admin/orders/${data.id}/disputes`
      ),
  })
  const { data: summaryRes } = useQuery({
    queryKey: ["review-summary"],
    queryFn: () =>
      sdk.client.fetch<AdminReviewSummariesResponse>("/admin/reviews/summary"),
  })

  const reviews = reviewsRes?.reviews ?? []
  const disputes = disputesRes?.disputes ?? []
  const summaries = summaryRes?.summaries ?? []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Reviews & disputes</Heading>
        <div className="flex items-center gap-x-3">
          {summaries.map((s) => (
            <span
              key={s.target}
              className="text-ui-fg-subtle flex items-center gap-x-1"
            >
              <Star className="text-ui-tag-orange-icon" />
              <Text size="small">
                {REVIEW_TARGET_META[s.target].label} {s.average} ({s.count})
              </Text>
            </span>
          ))}
        </div>
      </div>

      {/* Отзывы заказа */}
      <div className="flex flex-col">
        <div className="px-6 py-3">
          <Text size="small" weight="plus" className="text-ui-fg-subtle">
            Reviews
          </Text>
        </div>
        {reviews.length ? (
          <ul className="flex flex-col">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="flex items-center justify-between gap-x-4 border-t px-6 py-3"
              >
                <div className="flex flex-col">
                  <div className="flex items-center gap-x-2">
                    <Text size="small" weight="plus">
                      {REVIEW_TARGET_META[review.target].label} · {review.rating}★
                    </Text>
                    {review.status === "hidden" && (
                      <StatusBadge color="grey">Hidden</StatusBadge>
                    )}
                  </div>
                  {review.comment && (
                    <Text size="small" className="text-ui-fg-subtle">
                      {review.comment}
                    </Text>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenu.Trigger asChild>
                    <IconButton size="small" variant="transparent">
                      <EllipsisHorizontal />
                    </IconButton>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    {review.status === "published" ? (
                      <DropdownMenu.Item
                        className="gap-x-2"
                        disabled={moderateReview.isPending}
                        onClick={() =>
                          moderateReview.mutate({
                            id: review.id,
                            status: "hidden",
                          })
                        }
                      >
                        <EyeSlash className="text-ui-fg-subtle" />
                        Hide
                      </DropdownMenu.Item>
                    ) : (
                      <DropdownMenu.Item
                        className="gap-x-2"
                        disabled={moderateReview.isPending}
                        onClick={() =>
                          moderateReview.mutate({
                            id: review.id,
                            status: "published",
                          })
                        }
                      >
                        <Eye className="text-ui-fg-subtle" />
                        Publish
                      </DropdownMenu.Item>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-t px-6 py-3">
            <Text size="small" className="text-ui-fg-subtle">
              No reviews yet.
            </Text>
          </div>
        )}
      </div>

      {/* Диспуты заказа */}
      <div className="flex flex-col">
        <div className="px-6 py-3">
          <Text size="small" weight="plus" className="text-ui-fg-subtle">
            Disputes
          </Text>
        </div>
        {disputes.length ? (
          <ul className="flex flex-col">
            {disputes.map((dispute) => {
              const meta = DISPUTE_STATUS_META[dispute.status]
              return (
                <li
                  key={dispute.id}
                  className="hover:bg-ui-bg-base-hover flex cursor-pointer items-center justify-between gap-x-4 border-t px-6 py-3"
                  onClick={() => setSelectedDispute(dispute)}
                >
                  <div className="flex flex-col">
                    <Text size="small" weight="plus">
                      {DISPUTE_CATEGORY_META[dispute.category].label}
                    </Text>
                    <Text size="small" className="text-ui-fg-subtle">
                      {dispute.description}
                    </Text>
                  </div>
                  <StatusBadge color={meta.color}>{meta.label}</StatusBadge>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="border-t px-6 py-3">
            <Text size="small" className="text-ui-fg-subtle">
              No disputes.
            </Text>
          </div>
        )}
      </div>

      <DisputeTransitionDrawer
        dispute={selectedDispute}
        onClose={() => setSelectedDispute(null)}
      />
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderReviewsCardWidget
