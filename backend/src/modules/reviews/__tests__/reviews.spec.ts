import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import { REVIEWS_MODULE } from ".."
import ReviewsModuleService from "../service"
import Review from "../models/review"
import Dispute from "../models/dispute"

jest.setTimeout(120000)

// Интеграционный тест модуля reviews: инварианты из docs/modules/reviews.md —
// границы оценки, «один отзыв на (заказ, покупатель, объект)», сводка рейтинга
// по опубликованным, стейт-машина диспута. Раннер поднимает модуль на временной
// БД (.env.test). Состояние НЕ переживает границу `it` — каждый тест самодостаточен.
moduleIntegrationTestRunner<ReviewsModuleService>({
  moduleName: REVIEWS_MODULE,
  moduleModels: [Review, Dispute],
  resolve: "./src/modules/reviews",
  testSuite: ({ service }) => {
    describe("ReviewsModuleService — reviews", () => {
      it("creates a review with a valid rating", async () => {
        const review = await service.createReview({
          order_id: "order_1",
          customer_id: "cus_1",
          target: "supplier",
          rating: 5,
          comment: "Отличный товар",
        })
        expect(review.id).toMatch(/^rev_/)
        expect(review.target).toEqual("supplier")
        expect(review.rating).toEqual(5)
        expect(review.status).toEqual("published")
      })

      it("rejects an out-of-range or non-integer rating", async () => {
        await expect(
          service.createReview({
            order_id: "order_2",
            customer_id: "cus_1",
            target: "supplier",
            rating: 6,
          })
        ).rejects.toThrow(/Rating must be/)
        await expect(
          service.createReview({
            order_id: "order_2",
            customer_id: "cus_1",
            target: "supplier",
            rating: 0,
          })
        ).rejects.toThrow(/Rating must be/)
      })

      it("allows one review per (order, customer, target) but both targets", async () => {
        await service.createReview({
          order_id: "order_3",
          customer_id: "cus_1",
          target: "supplier",
          rating: 4,
        })
        // Второй отзыв на тот же объект того же заказа — запрещён.
        await expect(
          service.createReview({
            order_id: "order_3",
            customer_id: "cus_1",
            target: "supplier",
            rating: 3,
          })
        ).rejects.toThrow(/already exists/)
        // Отзыв о доставке того же заказа — независим, разрешён.
        const delivery = await service.createReview({
          order_id: "order_3",
          customer_id: "cus_1",
          target: "delivery",
          rating: 5,
        })
        expect(delivery.target).toEqual("delivery")
      })

      it("summarises rating over published reviews only", async () => {
        await service.createReview({
          order_id: "order_4",
          customer_id: "cus_1",
          target: "supplier",
          rating: 5,
        })
        const hidden = await service.createReview({
          order_id: "order_5",
          customer_id: "cus_2",
          target: "supplier",
          rating: 1,
        })
        // Скрытый отзыв в среднее не входит.
        await service.setReviewStatus({ id: hidden.id, status: "hidden" })

        const summary = await service.getRatingSummary("supplier")
        expect(summary.count).toEqual(1)
        expect(summary.average).toEqual(5)
      })
    })

    describe("ReviewsModuleService — disputes", () => {
      it("opens a dispute and blocks a second active one on the same order", async () => {
        const dispute = await service.openDispute({
          order_id: "order_6",
          customer_id: "cus_1",
          category: "damaged",
          description: "Мешок порван при доставке",
        })
        expect(dispute.id).toMatch(/^dsp_/)
        expect(dispute.status).toEqual("open")

        await expect(
          service.openDispute({
            order_id: "order_6",
            customer_id: "cus_1",
            category: "other",
            description: "ещё одна",
          })
        ).rejects.toThrow(/active dispute/)
      })

      it("walks the dispute state machine and rejects illegal transitions", async () => {
        const dispute = await service.openDispute({
          order_id: "order_7",
          customer_id: "cus_1",
          category: "quality",
          description: "Цемент не схватывается",
        })

        const inReview = await service.recordDisputeTransition({
          id: dispute.id,
          to: "in_review",
        })
        expect(inReview.status).toEqual("in_review")

        const resolved = await service.recordDisputeTransition({
          id: dispute.id,
          to: "resolved",
          resolution: "Компенсация начислена бонусами",
        })
        expect(resolved.status).toEqual("resolved")
        expect(resolved.resolution).toContain("Компенсация")

        // Из терминального resolved переходов нет.
        await expect(
          service.recordDisputeTransition({ id: dispute.id, to: "open" })
        ).rejects.toThrow(/not allowed/)
      })

      it("allows a new dispute after the previous one is closed", async () => {
        const first = await service.openDispute({
          order_id: "order_8",
          customer_id: "cus_1",
          category: "wrong_item",
          description: "Привезли не тот товар",
        })
        await service.recordDisputeTransition({
          id: first.id,
          to: "rejected",
          resolution: "Товар соответствует заказу",
        })
        // Закрытый диспут не мешает открыть новый по тому же заказу.
        const second = await service.openDispute({
          order_id: "order_8",
          customer_id: "cus_1",
          category: "other",
          description: "Новая проблема",
        })
        expect(second.status).toEqual("open")
      })
    })
  },
})
