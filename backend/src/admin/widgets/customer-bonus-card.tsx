import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { AdminCustomer, DetailWidgetProps } from "@medusajs/framework/types"
import { Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import {
  AdminCustomerBonusResponse,
  BONUS_TRANSACTION_META,
  formatBonusAmount,
} from "../lib/bonus"
import { formatDateTime } from "../lib/date"
import { sdk } from "../lib/sdk"

// Widget бонусного счёта на ядровой странице покупателя: баланс + последние
// операции леджера. Данные — своим запросом (GET /admin/customers/:id/bonus):
// prop `data` ядра полей link'а не содержит. Счёт создаётся лениво при первом
// начислении — до него показываем нулевой баланс.
const CustomerBonusCardWidget = ({
  data,
}: DetailWidgetProps<AdminCustomer>) => {
  const { t } = useTranslation()
  const { data: detail, isLoading } = useQuery({
    queryKey: ["customer-bonus", data.id],
    queryFn: () =>
      sdk.client.fetch<AdminCustomerBonusResponse>(
        `/admin/customers/${data.id}/bonus`
      ),
  })

  const bonus = detail?.bonus ?? null
  const transactions = bonus?.transactions ?? []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("bonus.account.title")}</Heading>
      </div>

      <div className="text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4">
        <Text size="small" weight="plus" leading="compact">
          {t("bonus.account.balance")}
        </Text>
        <Text size="small" leading="compact">
          {isLoading || !bonus
            ? "—"
            : formatBonusAmount(bonus.balance, bonus.currency_code)}
        </Text>
      </div>

      {bonus && !bonus.account_id ? (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {t("bonus.account.empty")}
          </Text>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="px-6 py-4">
            <Text size="small" weight="plus" className="text-ui-fg-subtle">
              {t("bonus.account.recent")}
            </Text>
          </div>
          {transactions.length ? (
            <ul className="flex flex-col">
              {transactions.map((tx) => {
                const meta = BONUS_TRANSACTION_META[tx.type]
                return (
                  <li
                    key={tx.id}
                    className="flex flex-col gap-y-1 border-t px-6 py-3"
                  >
                    <div className="flex items-center gap-x-2">
                      <Text size="small" weight="plus">
                        {t(meta.label)}
                      </Text>
                      <Text
                        size="small"
                        className={
                          meta.direction > 0
                            ? "text-ui-tag-green-text"
                            : "text-ui-fg-muted"
                        }
                      >
                        {meta.direction > 0 ? "+" : "−"}
                        {formatBonusAmount(
                          tx.amount,
                          bonus?.currency_code ?? "kzt"
                        )}
                      </Text>
                      <Text size="small" className="text-ui-fg-muted">
                        {formatDateTime(tx.created_at)}
                      </Text>
                    </div>
                    {(tx.expires_at || tx.note) && (
                      <Text size="small" className="text-ui-fg-subtle">
                        {tx.expires_at
                          ? t("bonus.account.expires", {
                              date: formatDateTime(tx.expires_at),
                            })
                          : ""}
                        {tx.expires_at && tx.note ? " · " : ""}
                        {tx.note ?? ""}
                      </Text>
                    )}
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="border-t px-6 py-4">
              <Text size="small" className="text-ui-fg-subtle">
                {t("bonus.account.noTransactions")}
              </Text>
            </div>
          )}
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "customer.details.after",
})

export default CustomerBonusCardWidget
