import { Button, Drawer, Input, Label, Text, Textarea, toast } from "@medusajs/ui"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import {
  AdminDocumentSettings,
  AdminDocumentSettingsResponse,
  DOCUMENT_SETTINGS_FIELDS,
} from "../lib/documents"
import { sdk } from "../lib/sdk"

type DocumentRequisitesDrawerProps = {
  settings: AdminDocumentSettings
  open: boolean
  onClose: () => void
}

type FormState = Record<string, string>

const toFormState = (settings: AdminDocumentSettings): FormState =>
  Object.fromEntries(
    DOCUMENT_SETTINGS_FIELDS.map(({ key }) => [key, settings[key] ?? ""])
  )

// Drawer правки реквизитов продавца — идиома bonus-config-drawer. Пустая строка
// у необязательного поля = null (сброс реквизита); seller_name обязателен.
// Сохранение — POST /admin/document-settings.
const DocumentRequisitesDrawer = ({
  settings,
  open,
  onClose,
}: DocumentRequisitesDrawerProps) => {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormState>(() => toFormState(settings))

  useEffect(() => {
    if (open) {
      setForm(toFormState(settings))
    }
  }, [open, settings])

  const saveMutation = useMutation({
    mutationFn: (body: Record<string, string | null>) =>
      sdk.client.fetch<AdminDocumentSettingsResponse>(
        "/admin/document-settings",
        { method: "POST", body }
      ),
    onSuccess: () => {
      toast.success("Document requisites updated")
      queryClient.invalidateQueries({ queryKey: ["document-settings"] })
      onClose()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const setField = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const canSave = form.seller_name?.trim() !== ""

  const save = () => {
    const body: Record<string, string | null> = {}
    for (const { key, required } of DOCUMENT_SETTINGS_FIELDS) {
      const value = form[key]?.trim() ?? ""
      // Обязательное поле отправляем как есть; необязательное пустое → null.
      body[key] = required ? value : value === "" ? null : value
    }
    saveMutation.mutate(body)
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
          <Drawer.Title>Edit document requisites</Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-6 overflow-y-auto">
          {DOCUMENT_SETTINGS_FIELDS.map(({ key, label, multiline, required }) => (
            <div key={key} className="flex flex-col gap-y-2">
              <Label htmlFor={`doc-${key}`}>
                {label}
                {required ? " *" : ""}
              </Label>
              {multiline ? (
                <Textarea
                  id={`doc-${key}`}
                  value={form[key] ?? ""}
                  onChange={(event) => setField(key, event.target.value)}
                />
              ) : (
                <Input
                  id={`doc-${key}`}
                  value={form[key] ?? ""}
                  onChange={(event) => setField(key, event.target.value)}
                />
              )}
            </div>
          ))}
          <Text size="small" className="text-ui-fg-subtle">
            These requisites are printed on generated invoices, waybills and
            internal acts. The footer note (e.g. «not an official ESF») appears
            at the bottom of each document.
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

export default DocumentRequisitesDrawer
