import { Button, Drawer, Text, clx } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { formatTenge } from "../lib/money"
import {
  AdminPriceStockImportResponse,
  AdminPriceStockImportRow,
  PRICE_STOCK_IMPORT_ISSUE_LABELS,
} from "../lib/price-stock-import"

type Props = {
  preview: AdminPriceStockImportResponse | null
  fileName: string | null
  applying: boolean
  onClose: () => void
  // Наружу отдаём готовую партию — её пишет тот же путь, что и правку в
  // клетке: `POST /admin/price-stock` с пометкой «импорт».
  onApply: () => void
}

// Предпросмотр загруженного файла (T10.14c). Файл не пишет ничего сам: сначала
// продавец видит, ЧТО именно поменяется — построчно, парой «было → станет», и
// какие строки файла принять нельзя (с их номером — искать их он будет в
// Excel). Только после этого работает «Применить».
const PriceStockImportDrawer = ({
  preview,
  fileName,
  applying,
  onClose,
  onApply,
}: Props) => {
  const { t } = useTranslation()
  const summary = preview?.summary

  // Пара «было → станет» одной величины. Файл трогает не всё: клетку, которую
  // он не менял, показываем прочерком, а не повтором текущего числа —
  // иначе строка читается как «поменяли и цену тоже».
  const pair = (
    row: AdminPriceStockImportRow,
    field: "price" | "stock"
  ) => {
    const next = field === "price" ? row.new_price : row.new_stock
    if (next == null) {
      return <span className="sm-ps-imp-idle">—</span>
    }
    const before = field === "price" ? row.old_price : row.old_stock
    const show = (value: number | null) =>
      value == null
        ? "—"
        : field === "price"
          ? formatTenge(value)
          : `${value} ${row.unit ?? t("priceStock.unitFallback")}`
    return (
      <span className="sm-ps-nums">
        <span className="sm-ps-imp-old">{show(before)}</span>
        {" → "}
        <span className="sm-ps-imp-new">{show(next)}</span>
      </span>
    )
  }

  return (
    <Drawer
      open={!!preview}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
    >
      <Drawer.Content className="sm-ps-imp">
        <Drawer.Header>
          <Drawer.Title>{t("priceStock.exchange.previewTitle")}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
          {summary && (
            <div className="flex flex-col gap-y-1">
              <Text size="small" weight="plus">
                {fileName ?? t("priceStock.exchange.file")}
              </Text>
              <Text size="small" className="text-ui-fg-subtle">
                {t("priceStock.exchange.summary", {
                  rows: summary.rows,
                  changes: summary.changes,
                  unchanged: summary.unchanged,
                })}
              </Text>
              {/* Куда уедут остатки — словами: числа набраны для одного склада,
                  и продавец обязан видеть, для какого именно. */}
              {preview?.location_name && (
                <Text size="small" className="text-ui-fg-subtle">
                  {t("priceStock.exchange.location", {
                    location: preview.location_name,
                  })}
                </Text>
              )}
              {summary.issues > 0 && (
                <Text size="small" className="sm-ps-imp-warn">
                  {t("priceStock.exchange.issues", { n: summary.issues })}
                </Text>
              )}
              {preview?.rows_truncated && (
                <Text size="small" className="text-ui-fg-subtle">
                  {t("priceStock.exchange.truncated")}
                </Text>
              )}
              {preview?.scan_capped && (
                <Text size="small" className="text-ui-fg-subtle">
                  {t("priceStock.exchange.scanCapped")}
                </Text>
              )}
            </div>
          )}

          {preview && preview.rows.length > 0 ? (
            <table className="sm-ps-imp-table">
              <thead>
                <tr>
                  <th>{t("priceStock.exchange.colLine")}</th>
                  <th>{t("priceStock.colProduct")}</th>
                  <th>{t("priceStock.colPrice")}</th>
                  <th>{t("priceStock.colStock")}</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr
                    key={`${row.line}-${row.sku}`}
                    className={clx({ "sm-ps-imp-row-bad": !!row.issue })}
                  >
                    <td className="sm-ps-nums">{row.line}</td>
                    <td>
                      <div className="sm-ps-imp-title">
                        <span className="sm-ps-title-text">
                          {row.title ?? row.sku ?? t("priceStock.noSku")}
                        </span>
                        <span className="sm-ps-sub">
                          {row.sku
                            ? t("priceStock.sku", { sku: row.sku })
                            : t("priceStock.noSku")}
                          {row.issue
                            ? ` · ${t(PRICE_STOCK_IMPORT_ISSUE_LABELS[row.issue])}`
                            : ""}
                        </span>
                      </div>
                    </td>
                    <td>{pair(row, "price")}</td>
                    <td>{pair(row, "stock")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Text size="small" className="text-ui-fg-subtle">
              {t("priceStock.exchange.noChanges")}
            </Text>
          )}
        </Drawer.Body>
        <Drawer.Footer>
          <Button size="small" variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            size="small"
            disabled={!summary?.changes || applying}
            onClick={onApply}
          >
            {applying
              ? t("priceStock.bar.applying")
              : t("priceStock.exchange.apply", { n: summary?.changes ?? 0 })}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export default PriceStockImportDrawer
