import {
  Button,
  Drawer,
  Input,
  Label,
  Select,
  Switch,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  AdminMaterialNorm,
  AdminMaterialNormResponse,
  NORM_BASES,
  NORM_BASE_LABELS,
  NormBase,
} from "../lib/estimator"
import { sdk } from "../lib/sdk"

type MaterialNormDrawerProps = {
  norm: AdminMaterialNorm | null // null → создание
  open: boolean
  onClose: () => void
}

type FormState = {
  code: string
  name: string
  work_type: string
  material_kind: string
  base: NormBase
  consumption_per_unit: string
  unit: string
  category_id: string
  active: boolean
  note: string
}

const emptyForm: FormState = {
  code: "",
  name: "",
  work_type: "",
  material_kind: "",
  base: "area",
  consumption_per_unit: "",
  unit: "",
  category_id: "",
  active: true,
  note: "",
}

const toForm = (norm: AdminMaterialNorm | null): FormState =>
  norm
    ? {
        code: norm.code,
        name: norm.name,
        work_type: norm.work_type,
        material_kind: norm.material_kind,
        base: norm.base,
        consumption_per_unit: String(norm.consumption_per_unit),
        unit: norm.unit,
        category_id: norm.category_id ?? "",
        active: norm.active,
        note: norm.note ?? "",
      }
    : { ...emptyForm }

type CategoriesResponse = {
  product_categories: { id: string; name: string }[]
}

// Drawer создания/правки норматива расхода (справочник ТЗ 7). Категория — из
// списка категорий каталога (для подборки товаров). Сохранение — upsert по code
// (POST /admin/material-norms), при правке code не меняется.
const MaterialNormDrawer = ({ norm, open, onClose }: MaterialNormDrawerProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(() => toForm(norm))

  useEffect(() => {
    if (open) {
      setForm(toForm(norm))
    }
  }, [open, norm])

  const { data: categoriesData } = useQuery({
    queryKey: ["product-categories", "for-norms"],
    queryFn: () =>
      sdk.client.fetch<CategoriesResponse>("/admin/product-categories", {
        query: { limit: 200, fields: "id,name" },
      }),
    enabled: open,
  })
  const categories = categoriesData?.product_categories ?? []

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      sdk.client.fetch<AdminMaterialNormResponse>("/admin/material-norms", {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      toast.success(t("estimator.toast.saved"))
      queryClient.invalidateQueries({ queryKey: ["material-norms"] })
      onClose()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const set = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }))

  const consumption = Number(form.consumption_per_unit)
  const canSave =
    form.code.trim() !== "" &&
    form.name.trim() !== "" &&
    form.work_type.trim() !== "" &&
    form.material_kind.trim() !== "" &&
    form.unit.trim() !== "" &&
    Number.isFinite(consumption) &&
    consumption > 0

  const save = () =>
    saveMutation.mutate({
      code: form.code.trim(),
      name: form.name.trim(),
      work_type: form.work_type.trim(),
      material_kind: form.material_kind.trim(),
      base: form.base,
      consumption_per_unit: consumption,
      unit: form.unit.trim(),
      category_id: form.category_id ? form.category_id : null,
      active: form.active,
      note: form.note.trim() ? form.note.trim() : null,
    })

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>
            {t(norm ? "estimator.drawer.editTitle" : "estimator.drawer.createTitle")}
          </Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="norm-code">{t("estimator.drawer.code")}</Label>
            <Input
              id="norm-code"
              value={form.code}
              disabled={!!norm}
              onChange={(e) => set({ code: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="norm-name">{t("estimator.drawer.name")}</Label>
            <Input
              id="norm-name"
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="norm-work-type">
              {t("estimator.drawer.workType")}
            </Label>
            <Input
              id="norm-work-type"
              value={form.work_type}
              onChange={(e) => set({ work_type: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="norm-material">
              {t("estimator.drawer.materialKind")}
            </Label>
            <Input
              id="norm-material"
              value={form.material_kind}
              onChange={(e) => set({ material_kind: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>{t("estimator.drawer.base")}</Label>
            <Select
              value={form.base}
              onValueChange={(v) => set({ base: v as NormBase })}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                {NORM_BASES.map((b) => (
                  <Select.Item key={b} value={b}>
                    {t(NORM_BASE_LABELS[b])}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="norm-consumption">
              {t("estimator.drawer.consumption")}
            </Label>
            <Input
              id="norm-consumption"
              type="number"
              min={0}
              step="any"
              value={form.consumption_per_unit}
              onChange={(e) => set({ consumption_per_unit: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="norm-unit">{t("estimator.drawer.materialUnit")}</Label>
            <Input
              id="norm-unit"
              value={form.unit}
              onChange={(e) => set({ unit: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label>{t("estimator.drawer.category")}</Label>
            <Select
              value={form.category_id}
              onValueChange={(v) => set({ category_id: v })}
            >
              <Select.Trigger>
                <Select.Value placeholder={t("estimator.drawer.categoryNone")} />
              </Select.Trigger>
              <Select.Content>
                {categories.map((c) => (
                  <Select.Item key={c.id} value={c.id}>
                    {c.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          <div className="flex items-center gap-x-2">
            <Switch
              id="norm-active"
              checked={form.active}
              onCheckedChange={(v) => set({ active: v })}
            />
            <Label htmlFor="norm-active">{t("estimator.drawer.active")}</Label>
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="norm-note">{t("estimator.drawer.note")}</Label>
            <Input
              id="norm-note"
              value={form.note}
              onChange={(e) => set({ note: e.target.value })}
            />
          </div>
          <Text size="small" className="text-ui-fg-subtle">
            {t("estimator.drawer.hint")}
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

export default MaterialNormDrawer
