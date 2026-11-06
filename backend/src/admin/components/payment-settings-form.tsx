import {
  Badge,
  Button,
  Input,
  Label,
  Select,
  Switch,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { formatDateTime } from "../lib/date"
import {
  AdminPaymentSettings,
  AdminPaymentSettingsResponse,
  errorText,
} from "../lib/payments"
import { sdk } from "../lib/sdk"

type Form = {
  kaspi_qr_enabled: boolean
  kaspi_mode: "mock" | "live"
  kaspi_merchant_id: string
  kaspi_api_key: string
  kaspi_webhook_secret: string
  kaspi_static_qr_url: string
  transfer_enabled: boolean
  transfer_phone: string
  transfer_recipient: string
  transfer_note: string
  debt_enabled: boolean
  debt_max_amount: string
  debt_term_days: string
}

const formFrom = (settings: AdminPaymentSettings): Form => ({
  kaspi_qr_enabled: settings.kaspi_qr_enabled,
  kaspi_mode: settings.kaspi_mode,
  kaspi_merchant_id: settings.kaspi_merchant_id ?? "",
  kaspi_api_key: "",
  kaspi_webhook_secret: "",
  kaspi_static_qr_url: settings.kaspi_static_qr_url ?? "",
  transfer_enabled: settings.transfer_enabled,
  transfer_phone: settings.transfer_phone ?? "",
  transfer_recipient: settings.transfer_recipient ?? "",
  transfer_note: settings.transfer_note ?? "",
  debt_enabled: settings.debt_enabled,
  debt_max_amount: settings.debt_max_amount != null ? String(settings.debt_max_amount) : "",
  debt_term_days: String(settings.debt_term_days),
})

type Props = {
  salesChannelId: string
  // Сотрудник площадки называет продавца явно; продавцу компании он не нужен.
  explicitSeller: boolean
  settings: AdminPaymentSettings
}

// Способы оплаты продавца: Kaspi QR (режим и ключи от Kaspi), перевод на номер
// Kaspi и «в долг» (лимит и срок). Ключи Kaspi экран не получает — поле
// показывает только, что ключ задан; пустое поле при сохранении ключ не трогает.
const PaymentSettingsForm = ({ salesChannelId, explicitSeller, settings }: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<Form>(formFrom(settings))

  useEffect(() => {
    setForm(formFrom(settings))
  }, [settings])

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const save = useMutation({
    mutationFn: () => {
      const maxAmount = form.debt_max_amount.replace(/\s+/g, "")
      return sdk.client.fetch<AdminPaymentSettingsResponse>("/admin/payment-settings", {
        method: "POST",
        body: {
          ...(explicitSeller ? { sales_channel_id: salesChannelId } : {}),
          kaspi_qr_enabled: form.kaspi_qr_enabled,
          kaspi_mode: form.kaspi_mode,
          kaspi_merchant_id: form.kaspi_merchant_id.trim() || null,
          ...(form.kaspi_api_key.trim() ? { kaspi_api_key: form.kaspi_api_key.trim() } : {}),
          ...(form.kaspi_webhook_secret.trim()
            ? { kaspi_webhook_secret: form.kaspi_webhook_secret.trim() }
            : {}),
          kaspi_static_qr_url: form.kaspi_static_qr_url.trim() || null,
          transfer_enabled: form.transfer_enabled,
          transfer_phone: form.transfer_phone.trim() || null,
          transfer_recipient: form.transfer_recipient.trim() || null,
          transfer_note: form.transfer_note.trim() || null,
          debt_enabled: form.debt_enabled,
          debt_max_amount: maxAmount ? Number(maxAmount) : null,
          debt_term_days: Number(form.debt_term_days) || 14,
        },
      })
    },
    onSuccess: () => {
      toast.success(t("payments.settings.saved"))
      return queryClient.invalidateQueries({ queryKey: ["payment-settings"] })
    },
    onError: (error: Error) => toast.error(errorText(error, t("payments.error"))),
  })

  const isStand = settings.platform_kaspi_mode === "mock"

  return (
    <div className="flex flex-col gap-y-6">
      <Block
        title={t("payments.settings.kaspiQr.title")}
        hint={t("payments.settings.kaspiQr.hint")}
        enabled={form.kaspi_qr_enabled}
        onToggle={(value) => set("kaspi_qr_enabled", value)}
        badge={
          <Badge
            size="2xsmall"
            color={
              settings.kaspi_static_active || settings.effective_kaspi_mode === "live"
                ? "green"
                : "orange"
            }
          >
            {settings.kaspi_static_active
              ? t("payments.settings.kaspiQr.static")
              : settings.effective_kaspi_mode === "live"
              ? t("payments.settings.kaspiQr.live")
              : t("payments.settings.kaspiQr.mock")}
          </Badge>
        }
      >
        <Field label={t("payments.settings.kaspiQr.staticUrl")}>
          <Input
            value={form.kaspi_static_qr_url}
            onChange={(event) => set("kaspi_static_qr_url", event.target.value)}
            placeholder="https://pay.kaspi.kz/…"
          />
          <Text size="xsmall" className="text-ui-fg-subtle">
            {t("payments.settings.kaspiQr.staticHint")}
          </Text>
        </Field>
        {isStand && !settings.kaspi_static_active && (
          <Text size="xsmall" className="text-ui-fg-subtle">
            {t("payments.settings.kaspiQr.standNote")}
          </Text>
        )}
        {/* Режим и ключи — подключение по API Kaspi (счёт на сумму заказа).
            QR магазина от них не зависит. */}
        <div className="flex flex-col gap-y-1">
          <Text size="small" weight="plus">
            {t("payments.settings.kaspiQr.apiTitle")}
          </Text>
          <Text size="xsmall" className="text-ui-fg-subtle">
            {form.kaspi_static_qr_url.trim()
              ? t("payments.settings.kaspiQr.apiHintStatic")
              : t("payments.settings.kaspiQr.apiHint")}
          </Text>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("payments.settings.kaspiQr.mode")}>
            <Select value={form.kaspi_mode} onValueChange={(value) => set("kaspi_mode", value as "mock" | "live")}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="mock">{t("payments.settings.kaspiQr.mock")}</Select.Item>
                <Select.Item value="live">{t("payments.settings.kaspiQr.live")}</Select.Item>
              </Select.Content>
            </Select>
          </Field>
          <Field label={t("payments.settings.kaspiQr.merchantId")}>
            <Input
              value={form.kaspi_merchant_id}
              onChange={(event) => set("kaspi_merchant_id", event.target.value)}
              placeholder={t("payments.settings.kaspiQr.merchantIdPlaceholder")}
            />
          </Field>
          <Field label={t("payments.settings.kaspiQr.apiKey")}>
            <Input
              type="password"
              autoComplete="new-password"
              value={form.kaspi_api_key}
              onChange={(event) => set("kaspi_api_key", event.target.value)}
              placeholder={
                settings.has_kaspi_api_key
                  ? t("payments.settings.secretSet")
                  : t("payments.settings.secretEmpty")
              }
            />
          </Field>
          <Field label={t("payments.settings.kaspiQr.webhookSecret")}>
            <Input
              type="password"
              autoComplete="new-password"
              value={form.kaspi_webhook_secret}
              onChange={(event) => set("kaspi_webhook_secret", event.target.value)}
              placeholder={
                settings.has_kaspi_webhook_secret
                  ? t("payments.settings.secretSet")
                  : t("payments.settings.secretOptional")
              }
            />
          </Field>
        </div>
      </Block>

      <Block
        title={t("payments.settings.transfer.title")}
        hint={t("payments.settings.transfer.hint")}
        enabled={form.transfer_enabled}
        onToggle={(value) => set("transfer_enabled", value)}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("payments.settings.transfer.phone")}>
            <Input
              inputMode="tel"
              value={form.transfer_phone}
              onChange={(event) => set("transfer_phone", event.target.value)}
              placeholder="+7 701 234 56 78"
            />
          </Field>
          <Field label={t("payments.settings.transfer.recipient")}>
            <Input
              value={form.transfer_recipient}
              onChange={(event) => set("transfer_recipient", event.target.value)}
              placeholder={t("payments.settings.transfer.recipientPlaceholder")}
            />
          </Field>
        </div>
        <Field label={t("payments.settings.transfer.note")}>
          <Textarea
            value={form.transfer_note}
            onChange={(event) => set("transfer_note", event.target.value)}
            placeholder={t("payments.settings.transfer.notePlaceholder")}
          />
        </Field>
      </Block>

      <Block
        title={t("payments.settings.debt.title")}
        hint={t("payments.settings.debt.hint")}
        enabled={form.debt_enabled}
        onToggle={(value) => set("debt_enabled", value)}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label={t("payments.settings.debt.maxAmount")}>
            <Input
              inputMode="numeric"
              value={form.debt_max_amount}
              onChange={(event) => set("debt_max_amount", event.target.value)}
              placeholder={t("payments.settings.debt.maxAmountPlaceholder")}
            />
          </Field>
          <Field label={t("payments.settings.debt.termDays")}>
            <Input
              inputMode="numeric"
              value={form.debt_term_days}
              onChange={(event) => set("debt_term_days", event.target.value)}
            />
          </Field>
        </div>
      </Block>

      <div className="flex items-center justify-between gap-3">
        <Text size="xsmall" className="text-ui-fg-subtle">
          {settings.updated_at
            ? t("payments.settings.updatedAt", { date: formatDateTime(settings.updated_at) })
            : t("payments.settings.defaults")}
        </Text>
        <Button size="small" isLoading={save.isPending} onClick={() => save.mutate()}>
          {t("common.save")}
        </Button>
      </div>
    </div>
  )
}

const Block = ({
  title,
  hint,
  enabled,
  onToggle,
  badge,
  children,
}: {
  title: string
  hint: string
  enabled: boolean
  onToggle: (value: boolean) => void
  badge?: React.ReactNode
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-y-4 rounded-lg border border-ui-border-base p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-2">
          <Text size="small" weight="plus">
            {title}
          </Text>
          {badge}
        </div>
        <Text size="xsmall" className="text-ui-fg-subtle">
          {hint}
        </Text>
      </div>
      <Switch checked={enabled} onCheckedChange={onToggle} />
    </div>
    {enabled && children}
  </div>
)

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-y-2">
    <Label>{label}</Label>
    {children}
  </div>
)

export default PaymentSettingsForm
