import { Badge, Button, Drawer, Prompt, Table, Text, toast } from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { formatDate } from "../lib/date"
import {
  AdminReceiptResponse,
  AdminSuppliersResponse,
  RECEIPT_SOURCE_LABELS,
  RECEIPT_STATUS_META,
} from "../lib/procurement"
import { formatTenge } from "../lib/money"
import { sdk } from "../lib/sdk"

type ReceiptDetailDrawerProps = {
  receiptId: string | null
  open: boolean
  onClose: () => void
}

// Карточка прихода (drawer): статус, поставщик, позиции и — у проведённого —
// партии себестоимости. Черновик можно провести кнопкой (POST /:id/post → остаток
// склада + партии) либо удалить (DELETE, только черновик). Идиома order-lifecycle:
// read + действия перехода. Ошибка проводки остаётся НА ЭКРАНЕ (тост гаснет за
// секунды, и закупщик решал, что кнопка не сработала — Ф-прогон T4.6).
const ReceiptDetailDrawer = ({
  receiptId,
  open,
  onClose,
}: ReceiptDetailDrawerProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [postError, setPostError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    setPostError(null)
    setDeleteOpen(false)
  }, [receiptId, open])

  const { data, isLoading } = useQuery({
    queryKey: ["procurement-receipts", receiptId],
    queryFn: () =>
      sdk.client.fetch<AdminReceiptResponse>(
        `/admin/procurement/receipts/${receiptId}`
      ),
    enabled: open && !!receiptId,
  })
  const receipt = data?.receipt ?? null

  // Имена поставщиков (id → name) для читаемой атрибуции.
  const { data: suppliersData } = useQuery({
    queryKey: ["procurement-suppliers", "all"],
    queryFn: () =>
      sdk.client.fetch<AdminSuppliersResponse>("/admin/procurement/suppliers"),
    enabled: open,
  })
  const supplierName = useMemo(() => {
    const map = new Map(
      (suppliersData?.suppliers ?? []).map((s) => [s.id, s.name])
    )
    return receipt?.supplier_id ? map.get(receipt.supplier_id) ?? null : null
  }, [suppliersData, receipt])

  // Заголовок строки по её id — для подписи партий (batch.receipt_line_id).
  const lineTitleById = useMemo(() => {
    const map = new Map<string, string>()
    for (const l of receipt?.lines ?? []) {
      map.set(l.id, l.recognized_title || t("procurement.receipt.unmatched"))
    }
    return map
  }, [receipt, t])

  const postMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch<AdminReceiptResponse>(
        `/admin/procurement/receipts/${receiptId}/post`,
        { method: "POST" }
      ),
    onSuccess: () => {
      setPostError(null)
      toast.success(t("procurement.toast.posted"))
      queryClient.invalidateQueries({ queryKey: ["procurement-receipts"] })
    },
    onError: (error: Error) => {
      setPostError(error.message)
      toast.error(t("procurement.receipt.postFailed"))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () =>
      sdk.client.fetch(`/admin/procurement/receipts/${receiptId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success(t("procurement.toast.draftDeleted"))
      queryClient.invalidateQueries({ queryKey: ["procurement-receipts"] })
      setDeleteOpen(false)
      onClose()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const statusMeta = receipt ? RECEIPT_STATUS_META[receipt.status] : null

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <Drawer.Content>
        <Drawer.Header>
          <div className="flex items-center gap-x-3">
            <Drawer.Title>{t("procurement.receipt.detailTitle")}</Drawer.Title>
            {statusMeta && (
              <Badge size="2xsmall" color={statusMeta.color}>
                {t(statusMeta.label)}
              </Badge>
            )}
          </div>
        </Drawer.Header>
        <Drawer.Body className="flex flex-col gap-y-5 overflow-y-auto">
          {!receipt ? (
            <Text size="small" className="text-ui-fg-subtle">
              {t("common.loading")}
            </Text>
          ) : (
            <>
              {/* Шапка: атрибуты прихода */}
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <Field label={t("procurement.receipt.supplier")}>
                  {supplierName ?? t("procurement.receipts.noSupplier")}
                </Field>
                <Field label={t("procurement.receipt.reference")}>
                  {receipt.reference ?? "—"}
                </Field>
                <Field label={t("procurement.receipt.receivedAt")}>
                  {formatDate(receipt.received_at)}
                </Field>
                <Field label={t("procurement.receipt.source")}>
                  {t(RECEIPT_SOURCE_LABELS[receipt.source])}
                </Field>
                <Field label={t("procurement.receipt.total")}>
                  {formatTenge(receipt.total_cost)}
                </Field>
                {receipt.note && (
                  <Field label={t("procurement.receipt.note")}>
                    {receipt.note}
                  </Field>
                )}
              </div>

              {/* Позиции */}
              <div className="flex flex-col gap-y-2">
                <Text size="small" weight="plus">
                  {t("procurement.receipt.linesTitle")}
                </Text>
                <Table>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>
                        {t("procurement.receipt.colTitle")}
                      </Table.HeaderCell>
                      <Table.HeaderCell>
                        {t("procurement.receipt.colQty")}
                      </Table.HeaderCell>
                      <Table.HeaderCell>
                        {t("procurement.receipt.colUnitCost")}
                      </Table.HeaderCell>
                      <Table.HeaderCell>
                        {t("procurement.receipt.colLineCost")}
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {receipt.lines.map((l) => (
                      <Table.Row key={l.id}>
                        <Table.Cell>
                          {l.recognized_title ?? (
                            <span className="text-ui-fg-muted">
                              {t("procurement.receipt.unmatched")}
                            </span>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {l.quantity} {l.unit}
                        </Table.Cell>
                        <Table.Cell>{formatTenge(l.unit_cost)}</Table.Cell>
                        <Table.Cell>{formatTenge(l.line_cost)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </div>

              {/* Партии (у проведённого) */}
              {receipt.batches.length > 0 && (
                <div className="flex flex-col gap-y-2">
                  <Text size="small" weight="plus">
                    {t("procurement.receipt.batchesTitle")}
                  </Text>
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>
                          {t("procurement.receipt.colTitle")}
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                          {t("procurement.receipt.colRemaining")}
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                          {t("procurement.receipt.colUnitCost")}
                        </Table.HeaderCell>
                        <Table.HeaderCell>
                          {t("procurement.receipt.colExpires")}
                        </Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {receipt.batches.map((b) => (
                        <Table.Row key={b.id}>
                          <Table.Cell>
                            {lineTitleById.get(b.receipt_line_id) ?? "—"}
                          </Table.Cell>
                          <Table.Cell>
                            {b.quantity_remaining} / {b.quantity_received}
                          </Table.Cell>
                          <Table.Cell>{formatTenge(b.unit_cost)}</Table.Cell>
                          <Table.Cell>{formatDate(b.expires_at)}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </div>
              )}

              {receipt.status === "draft" && (
                <Text size="small" className="text-ui-fg-subtle">
                  {t("procurement.receipt.postHint")}
                </Text>
              )}

              {/* Причина неудачной проводки — на экране, пока не проведут заново. */}
              {postError && (
                <div className="border-ui-border-error bg-ui-bg-subtle flex flex-col gap-y-1 rounded-lg border p-3">
                  <Text size="small" weight="plus" className="text-ui-fg-error">
                    {t("procurement.receipt.postFailed")}
                  </Text>
                  <Text size="xsmall" className="text-ui-fg-muted">
                    {postError}
                  </Text>
                </div>
              )}
            </>
          )}
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button size="small" variant="secondary">
              {t("common.close")}
            </Button>
          </Drawer.Close>
          {receipt?.status === "draft" && (
            <Prompt open={deleteOpen} onOpenChange={setDeleteOpen}>
              <Prompt.Trigger asChild>
                <Button size="small" variant="danger">
                  {t("procurement.receipt.deleteDraft")}
                </Button>
              </Prompt.Trigger>
              <Prompt.Content>
                <Prompt.Header>
                  <Prompt.Title>
                    {t("procurement.receipt.deleteDraftTitle")}
                  </Prompt.Title>
                  <Prompt.Description>
                    {t("procurement.receipt.deleteDraftDescription")}
                  </Prompt.Description>
                </Prompt.Header>
                <Prompt.Footer>
                  <Prompt.Cancel>{t("common.cancel")}</Prompt.Cancel>
                  <Prompt.Action
                    onClick={(event) => {
                      event.preventDefault()
                      deleteMutation.mutate()
                    }}
                  >
                    {t("procurement.receipt.deleteDraftConfirm")}
                  </Prompt.Action>
                </Prompt.Footer>
              </Prompt.Content>
            </Prompt>
          )}
          {receipt?.status === "draft" && (
            <Button
              size="small"
              isLoading={postMutation.isPending}
              disabled={isLoading}
              onClick={() => postMutation.mutate()}
            >
              {postError
                ? t("procurement.receipt.postRetry")
                : t("procurement.receipt.post")}
            </Button>
          )}
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  )
}

// Пара «подпись + значение» для шапки карточки.
const Field = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-y-1">
    <Text size="xsmall" className="text-ui-fg-subtle">
      {label}
    </Text>
    <Text size="small">{children}</Text>
  </div>
)

export default ReceiptDetailDrawer
