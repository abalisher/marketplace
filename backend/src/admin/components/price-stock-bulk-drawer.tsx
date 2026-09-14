import { Button, Drawer, Input, Label, Text } from "@medusajs/ui"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { isAmountFractional, sanitizeAmountInput } from "../lib/price-stock"

type Props = {
  open: boolean
  // Сколько строк выделено — числом в заголовке: продавец должен видеть, во
  // сколько позиций уедет одно число, ДО того как его наберёт.
  selectedCount: number
  // Названия выделенных строк, которых сейчас нет на экране (продавец сменил
  // поиск или страницу). Молчать про них нельзя: одно число уедет и в них.
  offscreenTitles: string[]
  locationName: string | null
  onClose: () => void
  // Наружу отдаём набранное; в каталог ничего не пишем — числа лишь
  // подставляются в клетки, и продавец применяет их той же кнопкой, что и
  // правку одной строки.
  onSubmit: (values: { price?: string; stock?: string }) => void
}

// Массовая правка выделенных строк экрана «Цены и остатки»: одно число цены
// и/или остатка во все выделенные позиции. Пустое поле — «не трогать»: поднять
// цену двадцати позициям, не тронув их остатки, — обычный случай.
const PriceStockBulkDrawer = ({
  open,
  selectedCount,
  offscreenTitles,
  locationName,
  onClose,
  onSubmit,
}: Props) => {
  const { t } = useTranslation()
  const [price, setPrice] = useState("")
  const [stock, setStock] = useState("")

  // Открыли заново — поля чистые: прошлое число, оставшееся в форме, уехало бы
  // в другой набор строк.
  useEffect(() => {
    if (open) {
      setPrice("")
      setStock("")
    }
  }, [open])

  // Копейки в число каталога не превращаем (то же правило, что в клетке и у
  // импорта): пока в поле дробная часть, подставлять нечего.
  const fractional = isAmountFractional(price) || isAmountFractional(stock)
  const canSubmit = (price !== "" || stock !== "") && !fractional

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose()
        }
      }}
    >
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>{t("priceStock.bulk.title")}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-6 overflow-y-auto">
          <Text size="small" className="text-ui-fg-subtle">
            {t("priceStock.bulk.description", { n: selectedCount })}
          </Text>
          {/* Строки вне экрана — списком: «Выделено: 2» одинаково выглядит и
              когда обе строки перед глазами, и когда их не видно вовсе
              (блокер Ф-прогона Данияра, 2026-09-02). */}
          {offscreenTitles.length > 0 && (
            <div className="flex flex-col gap-y-1">
              <Text size="small" weight="plus">
                {t("priceStock.bulk.offscreenTitle", {
                  n: offscreenTitles.length,
                })}
              </Text>
              {offscreenTitles.map((title) => (
                <Text key={title} size="small" className="text-ui-fg-subtle">
                  {title}
                </Text>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="price-stock-bulk-price">
              {t("priceStock.colPrice")}
            </Label>
            <Input
              id="price-stock-bulk-price"
              inputMode="numeric"
              autoComplete="off"
              placeholder={t("priceStock.bulk.keep")}
              value={price}
              onChange={(event) =>
                setPrice(sanitizeAmountInput(event.target.value))
              }
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="price-stock-bulk-stock">
              {t("priceStock.colStock")}
            </Label>
            <Input
              id="price-stock-bulk-stock"
              inputMode="numeric"
              autoComplete="off"
              placeholder={t("priceStock.bulk.keep")}
              value={stock}
              onChange={(event) =>
                setStock(sanitizeAmountInput(event.target.value))
              }
            />
            <Text size="small" className="text-ui-fg-subtle">
              {locationName
                ? t("priceStock.bulk.stockHint", { location: locationName })
                : t("priceStock.bulk.stockHintNoLocation")}
            </Text>
          </div>
          {fractional && (
            <Text size="small" className="text-ui-fg-error">
              {t("priceStock.fractional.hint")}
            </Text>
          )}
        </Drawer.Body>
        <Drawer.Footer>
          <Button size="small" variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            size="small"
            disabled={!canSubmit}
            onClick={() =>
              onSubmit({
                price: price === "" ? undefined : price,
                stock: stock === "" ? undefined : stock,
              })
            }
          >
            {t("priceStock.bulk.fill")}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export default PriceStockBulkDrawer
