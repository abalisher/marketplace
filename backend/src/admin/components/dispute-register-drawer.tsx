import {
  Badge,
  Button,
  Drawer,
  Input,
  Label,
  Select,
  Text,
  Textarea,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useReviews } from "../hooks/use-reviews"
import { formatDate } from "../lib/date"
import { formatAmount } from "../lib/money"
import {
  AdminOrderLifecycleRowOrder,
  AdminOrderLifecyclesResponse,
} from "../lib/order"
import {
  DISPUTE_CATEGORY_META,
  DisputeCategory,
  disputeCategoryMeta,
} from "../lib/reviews"
import { sdk } from "../lib/sdk"

type DisputeRegisterDrawerProps = {
  open: boolean
  onClose: () => void
}

// Минимум букв в описании — как у ассистента (lib/assistant/tools/open-dispute):
// «брак» без подробностей не даёт следующему оператору ничего. Правило дублирует
// бэкенд (валидатор роута), здесь оно только гасит кнопку.
const MIN_DESCRIPTION = 10

const CATEGORIES = Object.keys(DISPUTE_CATEGORY_META) as DisputeCategory[]

// Регистрация претензии по звонку (T4.11, блокер 3 Ф-прогона 2026-08-18:
// «покупатель звонит и жалуется — записать его обращение мне некуда. Придётся
// вести на бумаге, и потом это никак не свяжется с заказом»).
//
// Канал покупателя один — чат с ассистентом (DECISIONS 2026-08-17), но звонок и
// самовывоз проходят мимо него. Заказ оператор находит поиском (номер или почта),
// покупателя вычисляет бэкенд из самого заказа: спрашивать его у оператора
// незачем, а ошибиться — легко.
const DisputeRegisterDrawer = ({
  open,
  onClose,
}: DisputeRegisterDrawerProps) => {
  const { t } = useTranslation()
  const { registerDispute } = useReviews()

  const [search, setSearch] = useState("")
  const [order, setOrder] = useState<AdminOrderLifecycleRowOrder | null>(null)
  const [category, setCategory] = useState<DisputeCategory | "">("")
  const [description, setDescription] = useState("")

  // Закрыли drawer — сбрасываем черновик: следующая претензия начинается с
  // чистого листа, а не с чужого заказа в поле.
  useEffect(() => {
    if (!open) {
      setSearch("")
      setOrder(null)
      setCategory("")
      setDescription("")
    }
  }, [open])

  const q = search.trim()
  const { data, isFetching } = useQuery({
    queryKey: ["dispute-order-search", q],
    queryFn: () =>
      sdk.client.fetch<AdminOrderLifecyclesResponse>(
        "/admin/order-lifecycles",
        { query: { q, limit: 8, order: "-created_at" } }
      ),
    enabled: open && !order && q.length > 0,
  })

  const results = (data?.order_lifecycles ?? [])
    .map((row) => row.order)
    .filter((row): row is AdminOrderLifecycleRowOrder => !!row)

  const canSubmit =
    !!order &&
    category !== "" &&
    description.trim().length >= MIN_DESCRIPTION &&
    !registerDispute.isPending

  const submit = () => {
    // Сужение типа категории даёт canSubmit (в нём проверка на пустое значение).
    if (!canSubmit || !order) {
      return
    }
    registerDispute.mutate(
      {
        order_id: order.id,
        category,
        description: description.trim(),
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>{t("reviews.register.title")}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-6 overflow-y-auto">
          <Text size="small" className="text-ui-fg-subtle">
            {t("reviews.register.hint")}
          </Text>

          <div className="flex flex-col gap-y-2">
            <Label htmlFor="dispute-order-search" size="small">
              {t("reviews.register.order")}
            </Label>
            {order ? (
              <div className="flex items-center justify-between gap-x-3 rounded-md border px-3 py-2">
                <div className="flex min-w-0 flex-col">
                  <Text size="small">
                    {[
                      order.display_id != null
                        ? t("orderQueue.orderNo", { id: order.display_id })
                        : null,
                      order.customer_name,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-subtle">
                    {[
                      order.total != null
                        ? formatAmount(order.total, order.currency_code)
                        : null,
                      order.created_at ? formatDate(order.created_at) : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </div>
                <Button
                  size="small"
                  variant="transparent"
                  onClick={() => setOrder(null)}
                >
                  {t("reviews.register.change")}
                </Button>
              </div>
            ) : (
              <>
                <Input
                  id="dispute-order-search"
                  autoFocus
                  placeholder={t("reviews.register.searchPlaceholder")}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <div className="max-h-[240px] overflow-auto">
                  {q === "" ? null : isFetching ? (
                    <Text
                      size="small"
                      className="text-ui-fg-subtle px-2 py-1.5"
                    >
                      {t("common.loading")}
                    </Text>
                  ) : results.length === 0 ? (
                    <Text
                      size="small"
                      className="text-ui-fg-subtle px-2 py-1.5"
                    >
                      {t("reviews.register.searchEmpty")}
                    </Text>
                  ) : (
                    results.map((row) => (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => setOrder(row)}
                        className="hover:bg-ui-bg-base-hover flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left"
                      >
                        <span className="flex items-center gap-x-2">
                          <Text size="small">
                            {row.display_id != null
                              ? t("orderQueue.orderNo", {
                                  id: row.display_id,
                                })
                              : t("common.unknownValue")}
                          </Text>
                          {row.is_company && (
                            <Badge size="2xsmall" color="blue">
                              {t("orderQueue.companyBadge")}
                            </Badge>
                          )}
                        </span>
                        <Text size="xsmall" className="text-ui-fg-subtle">
                          {[
                            row.customer_name,
                            row.total != null
                              ? formatAmount(row.total, row.currency_code)
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </Text>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col gap-y-2">
            <Label htmlFor="dispute-category" size="small">
              {t("reviews.register.category")}
            </Label>
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as DisputeCategory)}
            >
              <Select.Trigger id="dispute-category">
                <Select.Value
                  placeholder={t("reviews.register.categoryPlaceholder")}
                />
              </Select.Trigger>
              <Select.Content>
                {CATEGORIES.map((value) => (
                  <Select.Item key={value} value={value}>
                    {t(disputeCategoryMeta(value).label)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          <div className="flex flex-col gap-y-2">
            <Label htmlFor="dispute-description" size="small">
              {t("reviews.register.description")}
            </Label>
            <Textarea
              id="dispute-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={t("reviews.register.descriptionPlaceholder")}
            />
            <Text size="xsmall" className="text-ui-fg-muted">
              {t("reviews.register.descriptionHint")}
            </Text>
          </div>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button size="small" variant="secondary">
              {t("common.cancel")}
            </Button>
          </Drawer.Close>
          <Button
            size="small"
            disabled={!canSubmit}
            isLoading={registerDispute.isPending}
            onClick={submit}
          >
            {t("reviews.register.submit")}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export default DisputeRegisterDrawer
