import {
  createWorkflow,
  transform,
  WorkflowData,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError, Modules, ProductStatus } from "@medusajs/framework/utils"
import {
  createInventoryLevelsWorkflow,
  createProductsWorkflow,
  createRemoteLinkStep,
  useQueryGraphStep,
} from "@medusajs/medusa/core-flows"
import { CATALOG_MODULE } from "../../modules/catalog"
import {
  ONEC_DEFAULT_SEGMENT,
  OnecDesiredProduct,
  onecMetadata,
} from "../../lib/onec/plan"
import { createOnecItemsStep, createOnecProductCardsStep } from "./steps"

// Название опции товара из 1С. Вариант у позиции 1С один, но ядро требует
// опцию у каждого товара — её значение = единица измерения.
export const ONEC_OPTION_TITLE = "Единица"
export const ONEC_CURRENCY = "kzt"

export type ImportOnecProductsWorkflowInput = {
  tenant_id: string
  sales_channel_id: string
  location_id: string
  shipping_profile_id: string | null
  // handle категории → id категории ядра.
  category_ids: Record<string, string>
  products: OnecDesiredProduct[]
}

// Завести партию позиций 1С товарами компании: товар (сразу в канале компании,
// с профилем доставки и ценой), остаток на складе компании, карточка каталога
// и запись «позиция 1С ↔ товар». Партия атомарна: упади любой шаг — созданное
// откатывается, и в следующий раз позиция заводится заново, а не задваивается.
//
// Модерацию товары из 1С не проходят: это учёт самой компании, а не карточка,
// которую продавец набрал руками (сертификатов в 1С нет, и требовать их значило
// бы не пустить на витрину ни одной позиции). Позиция без цены заводится
// черновиком — купить её нельзя, пока цену не даст 1С или продавец.
export const importOnecProductsWorkflow = createWorkflow(
  "import-onec-products",
  (input: WorkflowData<ImportOnecProductsWorkflowInput>) => {
    const productsInput = transform({ input }, ({ input }) =>
      input.products.map((product) => ({
        title: product.title,
        handle: product.handle,
        description: product.description ?? undefined,
        status: product.published ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
        category_ids: input.category_ids[product.category]
          ? [input.category_ids[product.category]]
          : [],
        sales_channels: [{ id: input.sales_channel_id }],
        ...(input.shipping_profile_id
          ? { shipping_profile_id: input.shipping_profile_id }
          : {}),
        metadata: onecMetadata(
          product.key,
          product.code,
          product.onec_fields,
          product.feed,
          product.brand
        ),
        options: [{ title: ONEC_OPTION_TITLE, values: [product.unit] }],
        variants: [
          {
            title: product.unit,
            sku: product.sku,
            manage_inventory: product.manage_inventory,
            options: { [ONEC_OPTION_TITLE]: product.unit },
            // Цену при создании ставим, только если её ведёт 1С; иначе её
            // проставит продавец на «Ценах и остатках».
            prices:
              product.onec_fields.includes("price") &&
              product.price != null &&
              product.price > 0
                ? [{ amount: product.price, currency_code: ONEC_CURRENCY }]
                : [],
          },
        ],
      }))
    )

    const created = createProductsWorkflow.runAsStep({
      input: { products: productsInput },
    })

    // Позиция 1С ↔ созданный товар: handle уникален и задан нами.
    const pairs = transform({ input, created }, ({ input, created }) => {
      const byHandle = new Map(
        (created as { id: string; handle: string; variants?: { id: string }[] }[]).map(
          (product) => [product.handle, product]
        )
      )
      return input.products.map((desired) => {
        const product = byHandle.get(desired.handle)
        if (!product?.variants?.[0]) {
          throw new MedusaError(
            MedusaError.Types.UNEXPECTED_STATE,
            `Товар «${desired.title}» не создан`
          )
        }
        return {
          desired,
          product_id: product.id,
          variant_id: product.variants[0].id,
        }
      })
    })

    const variantIds = transform({ pairs }, ({ pairs }) =>
      pairs.map((pair) => pair.variant_id)
    )
    const { data: variants } = useQueryGraphStep({
      entity: "product_variant",
      fields: ["id", "inventory_items.inventory_item_id"],
      filters: { id: variantIds },
    }).config({ name: "load-onec-variant-inventory" })

    const levels = transform({ input, pairs, variants }, (data) => {
      const inventoryByVariant = new Map(
        (
          data.variants as {
            id: string
            inventory_items?: { inventory_item_id: string }[]
          }[]
        ).map((variant) => [
          variant.id,
          variant.inventory_items?.[0]?.inventory_item_id,
        ])
      )
      return data.pairs
        .map((pair) => ({
          inventory_item_id: inventoryByVariant.get(pair.variant_id) as string,
          location_id: data.input.location_id,
          stocked_quantity: pair.desired.stock,
        }))
        .filter((level) => !!level.inventory_item_id)
    })
    createInventoryLevelsWorkflow.runAsStep({
      input: { inventory_levels: levels },
    })

    const cards = createOnecProductCardsStep(
      transform({ pairs }, ({ pairs }) => ({
        cards: pairs.map((pair) => ({
          product_id: pair.product_id,
          segment: ONEC_DEFAULT_SEGMENT,
          unit: pair.desired.unit,
        })),
      }))
    )
    createRemoteLinkStep(
      transform({ cards }, ({ cards }) =>
        cards.map((card) => ({
          [Modules.PRODUCT]: { product_id: card.product_id },
          [CATALOG_MODULE]: { product_card_id: card.product_card_id },
        }))
      )
    )

    createOnecItemsStep(
      transform({ input, pairs }, ({ input, pairs }) => ({
        tenant_id: input.tenant_id,
        items: pairs.map((pair) => ({
          external_key: pair.desired.key,
          external_code: pair.desired.code,
          cost: pair.desired.cost,
          product_id: pair.product_id,
          variant_id: pair.variant_id,
        })),
      }))
    )

    return new WorkflowResponse(
      transform({ pairs }, ({ pairs }) =>
        pairs.map((pair) => ({
          key: pair.desired.key,
          product_id: pair.product_id,
          variant_id: pair.variant_id,
        }))
      )
    )
  }
)
