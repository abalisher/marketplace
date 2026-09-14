import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Badge, Container, Heading, Text } from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { AdminPhoneOtpCodesResponse } from "../../../lib/login-codes"
import { formatDateTime } from "../../../lib/date"
import { formatPhone } from "../../../lib/phone"
import { routeLabel } from "../../../lib/route-label"
import { sdk } from "../../../lib/sdk"

// Страница «Коды входа» (Settings) — dev-канал доставки кода покупателю
// (T10.7). SMS-провайдера на MVP нет, поэтому на стенде код входа видно здесь:
// покупатель называет номер, оператор диктует код. С выключенным dev-каналом
// (production) страница честно говорит, что канала нет.
const LoginCodesPage = () => {
  const { t } = useTranslation()

  const { data, isLoading } = useQuery({
    queryKey: ["phone-otp-codes"],
    queryFn: () =>
      sdk.client.fetch<AdminPhoneOtpCodesResponse>("/admin/phone-otp-codes"),
    // Код живёт минуты — держим список свежим, пока страница открыта.
    refetchInterval: 5000,
  })

  const codes = data?.codes ?? []

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading>{t("loginCodes.title")}</Heading>
        <Text className="text-ui-fg-subtle" size="small">
          {t("loginCodes.subtitle")}
        </Text>
      </div>

      {isLoading && (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {t("common.loading")}
          </Text>
        </div>
      )}

      {!isLoading && data?.dev_channel === false && (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {t("loginCodes.disabled")}
          </Text>
        </div>
      )}

      {!isLoading && data?.dev_channel && codes.length === 0 && (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {t("loginCodes.empty")}
          </Text>
        </div>
      )}

      {codes.map((entry) => (
        <div
          key={`${entry.phone}-${entry.expires_at}`}
          className="flex items-center justify-between gap-4 px-6 py-4"
        >
          <div>
            <Text size="small" weight="plus" leading="compact">
              {formatPhone(entry.phone)}
            </Text>
            <Text size="small" className="text-ui-fg-subtle" leading="compact">
              {t("loginCodes.requestedAt")}:{" "}
              {entry.requested_at
                ? formatDateTime(entry.requested_at)
                : t("common.unknownValue")}
            </Text>
          </div>
          <div className="flex items-center gap-3">
            {entry.attempts > 0 && (
              <Badge size="2xsmall" color="orange">
                {t("loginCodes.attempts", { count: entry.attempts })}
              </Badge>
            )}
            <Text size="large" weight="plus" className="tabular-nums">
              {entry.code}
            </Text>
          </div>
        </div>
      ))}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Login Codes", ru: "Коды входа" }),
})

export default LoginCodesPage
