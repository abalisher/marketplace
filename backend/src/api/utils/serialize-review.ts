// Сериализация отзывов и диспутов для API (без служебных полей mikro-orm).

type ReviewRow = {
  id: string
  order_id: string
  customer_id: string
  target: string
  rating: number
  comment: string | null
  status: string
  created_at?: Date | string | null
}

type DisputeRow = {
  id: string
  order_id: string
  customer_id: string
  category: string
  description: string
  status: string
  resolution: string | null
  created_at?: Date | string | null
}

export const serializeReview = (review: ReviewRow) => ({
  id: review.id,
  order_id: review.order_id,
  target: review.target,
  rating: Number(review.rating),
  comment: review.comment,
  status: review.status,
  created_at: review.created_at ?? null,
})

export const serializeDispute = (dispute: DisputeRow) => ({
  id: dispute.id,
  order_id: dispute.order_id,
  category: dispute.category,
  description: dispute.description,
  status: dispute.status,
  resolution: dispute.resolution,
  created_at: dispute.created_at ?? null,
})

// Админ/продавец видит дополнительно customer_id (для связи с покупателем).
export const serializeReviewForAdmin = (review: ReviewRow) => ({
  ...serializeReview(review),
  customer_id: review.customer_id,
})

export const serializeDisputeForAdmin = (dispute: DisputeRow) => ({
  ...serializeDispute(dispute),
  customer_id: dispute.customer_id,
})
