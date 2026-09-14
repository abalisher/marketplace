import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { PROCUREMENT_MODULE } from "../../../../modules/procurement"
import ProcurementModuleService from "../../../../modules/procurement/service"
import {
  PRICE_STOCK_CURRENCY,
  RawVariant,
  variantPrice,
} from "../../price-stock/rows"
import { variantCostSummary } from "../costs"
import { AdminGetProductCostsParamsType } from "../validators"

// GET /admin/procurement/product-costs?product_id=… — себестоимость и наценка
// позиции для карточки товара (T4.9a, блокер Жанны из Ф-прогона T4.6): чтобы
// понять «купили по 2 350 ₸, продаём по 6 000 ₸», закупщик ходил между экраном
// товара и экраном приходов и считал в голове.
//
// Один запрос отдаёт всё, что нужно карточке: по каждому варианту — последняя и
// средняя закуп-цена, остаток и его себестоимость, цена продажи, наценка в ₸ и
// %, плюс история приходов по этой позиции. История включает ЧЕРНОВИКИ
// (пометкой): «приход завели, но не провели» — частая причина расхождения цифр,
// и прятать его от закупщика значит прятать причину.
//
// Роут admin-only — контракт и Dart-клиент не трогает (docs/modules/procurement.md).
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { product_id, history_limit } =
    req.validatedQuery as AdminGetProductCostsParamsType

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "product_card.unit",
      "variants.id",
      "variants.title",
      "variants.sku",
      "variants.prices.id",
      "variants.prices.amount",
      "variants.prices.currency_code",
      "variants.prices.rules_count",
    ],
    filters: { id: product_id },
  })

  const product = data[0] as
    | {
        id: string
        title?: string | null
        product_card?: { unit?: string | null } | null
        variants?: RawVariant[] | null
      }
    | undefined
  if (!product) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "Товар не найден")
  }

  const variants = product.variants ?? []
  const variantIds = variants.map((variant) => variant.id)

  const service =
    req.scope.resolve<ProcurementModuleService>(PROCUREMENT_MODULE)

  // Партии (себестоимость) и строки приходов (история) — двумя выборками по
  // всем вариантам товара сразу: у товара вариантов единицы, а запросов на
  // вариант карточка плодить не должна.
  const [batches, lines] = variantIds.length
    ? await Promise.all([
        service.listBatches(
          { variant_id: variantIds },
          { order: { received_at: "ASC" } }
        ),
        service.listReceiptLines(
          { variant_id: variantIds },
          { relations: ["receipt"] }
        ),
      ])
    : [[], []]

  const supplierIds = [
    ...new Set(
      lines
        .map((line) => line.receipt?.supplier_id)
        .filter((id): id is string => !!id)
    ),
  ]
  const suppliers = supplierIds.length
    ? await service.listSuppliers({ id: supplierIds })
    : []
  const supplierNames = new Map(suppliers.map((s) => [s.id, s.name]))

  const iso = (value: Date | string | null | undefined): string | null =>
    value ? new Date(value).toISOString() : null

  res.json({
    currency_code: PRICE_STOCK_CURRENCY,
    product: {
      id: product.id,
      title: product.title ?? null,
      unit: product.product_card?.unit ?? null,
    },
    variants: variants.map((variant) => {
      const variantBatches = batches
        .filter((batch) => batch.variant_id === variant.id)
        .map((batch) => ({
          unit_cost: Number(batch.unit_cost),
          quantity_received: Number(batch.quantity_received),
          quantity_remaining: Number(batch.quantity_remaining),
          received_at: batch.received_at as Date | null,
        }))

      // История — новые сверху: закупщика интересует «по какой цене взяли в
      // последний раз», а не начало времён. Дата прихода у черновика может быть
      // не заполнена — тогда упорядочиваем по моменту создания записи.
      const history = lines
        .filter((line) => line.variant_id === variant.id)
        .map((line) => ({
          id: line.id,
          receipt_id: line.receipt?.id ?? null,
          reference: line.receipt?.reference ?? null,
          status: line.receipt?.status ?? null,
          source: line.receipt?.source ?? null,
          supplier_name: line.receipt?.supplier_id
            ? supplierNames.get(line.receipt.supplier_id) ?? null
            : null,
          received_at:
            iso(line.receipt?.received_at) ?? iso(line.receipt?.created_at),
          quantity: Number(line.quantity),
          unit: line.unit,
          unit_cost: Number(line.unit_cost),
          line_cost: Number(line.line_cost),
        }))
        .sort((a, b) =>
          (b.received_at ?? "").localeCompare(a.received_at ?? "")
        )

      return {
        variant_id: variant.id,
        title: variant.title ?? null,
        sku: variant.sku ?? null,
        ...variantCostSummary(variantBatches, variantPrice(variant).amount),
        receipts_count: history.length,
        receipts: history.slice(0, history_limit),
      }
    }),
  })
}
