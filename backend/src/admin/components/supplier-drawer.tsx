import { Button, Drawer, Input, Label, Switch, Text, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  AdminSupplier,
  AdminSupplierResponse,
} from "../lib/procurement"
import { sdk } from "../lib/sdk"

type SupplierDrawerProps = {
  supplier: AdminSupplier | null // null → создание
  open: boolean
  onClose: () => void
}

type FormState = {
  name: string
  bin: string
  contact_phone: string
  contact_email: string
  note: string
  active: boolean
}

const emptyForm: FormState = {
  name: "",
  bin: "",
  contact_phone: "",
  contact_email: "",
  note: "",
  active: true,
}

const toForm = (supplier: AdminSupplier | null): FormState =>
  supplier
    ? {
        name: supplier.name,
        bin: supplier.bin ?? "",
        contact_phone: supplier.contact_phone ?? "",
        contact_email: supplier.contact_email ?? "",
        note: supplier.note ?? "",
        active: supplier.active,
      }
    : { ...emptyForm }

// Пустая строка → null (валидатор бэкенда: поля nullable, но min(1) когда заданы).
const orNull = (value: string) => {
  const trimmed = value.trim()
  return trimmed === "" ? null : trimmed
}

// Drawer создания/правки поставщика (реестр закупа). Создание — POST
// /admin/procurement/suppliers; правка/деактивация — POST /.../:id. «Активен» —
// только при правке (мягкое удаление; создаётся всегда активным). Идиома
// material-norm-drawer.
const SupplierDrawer = ({ supplier, open, onClose }: SupplierDrawerProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(() => toForm(supplier))

  useEffect(() => {
    if (open) {
      setForm(toForm(supplier))
    }
  }, [open, supplier])

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      sdk.client.fetch<AdminSupplierResponse>(
        supplier
          ? `/admin/procurement/suppliers/${supplier.id}`
          : "/admin/procurement/suppliers",
        { method: "POST", body }
      ),
    onSuccess: () => {
      toast.success(t("procurement.toast.supplierSaved"))
      queryClient.invalidateQueries({ queryKey: ["procurement-suppliers"] })
      onClose()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const set = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }))

  const canSave = form.name.trim() !== ""

  const save = () =>
    saveMutation.mutate({
      name: form.name.trim(),
      bin: orNull(form.bin),
      contact_phone: orNull(form.contact_phone),
      contact_email: orNull(form.contact_email),
      note: orNull(form.note),
      // active шлём только при правке — создание всегда активно.
      ...(supplier ? { active: form.active } : {}),
    })

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title>
            {t(
              supplier
                ? "procurement.supplierDrawer.editTitle"
                : "procurement.supplierDrawer.createTitle"
            )}
          </Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="supplier-name">
              {t("procurement.supplierDrawer.name")}
            </Label>
            <Input
              id="supplier-name"
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="supplier-bin">
              {t("procurement.supplierDrawer.bin")}
            </Label>
            <Input
              id="supplier-bin"
              value={form.bin}
              onChange={(e) => set({ bin: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="supplier-phone">
              {t("procurement.supplierDrawer.phone")}
            </Label>
            <Input
              id="supplier-phone"
              value={form.contact_phone}
              onChange={(e) => set({ contact_phone: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="supplier-email">
              {t("procurement.supplierDrawer.email")}
            </Label>
            <Input
              id="supplier-email"
              type="email"
              value={form.contact_email}
              onChange={(e) => set({ contact_email: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="supplier-note">
              {t("procurement.supplierDrawer.note")}
            </Label>
            <Input
              id="supplier-note"
              value={form.note}
              onChange={(e) => set({ note: e.target.value })}
            />
          </div>
          {supplier && (
            <div className="flex items-center gap-x-2">
              <Switch
                id="supplier-active"
                checked={form.active}
                onCheckedChange={(v) => set({ active: v })}
              />
              <Label htmlFor="supplier-active">
                {t("procurement.supplierDrawer.active")}
              </Label>
            </div>
          )}
          <Text size="small" className="text-ui-fg-subtle">
            {t("procurement.supplierDrawer.hint")}
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

export default SupplierDrawer
