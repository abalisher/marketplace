import { Button, Drawer, Input, Label, Text, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  AdminScoringConfig,
  AdminScoringConfigResponse,
  SCORING_CONFIG_FIELDS,
} from "../lib/scoring"
import { sdk } from "../lib/sdk"

type ScoringConfigDrawerProps = {
  config: AdminScoringConfig
  open: boolean
  onClose: () => void
}

type FormState = Record<string, string>

const toFormState = (config: AdminScoringConfig): FormState =>
  Object.fromEntries(
    SCORING_CONFIG_FIELDS.map(({ key }) => [key, String(config[key])])
  )

// Drawer правки настраиваемых правил скоринга — идиома bonus-config-drawer.
// Все поля числовые, неотрицательные; сохранение — POST /admin/scoring-config.
const ScoringConfigDrawer = ({
  config,
  open,
  onClose,
}: ScoringConfigDrawerProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(() => toFormState(config))

  useEffect(() => {
    if (open) {
      setForm(toFormState(config))
    }
  }, [open, config])

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, number>) =>
      sdk.client.fetch<AdminScoringConfigResponse>("/admin/scoring-config", {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      toast.success(t("scoring.toast.saved"))
      queryClient.invalidateQueries({ queryKey: ["scoring-config"] })
      onClose()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const setField = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const isValid = (value: string) => {
    const n = Number(value)
    return value.trim() !== "" && Number.isFinite(n) && n >= 0
  }
  const canSave = SCORING_CONFIG_FIELDS.every(({ key }) => isValid(form[key]))

  const save = () => {
    const body = Object.fromEntries(
      SCORING_CONFIG_FIELDS.map(({ key }) => [key, Number(form[key])])
    )
    saveMutation.mutate(body)
  }

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>{t("scoring.drawer.title")}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
          {SCORING_CONFIG_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-y-2">
              <Label htmlFor={`scoring-${key}`}>{t(label)}</Label>
              <Input
                id={`scoring-${key}`}
                type="number"
                min={0}
                value={form[key] ?? ""}
                onChange={(e) => setField(key, e.target.value)}
              />
            </div>
          ))}
          <Text size="small" className="text-ui-fg-subtle">
            {t("scoring.drawer.hint")}
          </Text>
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

export default ScoringConfigDrawer
