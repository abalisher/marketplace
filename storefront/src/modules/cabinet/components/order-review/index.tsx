"use client"

import {
  OrderReview as Review,
  OrderReviewTarget,
  createOrderReview,
  listOrderReviews,
} from "@lib/data/reviews"
import { useMessages } from "@lib/i18n/i18n-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const TARGETS: OrderReviewTarget[] = ["supplier", "delivery"]

const Stars = ({
  value,
  onChange,
  label,
}: {
  value: number
  onChange?: (rating: number) => void
  label: string
}) => (
  <div className="flex gap-1" role={onChange ? "radiogroup" : "img"} aria-label={label}>
    {[1, 2, 3, 4, 5].map((rating) =>
      onChange ? (
        <button
          key={rating}
          type="button"
          role="radio"
          aria-checked={value === rating}
          aria-label={`${rating} / 5`}
          onClick={() => onChange(rating)}
          className={`flex h-11 w-11 items-center justify-center text-[28px] leading-none transition-colors ${
            rating <= value ? "text-accent" : "text-line hover:text-ink-secondary"
          }`}
          data-testid={`order-review-star-${rating}`}
        >
          ★
        </button>
      ) : (
        <span
          key={rating}
          aria-hidden
          className={`text-[20px] leading-none ${rating <= value ? "text-accent" : "text-line"}`}
        >
          ★
        </span>
      )
    )}
  </div>
)

// Отзыв по доставленному заказу (кабинет): две оценки — товар и продавец,
// доставка — и комментарий. Оставленный отзыв показывается как есть: второй раз
// по тому же объекту бэкенд не примет. Отзыв попадает продавцу компании в
// панель («Отзывы») и в рейтинг.
const OrderReview = ({
  orderId,
  initialReviews,
}: {
  orderId: string
  initialReviews: Review[]
}) => {
  const m = useMessages()
  const router = useRouter()
  const t = m.cabinet.review
  const [reviews, setReviews] = useState(initialReviews)
  const [ratings, setRatings] = useState<Record<OrderReviewTarget, number>>({
    supplier: 0,
    delivery: 0,
  })
  const [comment, setComment] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Сверка с сервером при открытии: страница могла прийти из кэша переходов
  // браузера, снятого до отправки отзыва, — тогда покупатель снова видел бы
  // пустую форму вместо своего отзыва.
  const syncReviews = () =>
    listOrderReviews(orderId).then((fresh) => {
      if (fresh.length) {
        setReviews(fresh)
      }
    })

  useEffect(() => {
    void syncReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])

  const left = TARGETS.filter(
    (target) => !reviews.some((review) => review.target === target)
  )
  const labels: Record<OrderReviewTarget, string> = {
    supplier: t.supplier,
    delivery: t.delivery,
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const rated = left.filter((target) => ratings[target] > 0)
    if (!rated.length) {
      setError(t.pickRating)
      return
    }
    setIsSaving(true)
    setError(null)
    const text = comment.trim()
    try {
      const created: Review[] = []
      for (let index = 0; index < rated.length; index++) {
        const target = rated[index]
        created.push(
          await createOrderReview(orderId, {
            target,
            rating: ratings[target],
            // Комментарий один на форму — пишем его к первой оценке.
            ...(index === 0 && text ? { comment: text } : {}),
          })
        )
      }
      setReviews((current) => [...current, ...created])
      setComment("")
      // Обновляем данные страницы с сервера — и кэш переходов вместе с ними.
      router.refresh()
    } catch {
      setError(t.failed)
      // Отзыв мог уже быть оставлен в другой вкладке — покажем его.
      void syncReviews()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section
      className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
      data-testid="order-review"
    >
      <h2 className="text-title-medium text-ink">
        {left.length ? t.title : t.thanks}
      </h2>

      {reviews.map((review) => (
        <div key={review.id} className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="min-w-[160px] text-body-medium text-ink-secondary">
              {labels[review.target]}
            </span>
            <Stars value={review.rating} label={`${labels[review.target]}: ${review.rating} / 5`} />
          </div>
          {review.comment && (
            <p className="text-body-medium text-ink">{review.comment}</p>
          )}
        </div>
      ))}

      {left.length > 0 && (
        <form onSubmit={submit} className="flex flex-col gap-3">
          {!reviews.length && (
            <p className="text-body-medium text-ink-secondary">{t.subtitle}</p>
          )}
          {left.map((target) => (
            <div key={target} className="flex flex-wrap items-center gap-3">
              <span className="min-w-[160px] text-body-medium text-ink">
                {labels[target]}
              </span>
              <Stars
                value={ratings[target]}
                label={labels[target]}
                onChange={(rating) =>
                  setRatings((current) => ({ ...current, [target]: rating }))
                }
              />
            </div>
          ))}
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={2000}
            rows={3}
            placeholder={t.commentPlaceholder}
            className="rounded-chip border border-line bg-surface-dim px-3 py-2 text-body-medium text-ink placeholder:text-ink-secondary focus:border-accent focus:outline-none"
            disabled={isSaving}
            data-testid="order-review-comment"
          />
          {error && (
            <p className="text-body-medium text-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex min-h-[48px] w-fit items-center justify-center rounded-chip bg-accent px-5 py-2 text-body-large text-on-accent transition-colors hover:bg-accent-pressed disabled:opacity-60"
            data-testid="order-review-submit"
          >
            {isSaving ? t.sending : t.submit}
          </button>
        </form>
      )}
    </section>
  )
}

export default OrderReview
