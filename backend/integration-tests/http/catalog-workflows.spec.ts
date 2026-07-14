import { medusaIntegrationTestRunner } from "@medusajs/test-utils"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import { MedusaContainer } from "@medusajs/framework/types"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { createProductCardWorkflow } from "../../src/workflows/create-product-card"
import { submitProductForModerationWorkflow } from "../../src/workflows/submit-product-for-moderation"
import { approveProductCardWorkflow } from "../../src/workflows/approve-product-card"
import { rejectProductCardWorkflow } from "../../src/workflows/reject-product-card"
import { CATALOG_MODULE } from "../../src/modules/catalog"
import CatalogModuleService from "../../src/modules/catalog/service"

jest.setTimeout(120000)

// Интеграционные тесты workflows каталога: карточка к товару ядра, флоу
// модерации draft → proposed → published/rejected и повторная модерация
// через subscriber на product.updated (нужен docker-postgres; временная БД —
// см. backend/.env.test).
medusaIntegrationTestRunner({
  testSuite: ({ getContainer }) => {
    let container: MedusaContainer
    let productSeq = 0

    // Товар ядра — носитель статуса модерации (product.status).
    const createProduct = async () => {
      const productService = container.resolve(Modules.PRODUCT)
      productSeq += 1
      return await productService.createProducts({
        title: `Cement M400 #${productSeq}`,
        status: ProductStatus.DRAFT,
      })
    }

    const createCard = async (
      productId: string,
      overrides: Partial<{
        segment: "economy" | "comfort" | "business"
        unit: string
        certificates: { name: string; url: string }[]
      }> = {}
    ) => {
      const { result } = await createProductCardWorkflow(container).run({
        input: {
          product_id: productId,
          segment: "economy",
          unit: "мешок 25 кг",
          certificates: [{ name: "ГОСТ 31108-2020", url: "/files/cert.pdf" }],
          ...overrides,
        },
      })
      return result
    }

    const retrieveProduct = async (productId: string) => {
      const productService = container.resolve(Modules.PRODUCT)
      return await productService.retrieveProduct(productId)
    }

    // Событие product.updated обрабатывается subscriber'ом асинхронно —
    // ждём целевой статус опросом, а не фиксированной паузой.
    const waitForStatus = async (
      productId: string,
      status: string,
      timeoutMs = 10000
    ) => {
      const deadline = Date.now() + timeoutMs
      for (;;) {
        const product = await retrieveProduct(productId)
        if (product.status === status || Date.now() > deadline) {
          return product
        }
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    // Движок workflow сериализует ошибку шага в plain object (не instanceof
    // Error), поэтому expect(...).rejects.toThrow её не видит — проверяем
    // отклонение явным try/catch по message (как в company-workflows.spec.ts).
    const expectWorkflowError = async (
      run: PromiseLike<unknown>,
      substring: string
    ) => {
      let thrown: { message?: string } | null = null
      try {
        await run
      } catch (e) {
        thrown = e as { message?: string }
      }
      expect(thrown?.message).toContain(substring)
    }

    beforeAll(() => {
      container = getContainer()
    })

    describe("createProductCardWorkflow", () => {
      it("creates a card linked 1:1 to a core product", async () => {
        const product = await createProduct()

        const card = await createCard(product.id, { segment: "business" })

        expect(card.id).toMatch(/^pcard_/)
        expect(card.segment).toEqual("business")

        // Link виден через query.graph; статус товара не меняется (draft).
        const query = container.resolve(ContainerRegistrationKeys.QUERY)
        const { data } = await query.graph({
          entity: "product",
          fields: ["id", "status", "product_card.id"],
          filters: { id: product.id },
        })
        expect(data[0].product_card?.id).toEqual(card.id)
        expect(data[0].status).toEqual("draft")
      })

      it("rejects a second card for the same product and rolls the card back", async () => {
        const product = await createProduct()
        await createCard(product.id)

        await expectWorkflowError(
          createProductCardWorkflow(container).run({
            input: {
              product_id: product.id,
              segment: "comfort",
              unit: "duplicate-card-marker",
            },
            throwOnError: true,
          }),
          "already has a product card"
        )

        // Компенсация: карточка-дубль не осталась в БД.
        const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
        const leftovers = await service.listProductCards({
          unit: "duplicate-card-marker",
        })
        expect(leftovers).toHaveLength(0)
      })

      it("rejects an unknown product", async () => {
        await expectWorkflowError(
          createProductCardWorkflow(container).run({
            input: {
              product_id: "prod_does_not_exist",
              segment: "economy",
              unit: "шт",
            },
            throwOnError: true,
          }),
          "not found"
        )
      })
    })

    describe("submitProductForModerationWorkflow", () => {
      it("moves a draft product with certificates to proposed", async () => {
        const product = await createProduct()
        await createCard(product.id)

        const { result } = await submitProductForModerationWorkflow(
          container
        ).run({ input: { product_id: product.id } })

        expect(result.status).toEqual("proposed")
      })

      it("requires non-empty certificates", async () => {
        const product = await createProduct()
        await createCard(product.id, { certificates: [] })

        await expectWorkflowError(
          submitProductForModerationWorkflow(container).run({
            input: { product_id: product.id },
            throwOnError: true,
          }),
          "Certificates are required"
        )
        expect((await retrieveProduct(product.id)).status).toEqual("draft")
      })

      it("rejects a product without a card", async () => {
        const product = await createProduct()

        await expectWorkflowError(
          submitProductForModerationWorkflow(container).run({
            input: { product_id: product.id },
            throwOnError: true,
          }),
          "has no product card"
        )
      })

      it("rejects statuses other than draft or rejected", async () => {
        const product = await createProduct()
        await createCard(product.id)
        await submitProductForModerationWorkflow(container).run({
          input: { product_id: product.id },
        })

        await expectWorkflowError(
          submitProductForModerationWorkflow(container).run({
            input: { product_id: product.id },
            throwOnError: true,
          }),
          "Only draft or rejected"
        )
      })
    })

    describe("moderation workflows", () => {
      const submittedProduct = async () => {
        const product = await createProduct()
        const card = await createCard(product.id)
        await submitProductForModerationWorkflow(container).run({
          input: { product_id: product.id },
        })
        return { product, card }
      }

      it("approves a proposed card: published, rejection reason cleared", async () => {
        const { product, card } = await submittedProduct()

        const { result } = await approveProductCardWorkflow(container).run({
          input: { product_id: product.id },
        })

        expect(result.status).toEqual("published")
        const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
        const loaded = await service.retrieveProductCard(card.id)
        expect(loaded.rejection_reason).toBeNull()
      })

      it("rejects a proposed card with a mandatory reason", async () => {
        const { product, card } = await submittedProduct()

        const { result } = await rejectProductCardWorkflow(container).run({
          input: { product_id: product.id, reason: "no certificates" },
        })

        expect(result.status).toEqual("rejected")
        const service = container.resolve<CatalogModuleService>(CATALOG_MODULE)
        const loaded = await service.retrieveProductCard(card.id)
        expect(loaded.rejection_reason).toEqual("no certificates")

        // Продавец исправляет и отправляет снова: rejected → proposed,
        // комментарий отклонения сброшен.
        const { result: resubmitted } =
          await submitProductForModerationWorkflow(container).run({
            input: { product_id: product.id },
          })
        expect(resubmitted.status).toEqual("proposed")
        const cleared = await service.retrieveProductCard(card.id)
        expect(cleared.rejection_reason).toBeNull()
      })

      it("requires a reason to reject and rolls the status back", async () => {
        const { product } = await submittedProduct()

        await expectWorkflowError(
          rejectProductCardWorkflow(container).run({
            input: { product_id: product.id, reason: "  " },
            throwOnError: true,
          }),
          "Rejection reason is required"
        )

        // Компенсация update-product-status: товар остался на модерации.
        expect((await retrieveProduct(product.id)).status).toEqual("proposed")
      })

      it("refuses to approve a product that is not proposed", async () => {
        const product = await createProduct()
        await createCard(product.id)

        await expectWorkflowError(
          approveProductCardWorkflow(container).run({
            input: { product_id: product.id },
            throwOnError: true,
          }),
          "Only products pending moderation"
        )
      })
    })

    describe("re-moderation subscriber (product.updated)", () => {
      it("sends an edited published product back to moderation, but not the approval itself", async () => {
        const product = await createProduct()
        await createCard(product.id)
        await submitProductForModerationWorkflow(container).run({
          input: { product_id: product.id },
        })
        await approveProductCardWorkflow(container).run({
          input: { product_id: product.id },
        })

        // Approve меняет статус через сервис модуля product (без события) —
        // subscriber не должен вернуть только что одобренный товар в proposed.
        await new Promise((resolve) => setTimeout(resolve, 1500))
        expect((await retrieveProduct(product.id)).status).toEqual("published")

        // Правка карточки продавцом идёт через ядровый workflow — он эмитит
        // product.updated, и одобренный товар возвращается на модерацию.
        await updateProductsWorkflow(container).run({
          input: {
            selector: { id: product.id },
            update: { title: "Cement M400 improved" },
          },
        })

        const remoderated = await waitForStatus(product.id, "proposed")
        expect(remoderated.status).toEqual("proposed")
      })

      it("ignores published products without a catalog card", async () => {
        const productService = container.resolve(Modules.PRODUCT)
        const product = await productService.createProducts({
          title: "Core-only product",
          status: ProductStatus.PUBLISHED,
        })

        await updateProductsWorkflow(container).run({
          input: {
            selector: { id: product.id },
            update: { title: "Core-only product v2" },
          },
        })

        await new Promise((resolve) => setTimeout(resolve, 1500))
        expect((await retrieveProduct(product.id)).status).toEqual("published")
      })
    })
  },
})
