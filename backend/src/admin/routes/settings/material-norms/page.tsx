import { defineRouteConfig } from "@medusajs/admin-sdk"
import { EllipsisHorizontal, PencilSquare, Plus, Trash } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  DropdownMenu,
  Heading,
  IconButton,
  Table,
  Text,
  toast,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import MaterialNormDrawer from "../../../components/material-norm-drawer"
import {
  AdminMaterialNorm,
  AdminMaterialNormsResponse,
  NORM_BASE_LABELS,
} from "../../../lib/estimator"
import { sdk } from "../../../lib/sdk"
import { routeLabel } from "../../../lib/route-label"

// Справочник нормативов расхода (Settings → Material Norms) — список + drawer
// создания/правки (идиома product-moderation/bonus-program). Данные —
// GET/POST/DELETE /admin/material-norms.
const MaterialNormsPage = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<AdminMaterialNorm | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ["material-norms"],
    queryFn: () =>
      sdk.client.fetch<AdminMaterialNormsResponse>("/admin/material-norms"),
  })
  const norms = data?.material_norms ?? []

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      sdk.client.fetch(`/admin/material-norms/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success(t("estimator.toast.deleted"))
      queryClient.invalidateQueries({ queryKey: ["material-norms"] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const openCreate = () => {
    setEditing(null)
    setDrawerOpen(true)
  }
  const openEdit = (norm: AdminMaterialNorm) => {
    setEditing(norm)
    setDrawerOpen(true)
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>{t("estimator.norms.title")}</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            {t("estimator.norms.subtitle")}
          </Text>
        </div>
        <Button size="small" variant="secondary" onClick={openCreate}>
          <Plus />
          {t("estimator.norms.addNorm")}
        </Button>
      </div>

      {norms.length ? (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{t("estimator.norms.colCode")}</Table.HeaderCell>
              <Table.HeaderCell>{t("estimator.norms.colName")}</Table.HeaderCell>
              <Table.HeaderCell>
                {t("estimator.norms.colMaterial")}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {t("estimator.norms.colConsumption")}
              </Table.HeaderCell>
              <Table.HeaderCell>
                {t("estimator.norms.colActive")}
              </Table.HeaderCell>
              <Table.HeaderCell />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {norms.map((norm) => (
              <Table.Row key={norm.id}>
                <Table.Cell>{norm.code}</Table.Cell>
                <Table.Cell>{norm.name}</Table.Cell>
                <Table.Cell>{norm.material_kind}</Table.Cell>
                <Table.Cell>
                  {norm.consumption_per_unit} {norm.unit} ·{" "}
                  {t(NORM_BASE_LABELS[norm.base])}
                </Table.Cell>
                <Table.Cell>
                  <Badge size="2xsmall" color={norm.active ? "green" : "grey"}>
                    {t(norm.active ? "estimator.norms.active" : "estimator.norms.off")}
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
                        onClick={() => openEdit(norm)}
                      >
                        <PencilSquare className="text-ui-fg-subtle" />
                        {t("common.edit")}
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        className="gap-x-2"
                        disabled={deleteMutation.isPending}
                        onClick={() => deleteMutation.mutate(norm.id)}
                      >
                        <Trash className="text-ui-fg-subtle" />
                        {t("common.delete")}
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
            {isLoading ? t("common.loading") : t("estimator.norms.empty")}
          </Text>
        </div>
      )}

      <MaterialNormDrawer
        norm={editing}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: routeLabel({ en: "Material Norms", ru: "Нормы расхода" }),
})

export default MaterialNormsPage
