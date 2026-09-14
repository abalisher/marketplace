import { EllipsisHorizontal, PencilSquare, Plus } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  DropdownMenu,
  Heading,
  IconButton,
  Table,
  Text,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import SupplierDrawer from "./supplier-drawer"
import { AdminSupplier, AdminSuppliersResponse } from "../lib/procurement"
import { sdk } from "../lib/sdk"

// Реестр поставщиков: список + drawer создания/правки. «Удаление» — мягкое
// (переключатель «Активен» в drawer: приход ссылается на поставщика опазной
// колонкой, hard-DELETE осиротил бы её).
//
// Живёт на экране «Закуп», а НЕ в настройках: поставщик — рабочие данные
// закупщика, а не конфиг платформы, и настройки продавцу не видны вовсе
// (оболочка T4.1a). В Ф-прогоне T4.6 закупщик обошёл настройки, «Компании» и
// поиск и не нашёл, где завести поставщика — приход уходил вообще без него.
const SupplierRegistry = () => {
  const { t } = useTranslation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<AdminSupplier | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["procurement-suppliers", "registry"],
    queryFn: () =>
      sdk.client.fetch<AdminSuppliersResponse>("/admin/procurement/suppliers"),
  })
  const suppliers = data?.suppliers ?? []

  const openCreate = () => {
    setEditing(null)
    setDrawerOpen(true)
  }
  const openEdit = (supplier: AdminSupplier) => {
    setEditing(supplier)
    setDrawerOpen(true)
  }

  const contactOf = (s: AdminSupplier) =>
    s.contact_phone || s.contact_email || "—"

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">{t("procurement.suppliers.title")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("procurement.suppliers.subtitle")}
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={openCreate}>
          <Plus />
          {t("procurement.suppliers.addSupplier")}
        </Button>
      </div>

      {suppliers.length ? (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>
                {t("procurement.suppliers.colName")}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {t("procurement.suppliers.colBin")}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {t("procurement.suppliers.colContact")}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {t("procurement.suppliers.colStatus")}
              </Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {suppliers.map((s) => (
              <Table.Row key={s.id}>
                <Table.Cell>{s.name}</Table.Cell>
                <Table.Cell>{s.bin || "—"}</Table.Cell>
                <Table.Cell>{contactOf(s)}</Table.Cell>
                <Table.Cell>
                  <Badge size="2xsmall" color={s.active ? "green" : "grey"}>
                    {t(
                      s.active
                        ? "procurement.suppliers.active"
                        : "procurement.suppliers.inactive"
                    )}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <DropdownMenu>
                    <DropdownMenu.Trigger asChild>
                      <IconButton size="small" variant="transparent">
                        <EllipsisHorizontal />
                      </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Item
                        className="gap-x-2"
                        onClick={() => openEdit(s)}
                      >
                        <PencilSquare className="text-ui-fg-subtle" />
                        {t("common.edit")}
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <div className="px-6 py-4">
          <Text size="small" className="text-ui-fg-subtle">
            {isLoading ? t("common.loading") : t("procurement.suppliers.empty")}
          </Text>
        </div>
      )}

      <SupplierDrawer
        supplier={editing}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Container>
  )
}

export default SupplierRegistry
