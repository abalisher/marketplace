import { Button, Drawer, Input, Label, Text, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  AdminBonusConfig,
  AdminBonusConfigResponse,
  BONUS_SEGMENT_KEYS,
} from "../lib/bonus"
import { sdk } from "../lib/sdk"

type BonusConfigDrawerProps = {
  config: AdminBonusConfig
  open: boolean
  onClose: () => void
}

// Поля формы — строками (пустая строка = «не задано» у необязательных),
// парсинг и валидация — при сохранении.
type FormState = {
  accrual_percent: string
  segments: Record<string, string>
  max_spend_percent: string
  expiry_days: string
  expiry_notice_days: string
  return_window_days: string
}

const toFormState = (config: AdminBonusConfig): FormState => ({
  accrual_percent: String(config.accrual_percent),
  segments: Object.fromEntries(
    BONUS_SEGMENT_KEYS.map((key) => [
      key,
      config.segment_percents?.[key] != null
        ? String(config.segment_percents[key])
        : "",
    ])
  ),
  max_spend_percent: String(config.max_spend_percent),
  expiry_days: config.expiry_days != null ? String(config.expiry_days) : "",
  expiry_notice_days: String(config.expiry_notice_days),
  return_window_days: String(config.return_window_days),
})

const isPercent = (value: string) => {
  const parsed = Number(value)
  return value.trim() !== "" && Number.isFinite(parsed) && parsed >= 0 && parsed <= 100
}

const isDays = (value: string, min: number) => {
  const parsed = Number(value)
  return value.trim() !== "" && Number.isInteger(parsed) && parsed >= min
}

// Drawer правки настроек бонусной программы — идиома форм редактирования
// секций ядра (как product-card-drawer). Сохранение — POST /admin/bonus-config.
const BonusConfigDrawer = ({ config, open, onClose }: BonusConfigDrawerProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(() => toFormState(config))

  // Форма заполняется текущими значениями при каждом открытии.
  useEffect(() => {
    if (open) {
      setForm(toFormState(config))
    }
  }, [open, config])

  const saveMutation = useMutation({
    mutationFn: (body: {
      accrual_percent: number
      segment_percents: Record<string, number> | null
      max_spend_percent: number
      expiry_days: number | null
      expiry_notice_days: number
      return_window_days: number
    }) =>
      sdk.client.fetch<AdminBonusConfigResponse>("/admin/bonus-config", {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      toast.success(t("bonus.toast.saved"))
      queryClient.invalidateQueries({ queryKey: ["bonus-config"] })
      onClose()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const setField = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }))
  const setSegment = (key: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      segments: { ...prev.segments, [key]: value },
    }))

  const canSave =
    isPercent(form.accrual_percent) &&
    isPercent(form.max_spend_percent) &&
    Object.values(form.segments).every(
      (value) => value.trim() === "" || isPercent(value)
    ) &&
    (form.expiry_days.trim() === "" || isDays(form.expiry_days, 1)) &&
    isDays(form.expiry_notice_days, 0) &&
    isDays(form.return_window_days, 0)

  const save = () => {
    const segmentEntries = Object.entries(form.segments)
      .filter(([, value]) => value.trim() !== "")
      .map(([key, value]) => [key, Number(value)] as const)
    saveMutation.mutate({
      accrual_percent: Number(form.accrual_percent),
      segment_percents: segmentEntries.length
        ? Object.fromEntries(segmentEntries)
        : null,
      max_spend_percent: Number(form.max_spend_percent),
      expiry_days:
        form.expiry_days.trim() === "" ? null : Number(form.expiry_days),
      expiry_notice_days: Number(form.expiry_notice_days),
      return_window_days: Number(form.return_window_days),
    })
  }

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
          <Drawer.Title>{t("bonus.drawer.title")}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-6 overflow-y-auto">
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="bonus-accrual-percent">
              {t("bonus.drawer.accrualPercent")}
            </Label>
            <Input
              id="bonus-accrual-percent"
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={form.accrual_percent}
              onChange={(event) =>
                setField({ accrual_percent: event.target.value })
              }
            />
            <Text size="small" className="text-ui-fg-subtle">
              {t("bonus.drawer.accrualHint")}
            </Text>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>{t("bonus.drawer.segmentOverrides")}</Label>
            {BONUS_SEGMENT_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-x-2">
                <Text size="small" className="w-24">
                  {t(`bonus.segment.${key}`)}
                </Text>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={form.segments[key] ?? ""}
                  onChange={(event) => setSegment(key, event.target.value)}
                  placeholder={t("bonus.drawer.platformDefault")}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="bonus-max-spend">{t("bonus.drawer.maxSpend")}</Label>
            <Input
              id="bonus-max-spend"
              type="number"
              min={0}
              max={100}
              step={1}
              value={form.max_spend_percent}
              onChange={(event) =>
                setField({ max_spend_percent: event.target.value })
              }
            />
            <Text size="small" className="text-ui-fg-subtle">
              {t("bonus.drawer.maxSpendHint")}
            </Text>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="bonus-expiry-days">
              {t("bonus.drawer.expiryDays")}
            </Label>
            <Input
              id="bonus-expiry-days"
              type="number"
              min={1}
              step={1}
              value={form.expiry_days}
              onChange={(event) => setField({ expiry_days: event.target.value })}
              placeholder={t("bonus.program.disabled")}
            />
            <Text size="small" className="text-ui-fg-subtle">
              {t("bonus.drawer.expiryHint")}
            </Text>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="bonus-expiry-notice-days">
              {t("bonus.drawer.expiryNoticeDays")}
            </Label>
            <Input
              id="bonus-expiry-notice-days"
              type="number"
              min={0}
              step={1}
              value={form.expiry_notice_days}
              onChange={(event) =>
                setField({ expiry_notice_days: event.target.value })
              }
            />
            <Text size="small" className="text-ui-fg-subtle">
              {t("bonus.drawer.expiryNoticeHint")}
            </Text>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="bonus-return-window-days">
              {t("bonus.drawer.returnWindowDays")}
            </Label>
            <Input
              id="bonus-return-window-days"
              type="number"
              min={0}
              step={1}
              value={form.return_window_days}
              onChange={(event) =>
                setField({ return_window_days: event.target.value })
              }
            />
            <Text size="small" className="text-ui-fg-subtle">
              {t("bonus.drawer.returnWindowHint")}
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
            disabled={!canSave}
            isLoading={saveMutation.isPending}
            onClick={save}
          >
            {t("common.save")}
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export default BonusConfigDrawer
