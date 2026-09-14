import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Button, Container, Heading, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { DataTableListError } from "../../../components/data-table-list-error"
import { formatDateTime } from "../../../lib/date"
import {
  AdminKaspiMockPayResponse,
  AdminKaspiMockPaymentsResponse,
} from "../../../lib/kaspi-payments"
import { formatAmount } from "../../../lib/money"
import { formatPhone } from "../../../lib/phone"
import { routeLabel } from "../../../lib/route-label"
import { sdk } from "../../../lib/sdk"

// Страница «Оплата Kaspi» (Settings) — dev-канал подтверждения оплаты на стенде
// (T12.23). Публичной песочницы Kaspi нет, а мок задаёт исход только при
// создании инвойса: без этого экрана «покупатель оплатил» приходилось звать
// командой на сервере (`npm run kaspi:pay`). Здесь то же самое кнопкой — счета
// видно списком, оператор жмёт нужный. В live-режиме экран честно говорит, что
// подтверждать оплату из панели нельзя.
const KaspiPaymentsPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["kaspi-mock-payments"],
    queryFn: () =>
      sdk.client.fetch<AdminKaspiMockPaymentsResponse>(
        "/admin/kaspi-mock-payments"
      ),
    // Счёт появляется в момент, когда покупатель дошёл до оплаты в чате, —
    // держим список свежим, пока страница открыта.
    refetchInterval: 5000,
  })

  // Без id — «оплатить самый свежий счёт», ровно как `npm run kaspi:pay` без
  // аргумента: на показе это один клик, не глядя в список.
  const payMutation = useMutation({
    mutationFn: (paymentSessionId?: string) =>
      sdk.client.fetch<AdminKaspiMockPayResponse>("/admin/kaspi-mock-payments", {
        method: "POST",
        body: paymentSessionId ? { payment_session_id: paymentSessionId } : {},
      }),
    onSuccess: (response) => {
      toast.success(
        t("kaspiPayments.toast.paid", {
          state: response.payment.kaspi_state ?? response.payment.status,
        })
      )
      queryClient.invalidateQueries({ queryKey: ["kaspi-mock-payments"] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const payments = data?.payments ?? []

  return (
    <Container className="divide-y p-0">
      <div className="flex items-start justify-between gap-4 px-6 py-4">
        <div>
          <Heading>{t("kaspiPayments.title")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("kaspiPayments.subtitle")}
          </Text>
        </div>
        <Button
          size="small"
          // Идиома data-sm-action: кадры гейта U жмут кнопку селектором, не
          // зависящим от языка подписи.
          data-sm-action="kaspi-pay-latest"
          isLoading={payMutation.isPending && !payMutation.variables}
          disabled={payMutation.isPending || payments.length === 0}
          onClick={() => payMutation.mutate(undefined)}
        >
          {t("kaspiPayments.action.payLatest")}
        </Button>
      </div>

      {isLoading && (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {t("common.loading")}
          </Text>
        </div>
      )}

      {!isLoading && isError && (
        <DataTableListError
          message={t("kaspiPayments.error")}
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && data?.mock_mode === false && (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {t("kaspiPayments.disabled")}
          </Text>
        </div>
      )}

      {!isLoading && !isError && data?.mock_mode && payments.length === 0 && (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {t("kaspiPayments.empty")}
          </Text>
        </div>
      )}

      {payments.map((payment) => (
        <div
          key={payment.payment_session_id}
          className="flex items-center justify-between gap-4 px-6 py-4"
        >
          <div>
            <Text size="small" weight="plus" leading="compact">
              {payment.customer_name ??
                (payment.customer_phone
                  ? formatPhone(payment.customer_phone)
                  : t("kaspiPayments.guest"))}
            </Text>
            <Text size="small" className="text-ui-fg-subtle" leading="compact">
              {payment.customer_name && payment.customer_phone
                ? `${formatPhone(payment.customer_phone)} · `
                : ""}
              {payment.created_at
                ? formatDateTime(payment.created_at)
                : t("common.unknownValue")}
            </Text>
          </div>
          <div className="flex items-center gap-3">
            {payment.cart_completed && (
              <Badge size="2xsmall" color="orange">
                {t("kaspiPayments.cartCompleted")}
              </Badge>
            )}
            <Text size="small" weight="plus" className="tabular-nums">
              {formatAmount(payment.amount, payment.currency_code)}
            </Text>
            <Button
              size="small"
              variant="secondary"
              data-sm-action="kaspi-pay"
              isLoading={
                payMutation.isPending &&
                payMutation.variables === payment.payment_session_id
              }
              disabled={payMutation.isPending}
              onClick={() => payMutation.mutate(payment.payment_session_id)}
            >
              {t("kaspiPayments.action.pay")}
            </Button>
          </div>
        </div>
      ))}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Kaspi Payments", ru: "Оплата Kaspi" }),
})

export default KaspiPaymentsPage
