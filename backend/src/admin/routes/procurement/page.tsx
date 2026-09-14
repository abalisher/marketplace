import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArchiveBox, Plus } from "@medusajs/icons"
import {
  Button,
  Container,
  Heading,
  Table,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import ReceiptCreateDrawer from "../../components/receipt-create-drawer"
import ReceiptDetailDrawer from "../../components/receipt-detail-drawer"
import SupplierRegistry from "../../components/supplier-registry"
import { formatDate } from "../../lib/date"
import {
  AdminReceiptsResponse,
  AdminSuppliersResponse,
  RECEIPT_STATUS_META,
} from "../../lib/procurement"
import { formatTenge } from "../../lib/money"
import { sdk } from "../../lib/sdk"
import { routeLabel } from "../../lib/route-label"

// Экран «Закуп»: приходы + реестр поставщиков. Данные приходов — GET
// /admin/procurement/receipts (новые сверху, со строками). Кнопка «Новый приход»
// → форма (склад → поставщик → строки → провести); клик по строке → карточка
// прихода. Простая таблица (идиома material-norms): эндпоинт без серверной
// пагинации/поиска, приходов немного.
//
// Поставщики стоят здесь же (T4.7): раньше реестр жил в настройках, куда обычному
// продавцу вход закрыт оболочкой T4.1a — закупщик в Ф-прогоне T4.6 не нашёл, где
// завести поставщика, и приходы оставались без него.
const ProcurementPage = () => {
  const { t } = useTranslation()
  const [createOpen, setCreateOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["procurement-receipts", "list"],
    queryFn: () =>
      sdk.client.fetch<AdminReceiptsResponse>("/admin/procurement/receipts"),
  })
  const receipts = data?.receipts ?? []

  const { data: suppliersData } = useQuery({
    queryKey: ["procurement-suppliers", "all"],
    queryFn: () =>
      sdk.client.fetch<AdminSuppliersResponse>("/admin/procurement/suppliers"),
  })
  const supplierNames = useMemo(
    () =>
      new Map((suppliersData?.suppliers ?? []).map((s) => [s.id, s.name])),
    [suppliersData]
  )

  // Сколько денег ещё не оприходовано: закупщик складывал это на калькуляторе
  // (Ф-прогон T4.6).
  const drafts = receipts.filter((r) => r.status === "draft")
  const draftTotal = drafts.reduce((sum, r) => sum + Number(r.total_cost ?? 0), 0)

  return (
    <div className="flex flex-col gap-y-3">
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">{t("procurement.receipts.title")}</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {drafts.length
              ? t("procurement.receipts.draftsTotal", {
                  count: drafts.length,
                  total: formatTenge(draftTotal),
                })
              : t("procurement.receipts.noDrafts")}
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={() => setCreateOpen(true)}>
          <Plus />
          {t("procurement.receipts.newReceipt")}
        </Button>
      </div>

      {receipts.length ? (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                {t("procurement.receipts.colReference")}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {t("procurement.receipts.colSupplier")}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {t("procurement.receipts.colLines")}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {t("procurement.receipts.colTotal")}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {t("procurement.receipts.colReceivedAt")}
              </Table.HeaderCell>
              <Table.HeaderCell>{t("common.status")}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {receipts.map((r) => {
              const meta = RECEIPT_STATUS_META[r.status]
              return (
                <Table.Row
                  key={r.id}
                  className="cursor-pointer"
                  onClick={() => setDetailId(r.id)}
                >
                  <Table.Cell>{r.reference || "—"}</Table.Cell>
                  <Table.Cell>
                    {r.supplier_id
                      ? supplierNames.get(r.supplier_id) ??
                        t("procurement.receipts.noSupplier")
                      : t("procurement.receipts.noSupplier")}
                  </Table.Cell>
                  <Table.Cell>{r.lines.length}</Table.Cell>
                  <Table.Cell>{formatTenge(r.total_cost)}</Table.Cell>
                  <Table.Cell>{formatDate(r.received_at)}</Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-x-2">
                      <div className={`size-2 rounded-full ${meta.dotClass}`} />
                      <span>{t(meta.label)}</span>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      ) : (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {isLoading ? t("common.loading") : t("procurement.receipts.empty")}
          </Text>
        </div>
      )}

      <ReceiptCreateDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onOpenReceipt={setDetailId}
      />
      <ReceiptDetailDrawer
        receiptId={detailId}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
      />
    </Container>

    <SupplierRegistry />
    </div>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Procurement", ru: "Закуп" }),
  icon: ArchiveBox,
})

export default ProcurementPage
