import { Button, Drawer, Input, Label, Text, Textarea, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { AdminScorecard, AdminScorecardResponse } from "../lib/scoring"
import { sdk } from "../lib/sdk"

type CreditLimitDrawerProps = {
  companyId: string
  scorecard: AdminScorecard | null
  open: boolean
  onClose: () => void
}

// Drawer ручной корректировки лимита отсрочки компании. Пустое поле лимита =
// сброс (null → действует вычисленный). Сохранение — POST
// /admin/companies/:id/scorecard/limit.
const CreditLimitDrawer = ({
  companyId,
  scorecard,
  open,
  onClose,
}: CreditLimitDrawerProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [limit, setLimit] = useState("")
  const [note, setNote] = useState("")

  useEffect(() => {
    if (open) {
      setLimit(scorecard?.manual_limit != null ? String(scorecard.manual_limit) : "")
      setNote("")
    }
  }, [open, scorecard])

  const saveMutation = useMutation({
    mutationFn: (body: { manual_limit: number | null; note?: string }) =>
      sdk.client.fetch<AdminScorecardResponse>(
        `/admin/companies/${companyId}/scorecard/limit`,
        { method: "POST", body }
      ),
    onSuccess: () => {
      toast.success(t("companies.creditLimit.toast"))
      queryClient.invalidateQueries({ queryKey: ["company-scorecard", companyId] })
      onClose()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const trimmed = limit.trim()
  const parsed = Number(trimmed)
  const limitValid =
    trimmed === "" || (Number.isFinite(parsed) && parsed >= 0)

  const save = () =>
    saveMutation.mutate({
      manual_limit: trimmed === "" ? null : parsed,
      ...(note.trim() ? { note: note.trim() } : {}),
    })

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>{t("companies.creditLimit.title")}</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="manual-limit">
              {t("companies.creditLimit.limitLabel")}
            </Label>
            <Input
              id="manual-limit"
              type="number"
              min={0}
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              placeholder={t("companies.creditLimit.limitPlaceholder")}
            />
            <Text size="small" className="text-ui-fg-subtle">
              {t("companies.creditLimit.limitHint")}
            </Text>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="manual-limit-note">
              {t("companies.creditLimit.noteLabel")}
            </Label>
            <Textarea
              id="manual-limit-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
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
            disabled={!limitValid}
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

export default CreditLimitDrawer
