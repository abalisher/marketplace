import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminProduct, DetailWidgetProps } from "@medusajs/framework/types"
import {
  Button,
  Container,
  Heading,
  StatusBadge,
  Table,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { formatDate } from "../lib/date"
import { formatTenge } from "../lib/money"
import {
  AdminProductCostsResponse,
  AdminVariantCost,
  AdminVariantCostReceipt,
} from "../lib/procurement"
import { sdk } from "../lib/sdk"

// Widget себестоимости и наценки на ядровой странице товара (T4.9a, блокер
// закупщика Жанны из Ф-прогона T4.6, подтверждён владельцем 2026-08-12 —
// «почему не вижу стоимость закупа?»).
//
// ЗАЧЕМ. Чтобы понять «купили по 2 350 ₸, продаём по 6 000 ₸», закупщик ходил
// между карточкой товара и экраном приходов и считал наценку в голове. Здесь
// обе цены стоят рядом: последняя и средняя закуп-цена, цена продажи, наценка
// в тенге и в процентах, партии закупа с их себестоимостью и история приходов
// по этой позиции.
//
// Данные — своим запросом (GET /admin/procurement/product-costs): prop `data`
// ядра знает только цены продажи, а закуп живёт в партиях модуля procurement.

const EMPTY = "—"

// Количество: материалы дробные (2,5 м³), но «10,000» в клетке — шум.
const QUANTITY_FORMAT = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 3,
})

// Наценка в процентах: знак ставим сами — «+126,2 %» читается как прибавка к
// закупу, а не как доля от цены.
const formatPercent = (value: number) =>
  `${value > 0 ? "+" : ""}${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 1,
  }).format(value)} %`

// Клетка свода: подпись сверху, число снизу — идиома денежных плиток дашборда.
const Metric = ({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint?: string | null
  tone?: "error"
}) => (
  <div className="flex flex-col gap-y-1">
    <Text size="small" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text
      size="base"
      weight="plus"
      leading="compact"
      className={`tabular-nums ${tone === "error" ? "text-ui-fg-error" : ""}`}
    >
      {value}
    </Text>
    {hint ? (
      <Text size="xsmall" className="text-ui-fg-muted">
        {hint}
      </Text>
    ) : null}
  </div>
)

const VariantCostBlock = ({
  variant,
  showTitle,
}: {
  variant: AdminVariantCost
  showTitle: boolean
}) => {
  const { t } = useTranslation()

  const hasCost = variant.average_cost !== null
  const hasDraft = variant.receipts.some(
    (receipt: AdminVariantCostReceipt) => receipt.status === "draft"
  )

  return (
    <div className="flex flex-col gap-y-4 px-6 py-4">
      {showTitle ? (
        <Text size="small" weight="plus">
          {variant.title || EMPTY}
          {variant.sku ? ` · ${variant.sku}` : ""}
        </Text>
      ) : null}

      {hasCost || variant.price !== null ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Metric
            label={t("procurement.cost.lastCost")}
            value={
              variant.last_cost === null
                ? EMPTY
                : formatTenge(variant.last_cost)
            }
            hint={
              variant.last_cost_at ? formatDate(variant.last_cost_at) : null
            }
          />
          <Metric
            label={t("procurement.cost.averageCost")}
            value={
              variant.average_cost === null
                ? EMPTY
                : formatTenge(variant.average_cost)
            }
            hint={
              variant.average_basis
                ? t(
                    variant.average_basis === "stock"
                      ? "procurement.cost.basisStock"
                      : "procurement.cost.basisReceipts"
                  )
                : null
            }
          />
          <Metric
            label={t("procurement.cost.price")}
            value={variant.price === null ? EMPTY : formatTenge(variant.price)}
            hint={variant.price === null ? t("procurement.cost.noPrice") : null}
          />
          {/* Наценка — ответ на вопрос, за которым закупщик и пришёл: сколько
              зарабатываем на единице и сколько это в процентах к закупу.
              Отрицательная (продаём ниже закупа) подсвечивается ошибкой. */}
          <Metric
            label={t("procurement.cost.markup")}
            value={
              variant.margin === null
                ? EMPTY
                : `${formatTenge(variant.margin)}${
                    variant.markup_percent === null
                      ? ""
                      : ` · ${formatPercent(variant.markup_percent)}`
                  }`
            }
            tone={
              variant.margin !== null && variant.margin < 0 ? "error" : undefined
            }
            // Почему наценки нет, уже сказано соседями: «Цена не назначена» в
            // клетке цены и строка «приходов не было» под сводом. Третья
            // подпись про то же — шум (кадры cost-empty-* показывали её
            // одновременно с обеими).
            hint={
              variant.markup_percent === null && variant.margin !== null
                ? t("procurement.cost.zeroCost")
                : null
            }
          />
        </div>
      ) : null}

      {/* Количество по партиям — это НЕ складской остаток: списание партий при
          продаже ещё не подключено (отложенная подзадача procurement), и на
          стенде партии показывали 380 там, где склад показывал 713. Поэтому
          строка названа партиями и прямо говорит, где живёт остаток — иначе
          закупщик видел бы две «одинаковые» цифры, которые не сходятся. */}
      {hasCost ? (
        <div className="flex flex-col gap-y-1">
          <Text size="small" className="text-ui-fg-subtle tabular-nums">
            {t("procurement.cost.batches")}:{" "}
            {QUANTITY_FORMAT.format(variant.batch_quantity)}
            {" · "}
            {formatTenge(variant.batch_cost_value)}{" "}
            {t("procurement.cost.batchesValue")}
          </Text>
          <Text size="xsmall" className="text-ui-fg-muted">
            {t("procurement.cost.batchesHint")}
          </Text>
        </div>
      ) : null}

      {variant.receipts.length ? (
        <div className="flex flex-col gap-y-2">
          <Text size="small" weight="plus">
            {t("procurement.cost.historyTitle")}
          </Text>
          {/* Поставщик и номер накладной — ОДНА колонка в две строки: шестая
              колонка не влезала в карточку товара (ядровая страница держит
              справа блок JSON), и «Сумма» обрезалась по краю. Даты и деньги не
              рвём по словам: «520 000 ₸» с валютой на второй строке не
              читается; шире карточки таблица прокручивается сама. */}
          <div className="overflow-x-auto">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell className="whitespace-nowrap">
                    {t("procurement.cost.colDate")}
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    {t("procurement.cost.colSupplier")}
                  </Table.HeaderCell>
                  <Table.HeaderCell className="whitespace-nowrap">
                    {t("procurement.cost.colQty")}
                  </Table.HeaderCell>
                  <Table.HeaderCell className="whitespace-nowrap">
                    {t("procurement.cost.colUnitCost")}
                  </Table.HeaderCell>
                  <Table.HeaderCell className="whitespace-nowrap">
                    {t("procurement.cost.colTotal")}
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {variant.receipts.map((receipt) => (
                  <Table.Row key={receipt.id}>
                    <Table.Cell className="whitespace-nowrap">
                      {formatDate(receipt.received_at)}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col gap-y-1">
                        <span>{receipt.supplier_name || EMPTY}</span>
                        <div className="flex items-center gap-x-2">
                          <Text size="small" className="text-ui-fg-subtle">
                            {receipt.reference
                              ? t("procurement.cost.reference", {
                                  reference: receipt.reference,
                                })
                              : t("procurement.cost.noReference")}
                          </Text>
                          {receipt.status === "draft" ? (
                            <StatusBadge color="grey">
                              {t("procurement.status.draft")}
                            </StatusBadge>
                          ) : null}
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap tabular-nums">
                      {QUANTITY_FORMAT.format(receipt.quantity)} {receipt.unit}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap tabular-nums">
                      {formatTenge(receipt.unit_cost)}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap tabular-nums">
                      {formatTenge(receipt.line_cost)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
          {hasDraft ? (
            <Text size="xsmall" className="text-ui-fg-muted">
              {t("procurement.cost.draftHint")}
            </Text>
          ) : null}
          {variant.receipts_count > variant.receipts.length ? (
            <Text size="xsmall" className="text-ui-fg-muted">
              {t("procurement.cost.more", {
                shown: variant.receipts.length,
                count: variant.receipts_count,
              })}
            </Text>
          ) : null}
        </div>
      ) : (
        <Text size="small" className="text-ui-fg-subtle">
          {t("procurement.cost.empty")}
        </Text>
      )}
    </div>
  )
}

const ProductCostCardWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["product-costs", data.id],
    queryFn: () =>
      sdk.client.fetch<AdminProductCostsResponse>(
        "/admin/procurement/product-costs",
        { query: { product_id: data.id } }
      ),
  })

  const variants = response?.variants ?? []

  return (
    <Container className="divide-y p-0" data-sm-section="product-cost">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("procurement.cost.title")}</Heading>
        <Button
          size="small"
          variant="secondary"
          onClick={() => navigate("/procurement")}
        >
          {t("procurement.cost.allReceipts")}
        </Button>
      </div>

      {isError ? (
        <div className="flex flex-col items-start gap-y-2 px-6 py-4">
          <Text size="small" className="text-ui-fg-error">
            {t("procurement.cost.error")}
          </Text>
          <Button size="small" variant="secondary" onClick={() => refetch()}>
            {t("procurement.cost.retry")}
          </Button>
        </div>
      ) : isLoading ? (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {t("common.loading")}
          </Text>
        </div>
      ) : (
        variants.map((variant) => (
          <VariantCostBlock
            key={variant.variant_id}
            variant={variant}
            // Один вариант — его название ничего не добавляет: карточка и так
            // открыта на этом товаре. Несколько — подписываем каждый блок.
            showTitle={variants.length > 1}
          />
        ))
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductCostCardWidget
