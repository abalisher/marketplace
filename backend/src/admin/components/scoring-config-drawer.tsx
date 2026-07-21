import { Button, Drawer, Input, Label, Text, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
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
      toast.success("Scoring rules updated")
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
          <Drawer.Title>Edit scoring rules</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
          {SCORING_CONFIG_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex flex-col gap-y-2">
              <Label htmlFor={`scoring-${key}`}>{label}</Label>
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
            Score is a weighted sum of order count, volume and tenure minus a
            per-return penalty (capped 0–100). The deferral limit is derived
            from the score above the threshold.
          </Text>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button size="small" variant="secondary">
              Cancel
            </Button>
          </Drawer.Close>
          <Button
            size="small"
            disabled={!canSave}
            isLoading={saveMutation.isPending}
            onClick={save}
          >
            Save
          </Button>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

export default ScoringConfigDrawer
